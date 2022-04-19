#!/bin/sh

DIR=/docker-entrypoint.d

if test -d "$DIR"; then
    /bin/run-parts "$DIR" || exit 1
fi

[ ! -z ${ASPNETCORE_URLS} ] && [ ! -z ${PORT} ] && ASPNETCORE_URLS=http://*:${PORT}
exec "$@"
