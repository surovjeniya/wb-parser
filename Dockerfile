FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
    chromium@edge \
    nss@edge
ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/main.js" ]