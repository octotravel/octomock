FROM node:18.18.0-alpine3.17

WORKDIR /var/www/
COPY . .

RUN apk add --no-cache libc6-compat

EXPOSE $APP_PORT

RUN npm install -g node-gyp tsx

RUN npm install

CMD ["sh", "-c", "npm run dev"]
