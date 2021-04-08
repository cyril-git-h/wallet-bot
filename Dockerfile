FROM node:alpine
WORKDIR /usr/src/app
COPY . .
COPY wait-for-it.sh .
RUN apk update && apk add bash
RUN npm install
CMD ["npm", "start"]