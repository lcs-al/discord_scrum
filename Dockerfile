FROM node:18.20.8

COPY package*.json ./
RUN npm install

COPY . .
RUN node deploy-commands.js

CMD [ "npm", "start" ]