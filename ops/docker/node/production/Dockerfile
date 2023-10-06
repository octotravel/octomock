FROM node:18.18.0-alpine3.17

WORKDIR /var/www/

COPY . .

RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python
RUN npm install

ENV NODE_ENV=production

RUN npm run build

EXPOSE $APP_PORT

RUN chown -R node /var/www

USER node

RUN cd dist && ls -la

CMD ["node", "./dist/index.js"]
