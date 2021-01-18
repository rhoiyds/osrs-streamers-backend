FROM node:15
EXPOSE 8080 3000

COPY . .
RUN rm .env.development.local
RUN echo exit 0 > /usr/sbin/policy-rc.d
RUN apt-get -y update && apt-get -y install supervisor
RUN npm install
CMD ["supervisord","-c","/service_script.conf"]