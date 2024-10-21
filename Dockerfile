FROM node:18.20.3

COPY package*.json ./
RUN npm install

COPY . .
RUN node deploy-commands.js

CMD [ "node", "index.js" ]g