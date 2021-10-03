FROM node:16.6-bullseye

WORKDIR /home

RUN apt update \
	&& apt install -y ffmpeg\
	&& npm install -g pnpm

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

COPY . .

CMD ["pnpm", "start"]