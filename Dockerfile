FROM docker:dind

COPY . /app
WORKDIR /app

CMD ["docker-compose", "up"]
