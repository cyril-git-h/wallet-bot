const Web3 = require('web3');
const dotenv = require('dotenv');
dotenv.config()

module.exports = new Web3(new Web3.providers.HttpProvider(process.env.API_URL))