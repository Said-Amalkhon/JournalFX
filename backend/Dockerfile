FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /data

EXPOSE 4000

CMD ["node", "--experimental-sqlite", "server.js"]
