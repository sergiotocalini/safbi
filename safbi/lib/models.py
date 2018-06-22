#!/usr/bin/env python
from datetime import date, datetime
from pony.orm import *

db = Database()

class User(db.Entity):
    _table_ = 'users'
    id = PrimaryKey(int, auto=True)
    userid = Required(unicode, unique=True)
    displayname = Required(unicode)
    email = Required(unicode, unique=True)
    password = Optional(unicode)
    avatar = Required(unicode)
    status = Required(bool, default=False)
    admin = Required(bool, default=False)
    created_on = Required(datetime, sql_type='TIMESTAMP', 
                          sql_default='CURRENT_TIMESTAMP',
                          default=datetime.now)
    last_seen = Required(datetime, sql_type='TIMESTAMP',
                         sql_default='CURRENT_TIMESTAMP',
                         default=datetime.now)
    title = Optional(unicode)
    lang = Optional(unicode)
    tz = Optional(unicode)

class Config(db.Entity):
    _table_ = 'configs'
    id = PrimaryKey(int, auto=True)
    key = Required(unicode, unique=True)
    value = Required(Json)
