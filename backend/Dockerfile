FROM node:8.15.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get -y update

ENV TZ=America/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
