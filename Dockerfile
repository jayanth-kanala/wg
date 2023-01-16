FROM node:18-alpine

# Create app directory
WORKDIR /app

RUN apk add -U --no-cache \
    wireguard-tools

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

# Expose Ports
EXPOSE 51820/udp
EXPOSE 51821/tcp

# Bundle app source
COPY . .
COPY ui /app/dist/ui

# build
RUN pnpm build

# run
CMD pnpm start