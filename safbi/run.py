#!/usr/bin/env python
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple

from views import app


def simple(env, resp):
    resp("200 OK", [("Content-Type", "text/plain")])
    return [b"Hello WSGI World"]


addr = app.config.get('BIND', '0.0.0.0')
port = app.config.get('PORT', 7007)
root = app.config.get('APPLICATION_ROOT', '/')
main = DispatcherMiddleware(simple, {root: app})


if __name__ == "__main__":
    run_simple(addr, port, disp)
