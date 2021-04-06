
const { dbHandlers } = require('./Controllers/dbHandlers');
const { get, del, set } = require('./Controllers/redisHandlers');
const { showBalance, QRCodeFromAddress } = require('./eth/handleEther');
const { optionsKeyboard, sendingOptionsKeyboard } = require('./keyboards');

exports.receiveAction = async (ctx) => {
    let sessionAddress
    try {
        let userCurrentAddress = `current_address:${ctx.from.id}`
        sessionAddress = await get(userCurrentAddress)
    } catch (e) {
        console.log(e)
    }
    if (!sessionAddress) {
        return ctx.reply('I cannot do it right now')
    }
    let buffer
    try {
        buffer = await QRCodeFromAddress(sessionAddress)
    } catch {
        return ctx.reply('I cannot do it right now')
    }
    await ctx.replyWithHTML(`<b><i>${sessionAddress}</i></b>`)
    await ctx.replyWithPhoto({ source: Buffer.from(buffer.split(',')[1], 'base64') })
    return
}

exports.sendingOptionAction = (ctx) => {
    return ctx.reply('Select your option', sendingOptionsKeyboard())
}

exports.removeAccount = async (ctx) => {
    let userCurrentAddress = `current_address:${ctx.from.id}`
    let address = await get(userCurrentAddress)
    await dbHandlers.deleteRow(address)
    await del(userCurrentAddress)

    let newAddress
    try {
        let {rows} = await dbHandlers.getRandomAddress(ctx.from.id)
        newAddress = rows[0].address
        await set(userCurrentAddress, newAddress)
    } catch (e) {
        return ctx.reply('your last account was deleted. no accounts left')
    }

    await ctx.reply('account was deleted')
    await ctx.reply('your another account was set as default')
    let balance = await showBalance(newAddress)
    return ctx.reply(balance, optionsKeyboard())
}