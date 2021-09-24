FROM jrottenberg/ffmpeg:4.1-alpine as ffmpeg
FROM node:16.6-alpine3.11

RUN apk add --no-cache --update \
    libgcc \
    libstdc++ \
    python3 \
    && npm install -g pnpm

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

COPY . .

# copy ffmpeg bins from first image
COPY --from=ffmpeg /usr/local /usr/local

CMD ["pnpm", "start"]