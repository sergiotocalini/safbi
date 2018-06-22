#!/usr/bin/env python
import os

class Config(object):
    BIND = '0.0.0.0'
    PORT = 7007
    DEBUG = False
    CSRF_ENABLED = True
    SECRET_KEY = 'Sho~mahx1movahtho'
    APPLICATION_ROOT = '/safbi'
    CDN_BOOTSTRAP = "//maxcdn.bootstrapcdn.com/bootstrap/3.3.7"
#    CDN_FONTAWESOME = "//maxcdn.bootstrapcdn.com/font-awesome/4.7.0"
    CDN_FONTAWESOME = "/safbi/static/extras/fontawesome/5.0.13"
    CDN_JQUERY = '//cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1'
#    CDN_COMMON = ''
#    CDN_DATATABLES = ''
#    CDN_MAVAPA = ''
    DB_DEBUG = False
    DB_TYPE = 'mysql'
    DB_PORT = 3306
    DB_NAME = 'safbi'
    ZABBIX_HOST = "http://localhost/zabbix"
    ZABBIX_USER = "Admin"
    ZABBIX_PASS = "zabbix"

class Local(Config):
    DEBUG = True
    DB_DEBUG = True
    DB_HOST = 'localhost'
    DB_USER = 'safbi_local_admin'
    DB_PASS = 'pedro12345'
#    MAVAPA_URL = 'http://localhost:7001/mavapa'
#    CLIENT_ID = 'MjjJVBFCmFsFsPYaip662zCd'
#    CLIENT_SECRET = 'qXOxQ0NzYdBOZ9TWChXU41t8'
#    REDIRECT_URI = 'http://localhost:7006/pichai/oauth/code/'
