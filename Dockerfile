FROM node

WORKDIR /usr/app
COPY package.json yarn.lock ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]