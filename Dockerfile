FROM node:18.7

COPY package*.json ./
RUN npm install

COPY . .
RUN node deploy-commands.js

CMD [ "node", "index.js" ]g