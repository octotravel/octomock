FROM node:18.7.0-alpine3.15

RUN apk add --no-cache libc6-compat

WORKDIR /var/www/

COPY . .

EXPOSE $PORT

RUN npm install -g node-gyp tsx

CMD ["sh", "-c", "npm install && npm run dev"]
