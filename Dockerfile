FROM node:16-alpine

VOLUME /srv

WORKDIR /app
COPY . .

RUN npm ci

ENV DOCKER_S3_CONTENT_PATH=/srv

CMD ["npm", "run", "cdk:deploy", "--", "--require-approval", "never"]

