FROM node:18-alpine AS development

WORKDIR /usr/src/app
COPY  *.json ./

COPY  . ./
RUN npm i -g npm && npm ci

FROM node:18-alpine AS builder
ENV NODE_ENV production


WORKDIR /usr/src/app
COPY  *.json ./

COPY . ./
COPY --from=development /usr/src/app/node_modules ./node_modules


RUN npm run build && npm prune --production


FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY  *.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
