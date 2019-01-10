
#!/usr/bin/env python
import os
#import arrow
import urllib
import json
import numpy as np
import pandas as pd
from datetime import datetime
#from dateutil.relativedelta import relativedelta
from functools import wraps
from flask import Flask, request, render_template, jsonify
from flask import url_for, abort, redirect, session
from lib import *
#from mavapa import mavapa, get_user_data
from pyzabbix import ZabbixAPI

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(os.environ['APP_SETTINGS'])
app.secret_key = app.config['SECRET_KEY']
#app.register_blueprint(mavapa, url_prefix='/oauth/mavapa')

if not app.config.has_key('CDN_LOCAL'):
    app.config['CDN_LOCAL'] = '%s/static' %app.config.get('APPLICATION_ROOT', '')

if app.config['DB_TYPE'] == 'mysql':
    db.bind(app.config['DB_TYPE'], host=app.config['DB_HOST'],
            port=app.config['DB_PORT'], db=app.config['DB_NAME'],
            user=app.config['DB_USER'], passwd=app.config['DB_PASS'])
    db.generate_mapping(create_tables=True)
else:
    exit(0)
sql_debug(app.config.get('DB_DEBUG', False))

def safe_execute(default, exception, function, *args):
    try:
        return function(*args)
    except exception:
        return default

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = session['access_token'] if session.has_key('access_token') else None
        user = session['user'] if session.has_key('user') else None
        if token is None or user is None:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def active_user(f):
    @wraps(f)
    @login_required
    def decorated_func(*args, **kwargs):
        if not session['user'].get('status', False):
            return redirect(url_for('unauthorized'))
        return f(*args, **kwargs)
    return decorated_func

def admin_required(f):
    @wraps(f)
    @active_user
    @db_session(retry=3)
    def decorated_func(*args, **kwargs):
        if not session['user'].get('admin'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_func

@db_session(retry=3)
def post_login():
    user = get_data('User', userid=session['user']['id'])
    if not user:
        user = User(userid=session['user']['id'],
                    email=session['user']['email'],
                    avatar=session['user']['avatar'],
                    displayname=session['user']['displayname'])
    else:
        user.set(email=session['user']['email'],
                 avatar=session['user']['avatar'],
                 displayname=session['user']['displayname'])
    session['user']['admin'] = user.admin
    session['user']['status'] = user.status
    commit()

@app.route('/fresh_u/')
def fresh_user():
    post_login()
    return redirect(url_for('index'))

@app.before_request
@db_session(retry=3)
def before_request():
    refresh_user = False
    if 'access_token' not in session:
        return
    if 'last_update' not in session:
        session['last_update'] = datetime.now()
        refresh_user = True
    else:
        if (datetime.now() - session['last_update']).seconds > 60:
            refresh_user = True
            session['last_update'] = datetime.now()
    if 'user' in session and refresh_user:
        # mavapa_user = get_user_data(session)
        # if mavapa_user:
        user = get_data('User', email=session['user']['email'])
        if user:
            user.last_seen = datetime.now()
            commit()
            session['user']['displayname'] = user.displayname
            session['user']['id'] = user.id
            session['user']['title'] = user.title
            session['user']['avatar'] = user.avatar
            session['user']['admin'] = user.admin
            session['user']['status'] = user.status
        else:
            logout()

@db_session(retry=3)
def get_data(table, **kwargs):
    if kwargs:
        return eval(table).get(**kwargs)
    else:
        return select(o for o in eval(table))

@app.route('/')
@active_user
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
#   return redirect(url_for('mavapa.login', next=request.url))
    if not session.get('user'):
        if request.method == 'POST':
            user = get_data('User', email=request.form['email'])
            if user:
                session['user'] = {}
                session['user']['displayname'] = user.displayname
                session['user']['id'] = user.id
                session['user']['title'] = user.title
                session['user']['avatar'] = user.avatar
                session['user']['admin'] = user.admin
                session['user']['status'] = user.status
                session['user']['email'] = user.email
                session['access_token'] = 1231543656
                next_url = session.pop('next_url', None)
                if next_url is None:
                    next_url = request.args.get("next")
                    if next_url is None:
                        next_url = url_for('index')
                return redirect(urllib.unquote(next_url))
        return render_template('login.html')
    else:
        next_url = session.pop('next_url', None)
        if next_url is None:
            next_url = request.args.get("next")
            if next_url is None:
                next_url = url_for('index')
        return redirect(urllib.unquote(next_url))

    
@app.route('/logout')
def logout():
#    return redirect(url_for('mavapa.logout'))
    session.pop('user', None)
    session.pop('access_token', None)
    return redirect(url_for('login'))


@app.route('/unauthorized')
def unauthorized():
    if not session['user'].get('status', False):
        return render_template('unauthorized.html')
    else:
        return redirect(url_for('index'))

    
@app.route('/admin', defaults={'section': 'general'})
@app.route('/admin/<section>')
@admin_required
def admin(section):
    if section == 'users':
        return render_template('admin/users.html')
    else:
        return render_template('admin/index.html')

    
@app.route('/monitoring', defaults={'section': 'general'})
@app.route('/monitoring/<section>')
@active_user
def monitoring(section):
    if section == 'capacity':
        return render_template('monitoring/capacity/index.html')
    elif section == 'inventory':
        return render_template('monitoring/inventory/index.html')
    elif section == 'events':
        return render_template('monitoring/events/index.html')
    else:
        return render_template('monitoring/index.html')


@app.route('/api/monitoring/problems')
@active_user
@db_session(retry=3)
def api_monitoring_problems():
    args = request.args.to_dict()
    data = []
    raw = []
    zapi = ZabbixAPI(app.config['ZABBIX_HOST'])
    zapi.login(app.config['ZABBIX_USER'], app.config['ZABBIX_PASS'])
    data = zapi.trigger.get(
        output=['description', 'priority', 'value', 'lastchange'],
        expandDescription=True, monitored=True, only_true=True,
        skipDependent=True, selectLastEvent='true', selectTags='true', selectItems=['itemid'],
        selectHosts=['host', 'maintenance_status', 'maintenance_type'],
        selectInventory=['software_full', 'hardware_full']
    )
    stats = {
        'total': len(data),
        'problems': len([d for d in data if d['value'] == '1' ])
    }
    return jsonify(datetime=datetime.now(), data=data, stats=stats)


@app.route('/api/monitoring/capacity')
@active_user
@db_session(retry=3)
def api_monitoring_capacity():
    args = request.args.to_dict()
    data = []
    raw = []
    zapi = ZabbixAPI(app.config['ZABBIX_HOST'])
    zapi.login(app.config['ZABBIX_USER'], app.config['ZABBIX_PASS'])
    data = zapi.host.get(
        output=['host', 'status', 'available'],
        sortfield=['host'],
        selectInventory=['hardware_full', 'software_full', 'name'],
        filter={'available': [1, 2]},
        groupids=[16]
    )
    return jsonify(datetime=datetime.now(), data=data, total=len(data))


@app.route('/api/monitoring/inventory')
@active_user
@db_session(retry=3)
def api_monitoring_inventory():
    args = request.args.to_dict()
    data = []
    raw = []
    zapi = ZabbixAPI(app.config['ZABBIX_HOST'])
    zapi.login(app.config['ZABBIX_USER'], app.config['ZABBIX_PASS'])
    hosts = zapi.host.get(
        output=['host', 'status', 'available', 'ipmi_available', 'jmx_available', 'snmp_available'],
        sortfield=['host'],
        selectInventory=['hardware_full', 'software_full'],
        filter={}
    )
    ifaces = pd.DataFrame(zapi.hostinterface.get())
    ifaces_attrs = ['interfaceid', 'ip', 'dns', 'port', 'type', 'useip', 'bulk', 'main']
    sites = []
    for h in hosts:
        h['inventory']['hardware_full'] = safe_execute({}, Exception, json.loads, h['inventory']['hardware_full'])
        h['inventory']['software_full'] = safe_execute({}, Exception, json.loads, h['inventory']['software_full'])
        h['ifaces'] = ifaces.loc[ifaces['hostid'] == h['hostid'], ifaces_attrs].to_dict(orient='records')
        sites.append(h['inventory']['hardware_full'].get('site'))
    stats = {
        'hosts': len(hosts),
        'sites': len([s for s in set(sites) if s])
    }
    return jsonify(datetime=datetime.now(), data=hosts, stats=stats, total=stats['hosts'])


@app.route('/api/admin/configs', methods=['GET', 'POST', 'DELETE', 'PUT'])
@db_session(retry=3)
def api_admin_configs():
    yes = ["yes", "true", "t", "1"]
    args = request.args.to_dict()
    qfilter = dict((x, args[x]) for x in args if x in ['id', 'key'])
    if qfilter:
        config = get_data('Config', **qfilter)
        if config:
            data = []
            if request.method == 'PUT':
                content = request.get_json(silent=True)
                if content:
                    config.set(**content)
                    updated = True
                if updated:
                    commit()
            elif request.method == 'DELETE':
                config.delete()
                commit()
            else:
                data = config.to_dict(related_objects=False)
                return jsonify(datetime=datetime.now(), data=data)
            return jsonify(datetime=datetime.now(), data=data)
        else:
            abort(404)
    elif request.method == 'POST':
        content = request.get_json(silent=True)
        if content:
            Config(**content)
            commit()
    else:
        abort(400)
    return jsonify(datetime=datetime.now(), data=[])

@app.route('/api/admin/configs/all', methods=['GET'])
@db_session(retry=3)
def api_admin_configs_all():
    args = request.args.to_dict()
    args.setdefault('type', None)
    args.setdefault('filter', None)
    args.setdefault('sort', 'id')
    args.setdefault('order', 'asc')
    args.setdefault('search', None)
    args.setdefault('status', None)
    args.setdefault('priority', None)
    args.setdefault('requester', None)
    args.setdefault('offset', 0)
    args.setdefault('limit', 50)
    data = []
    raw = []
    raw = get_data('Config')
    if args['search']:
        raw = raw.filter(lambda c: args['search'].lower() in c.key.lower())

    if getattr(Customer, args['sort'], None):
        if args['order'] == 'desc':
            raw = raw.order_by(lambda o: desc(getattr(o, args['sort'])))
        else:
            raw = raw.order_by(lambda o: getattr(o, args['sort']))

    for i in raw.limit(int(args['limit']), offset=int(args['offset'])):
        row = i.to_dict(related_objects=False)
        data.append(row)
    return jsonify(datetime=datetime.now(), data=data, total=count(raw))

@app.route('/api/admin/users', methods=['GET', 'POST'])
@db_session(retry=3)
def api_admin_users():
    if request.method == 'GET':
        args = request.args.to_dict()
        qfilter = dict((x, args[x]) for x in args if x in ['id', 'email'])
        if qfilter:
            user = get_data('User', **qfilter)
            if user:
                data = [user.to_dict(exclude="password")]
                return jsonify(datetime=datetime.now(), data=data)
    elif request.method == 'POST':
        args = request.args.to_dict()
        qfilter = dict((x, args[x]) for x in args if x in ['id', 'email'])
        if qfilter:
            user = get_data('User', **qfilter)
            if user:
                content = request.get_json(silent=True)
                user.set(**content)
                commit()
        else:
            abort(400)
    return jsonify(datetime=datetime.now())

@app.route('/api/admin/users/all', methods=['GET'])
@db_session(retry=3)
def api_admin_users_all():
    args = request.args.to_dict()
    args.setdefault('type', None)
    args.setdefault('filter', None)
    args.setdefault('sort', 'name')
    args.setdefault('order', 'asc')
    args.setdefault('search', None)
    args.setdefault('offset', 0)
    args.setdefault('limit', 50)
    args.setdefault('status', None)
    only_user = ['id', 'userid', 'displayname', 'email', 'avatar',
                 'status', 'title', 'created_on', 'last_seen']
    only_team = ['id', 'name', 'description', 'mobile', 'avatar']
    data = []
    raw = get_data('User')
    if args['search']:
        raw = raw.filter(lambda o: args['search'].lower() in o.displayname.lower())

    if args['status']:
        raw = raw.filter(lambda o: args['status'] == o.status)

    if getattr(User, args['sort'], None):
        if args['order'] == 'desc':
            raw = raw.order_by(lambda o: desc(getattr(o, args['sort'])))
        else:
            raw = raw.order_by(lambda o: getattr(o, args['sort']))

    total = count(raw)
    if args['limit'] not in ["no", "false", "f", "-1", "None"]:
        raw = raw.limit(int(args['limit']), offset=int(args['offset']))

    for i in raw:
        row = i.to_dict(related_objects=False)
        # if args['filter'] != 'team' and i.team:
        #     team = i.team.to_dict(only_team)
        #     team['manager'] = i.team.manager.to_dict(only_user)
        #     row['team'] = team
        data.append(row)
    return jsonify(datetime=datetime.now(), data=data, total=total)


if __name__ == "__main__":
    app.run('0.0.0.0', 7007)
