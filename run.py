#!/usr/bin/env python
import os
from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware
from safbi import app

def simple(env, resp):
    resp(b'200 OK', [(b'Content-Type', b'text/plain')])
    return [b"Hello WSGI World"]

safbi = DispatcherMiddleware(simple, {app.config.get('APPLICATION_ROOT', '/'): app})

if __name__ == "__main__":
    run_simple(app.config.get('BIND', '0.0.0.0'), app.config.get('PORT', 7007), safbi)
