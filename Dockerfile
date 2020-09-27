FROM ubuntu:16.04
RUN apt-get update
RUN apt-get install nodejs -y 
RUN apt-get install npm -y
RUN apt-get install apt-utils -y

WORKDIR /usr/src/app

COPY . .

EXPOSE 8080
CMD ["nodejs", "app.js"]
