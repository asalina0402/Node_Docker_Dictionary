FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]
