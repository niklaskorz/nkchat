FROM node:12

ENV PORT 3000

COPY . /server
WORKDIR /server
RUN yarn --frozen-lockfile
RUN yarn build

EXPOSE 3000

CMD ["node", "./build/index.js"]
