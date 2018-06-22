#!/usr/bin/env python
import os
#import arrow
import urllib
from datetime import datetime, date, timedelta
#from dateutil.relativedelta import relativedelta
from functools import wraps
from flask import Flask, request, render_template, g, jsonify, json
from flask import url_for, abort, flash, redirect, session
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
    print('Database doesn\'t tested')
    exit(0)
sql_debug(app.config.get('DB_DEBUG', False))

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
    @db_session    
    def decorated_func(*args, **kwargs):
        if not session['user'].get('admin'):
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_func

@db_session
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
@db_session
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

@db_session
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

@app.route('/capacity')
@active_user
def capacity():
    return render_template('capacity.html')

@app.route('/inventory')
@active_user
def inventory():
    return render_template('inventory.html')

@app.route('/api/capacity')
@active_user
@db_session
def api_capacity():
    args = request.args.to_dict()
    data = []
    raw = []
    zapi = ZabbixAPI(app.config['ZABBIX_HOST'])
    zapi.login(app.config['ZABBIX_USER'], app.config['ZABBIX_PASS'])
    data=zapi.host.get(output=['host', 'status', 'available'], sortfield=['host'],
                       selectInventory=['hardware_full', 'software_full', 'name'],
                       filter={'available': [1, 2]}, groupids=[16])
    return jsonify(datetime=datetime.now(), data=data, total=len(data))

@app.route('/api/inventory')
@active_user
@db_session
def api_inventory():
    args = request.args.to_dict()
    data = []
    raw = []
    zapi = ZabbixAPI(app.config['ZABBIX_HOST'])
    zapi.login(app.config['ZABBIX_USER'], app.config['ZABBIX_PASS'])
    data=zapi.host.get(output=['host', 'status', 'available'], sortfield=['host'],
                       selectInventory=['hardware_full', 'software_full', 'name'],
                       filter={'available': [1, 2]})
    return jsonify(datetime=datetime.now(), data=data, total=len(data))

if __name__ == "__main__":
    app.run('0.0.0.0', 7007)
