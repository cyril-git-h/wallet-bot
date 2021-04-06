const Markup = require('telegraf/markup');
const { dbHandlers } = require('./Controllers/dbHandlers');

exports.mainKeyboard = () => Markup.keyboard(['❖ Wallet', '📋 About']).resize().extra()
exports.backKeyboard = () => Markup.keyboard(['🔙 Return']).resize().extra()
exports.removeKeyboard = () => Markup.removeKeyboard().extra()

exports.optionsKeyboard = () => Markup.inlineKeyboard([
[
    Markup.callbackButton('♢ Receive Ether', 'receiveEth'),
    Markup.callbackButton('♢ Send Ether', 'sendEth')
],
[Markup.callbackButton('Select account', 'selectAccount')],
[Markup.callbackButton('Add new account', 'addAccount')],
[Markup.callbackButton('Remove this account', 'removeAccount')]
]).extra()

exports.sendingOptionsKeyboard = () => Markup.inlineKeyboard([
    [Markup.callbackButton('I have an address', 'sendWithAddress')],
    [Markup.callbackButton('I have QR code', 'sendWithQRCode')],
]).extra()

exports.exitKeyboard = () => Markup.keyboard(['🔙 Return', 'Exit']).resize().extra()

async function getNewArray (ctx) {
    let newArr = []
    let {rows} = await dbHandlers.findAddressByID(ctx.from.id)
    rows.map(key => newArr.push([Markup.callbackButton(`${key.private_key}`, `${key.private_key}`)]))
    return newArr
}

exports.selectAccountKeyboard = async (ctx) =>{
    let newArr = await getNewArray(ctx)
    newArr.length > 1 ?
     ctx.reply('Choose an account below', Markup.inlineKeyboard(await getNewArray(ctx)).resize().extra()) :
     ctx.reply('You have only one account')
}