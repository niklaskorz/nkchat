FROM node:9.8

COPY . /client
WORKDIR /client
RUN yarn --frozen-lockfile
RUN yarn build

EXPOSE 3000

CMD ["yarn", "serve", "--port", "3000", "--clipless"]
