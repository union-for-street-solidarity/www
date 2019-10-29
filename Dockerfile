# Use latest node version 8.x
FROM node:12.4.0-slim

# create app directory in container
RUN mkdir -p /app

# set /app directory as default working directory
WORKDIR /app

# only copy package.json initially so that `RUN npm install` layer is recreated only
# if there are changes in package.json
ADD package.json package-lock.json /app/

# --pure-lockfile: Don’t generate a package-lock.json lockfile
RUN npm install --pure-lockfile

# copy all file from current dir to /app in container
COPY . /app/

# expose port 8000
EXPOSE 8000

# cmd to start service
CMD [ "npm", "start" ]
