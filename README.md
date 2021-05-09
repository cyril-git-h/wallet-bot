# wallet-bot
Personal ethereum wallet within a telegram bot

https://t.me/ThePEWbot

## About

With this Telegram bot you can use up to five Ethereum private keys, sign transactions with them, get QR code corresponding to associated address and send Ether to address with photo of its QR code.
The bot based on Telegraf library uses Redis for caching addresses and Posgresql for storing keys.

## Install Geth

For Ubuntu:
```
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```

## Run the node
```
geth --syncmode light --http --http.addr 0.0.0.0 --http.port 8545
```
or more securely via ngrok:
```
geth --syncmode light --http --http.addr localhost --http.vhosts=<domain>.ngrok.io --http.port 8545
```

## Create .env file

```
BOT_TOKEN=YOUR_TOKEN
POSTGRES_USER=
POSTGRES_PASSWORD=
API_URL=http://172.17.0.1:8545 //points to host
or API_URL=https://<domain>.ngrok.io
```

## Get containers using docker-compose and run them

```
docker-compose up
```
