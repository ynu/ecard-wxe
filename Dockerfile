FROM node:7

ADD package.json /rsk/
ADD LICENSE.txt /rsk/
ADD src /rsk/src
ADD tools /rsk/tools
ADD ssl /rsk/ssl
WORKDIR /rsk

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN npm install
RUN ./node_modules/.bin/babel-node tools/run build --release
EXPOSE 3000

CMD node build/server.js
