###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16-bullseye As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN apt-get update
RUN apt-get install chromium -y
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD true

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:16-bullseye As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./


RUN apt-get update
RUN apt-get install chromium -y
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD true

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:16-bullseye As production


RUN apt-get update
RUN apt-get install chromium -y
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD true

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]