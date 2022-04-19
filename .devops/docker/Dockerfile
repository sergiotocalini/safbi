ARG version=master

FROM python:3-slim-bullseye
ARG version
WORKDIR /app
ENV PORT=5000
EXPOSE 5000
COPY ./.devops/docker/docker-entrypoint.sh  /
COPY ./.devops/docker/docker-entrypoint.d/* /docker-entrypoint.d/
COPY ./requirements.txt			    /app
RUN pip install -r requirements.txt
COPY ./safbi				    /app
RUN echo "${version}" > /app/VERSION
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "gunicorn", "run:main", "--workers=2", "--threads=4", "--worker-class=gthread", "--worker-tmp-dir", "/dev/shm", "-b", "0.0.0.0:5000", "--access-logfile=-", "--error-logfile=-" ]
