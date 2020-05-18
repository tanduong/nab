FROM node:13-alpine

WORKDIR /node

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY ./src ./src/

RUN npm run build

RUN ls

CMD [ "node", "./dist/graphql/index.js"]