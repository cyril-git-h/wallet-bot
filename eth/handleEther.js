const Tx = require('ethereumjs-tx').Transaction;
const web3 = require('./web3');
const QRCode = require('qrcode');
const axios = require('axios');
const jsQR = require('jsqr');
const jpeg = require('jpeg-js');
const BigNumber = require('bn.js');


exports.getAddress = (privateKey) => {
    return web3.eth.accounts.privateKeyToAccount(privateKey).address
}

exports.showBalance = async (address) => {
    let result = await web3.eth.getBalance(address)
    let balance = BigInt(result).toString()
    balance = web3.utils.fromWei(balance, 'ether')
    return balance
}

exports.QRCodeFromAddress = async (address) => {
    let result = await QRCode.toDataURL(address)
    return result
}

exports.QRCodeToAddress = async (ctx) => {
    let photo = ctx.message.photo.pop()
    let imageUrl = await ctx.telegram.getFileLink(photo.file_id)
    let image = await axios.get(imageUrl, {responseType: 'arraybuffer'})
    let buffer = Buffer.from(image.data, 'base64')
    let jpegData = jpeg.decode(buffer, {useTArray: true})
    let {data: address} = jsQR(jpegData.data, photo.width, photo.height)
    return address
}

exports.checkAddress = (address) => {
    return web3.utils.checkAddressChecksum(address)
}

exports.toAddress = (address) => {
    return web3.utils.toChecksumAddress(address)
}

exports.sendEther = async (addressTo, amount, privateKey, addressFrom) => {
    let gasPrice = await axios.get('https://www.etherchain.org/api/gasPriceOracle')
    let gasPriceInWei = new BigNumber(web3.utils.toWei(gasPrice.data.fastest.toString(), 'gwei'))
    gasPriceInWei = gasPriceInWei.toString(16)
    let nonce = await web3.eth.getTransactionCount(addressFrom)
    nonce = nonce.toString(16)
    let amountInWei = new BigNumber(web3.utils.toWei(amount, 'ether'))
    amountInWei = amountInWei.toString(16)
    let rawTx = {
        nonce: '0x' + nonce,
        gasPrice: '0x' + gasPriceInWei,
        gasLimit: '0x5208', // '0x7530',
        to: addressTo,
        value: '0x' + amountInWei // '0x5af3107a4000'
    }
    let tx = new Tx(rawTx)
    let privateKeyBuffer = Buffer.from(privateKey, 'hex')
    tx.sign(privateKeyBuffer)
    let serializedTx = tx.serialize()
    return await web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`)
        .on('receipt', console.log)
        .then(() => `transaction was successfully made`)
        .catch(() => `insufficient funds. try again`)
}