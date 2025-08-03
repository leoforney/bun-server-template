# Bun server template

Steps to get running

## 1. Install bun

https://bun.sh/

## 2. Create cloudflare tunnel

Instructions here: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel-api/

## 3. Install docker and docker compose

https://docs.docker.com/compose/

## 4. (Optional) Buy or setup spare computer with docker and docker compose

Look on ebay or fb marketplace, can easily find one for under $100.

You can also repurpose old computers lying around and install linux on it.

Once setup, create a docker context on your local machine to the remote server. I have a ssh proxy script that I use that looks like this

```shell
ssh -L /tmp/docker.sock:/var/run/docker.sock leo@192.168.1.44
```

Then you can create a local docker context like:

```shell
docker context create --docker host=unix:///tmp/docker.sock remote-server
```

When you want to deploy, just run that script, the context will establish automatically.

You can additionally setup docker server from that context in IntelliJ based ides. When done working, don't forget to close that connection, just type exit.

## 5. Create env files

You will need the following files with the following information:

```
$PROJ/.env.production:
TUNNEL_TOKEN=<CLOUDFLARE TUNNEL TOKEN HERE>
DATA_DIR=<THE HOST FOLDER YOU WANT TO USE FOR SERVER DATA>

$PROJ/frontend/.env.development:
VITE_API_URL=http://localhost:3000

$PROJ/frontend/.env.production

$PROJ/backend/.env.development:
PORT=3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password123

$PROJ/backend/.env.production
PORT=8084
ADMIN_EMAIL=admin@example.com # You can remove these admin user settings if you want
ADMIN_PASSWORD=password123
JWT_SECRET=<MAKE A RANDOM STRING>
```

## 6. Deploy

When ready, and you have your docker context setup on your local machine, just press "deploy to server" run config

Or you can run

`docker compose up -d`

Good luck and happy building