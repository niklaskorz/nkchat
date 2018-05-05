# nkchat

`nkchat` is a web chat application.

## License

Licensed under the [MIT license](LICENSE).

## Setup requirements

- Docker ([Windows](https://docs.docker.com/docker-for-windows/), [macOS](https://docs.docker.com/docker-for-mac/), [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/))
- Docker Compose (usually pre-installed by Docker, if not [see here](https://docs.docker.com/compose/install/))

## Setup

Clone the repository, enter the repository's directoy with a terminal and
execute the following commands:

```sh
docker-compose build
docker-compose up -d
```

`nkchat` will then be available at [http://localhost:9000](http://localhost:9000).

## Browser compatability

The following browsers are tested and supported:
- Chrome 65+
- Firefox 58+
- Microsoft Edge with EdgeHTML 17+
- Safari 10+

In general, these include the last two major versions of all mainstream
browsers. Support for Internet Explorer is not planned. Opera and Vivaldi
should be working fine as they use the same browser engine as Chrome, but they
are not actively tested.

The layout is currently optimized for desktop screens and therefore hard to
use on mobile devices like smartphones.

## Features

- Register, log in and log out
- Create and join rooms
- Send and receive messages
- Switch between rooms
- Send messages that include links to YouTube or aluhga videos, or images

## Sending links to videos or images

Links following these patterns will be embedded as videos:
- `https?://youtube.com/watch?v={videoId}`
- `https?://youtu.be/{videoId}`
- `https?://alugha.com/videos/{videoId}`

Links following these patterns will be embedded as images:
- `*.png`
- `*.jpe?g`
- `*.webp`
- `*.bmp`
- `*.tga`

## GraphQL API

For querying, mutating and subscribing to data, a
[GraphQL](https://graphql.org/learn/) API is used. 
You can inspect the GraphQL API by visiting
[http://localhost:9000/graphiql](http://localhost:9000/graphiql) and clicking
on the "Docs" button on the upper right corner.

## Scalability and load balancing

[Traefik](https://docs.traefik.io/) is used for routing and load balancing the
included microservices, i.e. the chat client and the GraphQL server.

You can start the server with e.g. four server instances by executing:
```sh
docker-compose up -d --scale server=4
```

Traefik will balance incoming traffic among the running server instances by
using [Weighted round robin](https://en.wikipedia.org/wiki/Weighted_round_robin)
by default.

You can inspect the running services and their health by accessing the
Traefik dashboard at [http://localhost:8080/dashboard](http://localhost:8080/dashboard).

When a chat message reaches a server instance, the other server instances
and their subscribed WebSocket clients are notified using the high-performance
[NATS messaging server](https://github.com/nats-io/gnatsd).
