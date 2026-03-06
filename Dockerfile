# use bun
FROM oven/bun:latest
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy the rest of the files except those in .dockerignore
COPY . .

# build nextjs
RUN bun run build

# expose the port
EXPOSE 3000
# start the app
CMD ["bun", "run", "start"]