#!/usr/bin/env python
# Default configuration

BIND = '0.0.0.0'
PORT = 7007
CSRF_ENABLED = True
SECRET_KEY = 'Sho~mahx1movahtho'
APPLICATION_ROOT = '/safbi'
DEBUG = False
PONY_DEBUG = False
PONY_GENERATE_MAPPING = dict(
    create_tables  = True,
    check_tables   = True
)
PONY = dict(
    provider = "sqlite",
    filename = ":memory:"
)
JSONIFY_PRETTYPRINT_REGULAR = False

CDN_BOOTSTRAP = "//maxcdn.bootstrapcdn.com/bootstrap/3.3.7"
#    CDN_FONTAWESOME = "//maxcdn.bootstrapcdn.com/font-awesome/4.7.0"
CDN_FONTAWESOME = "/safbi/static/extras/fontawesome/5.0.13"
CDN_JQUERY = '//cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1'
#    CDN_COMMON = ''
#    CDN_DATATABLES = ''
#    CDN_MAVAPA = ''
ZABBIX_HOST = "http://localhost/zabbix"
ZABBIX_USER = "Admin"
ZABBIX_PASS = "zabbix"
