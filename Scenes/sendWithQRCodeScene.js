const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const { backKeyboard, mainKeyboard, exitKeyboard, optionsKeyboard } = require('../keyboards');
const { dbHandlers } = require('../Controllers/dbHandlers');
const { checkAddress, sendEther, QRCodeToAddress, toAddress, showBalance } = require('../eth/handleEther');
const { get } = require('../Controllers/redisHandlers');

const cancelCommand = (ctx) => {
    ctx.reply('Hi! You can use me as a simple ether wallet. Save your private key here and I will be happy with it.', mainKeyboard())
    return ctx.scene.leave()
}

const step1 = (ctx) => {
    ctx.reply('Send a picture of QR code', backKeyboard())
    return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('photo', async (ctx) => {
    let currentStep = ctx.wizard.cursor
    let address
    try {
        address = await QRCodeToAddress(ctx)
    } catch {
        await ctx.reply('Some error happened. Try again.')
        return cancelCommand(ctx)
    }
    if (!address) {
        await ctx.reply('Some error happened. Try again.')
        return cancelCommand(ctx)
    }
    let isAddress
    try {
        address = toAddress(address)
        isAddress = checkAddress(address)
    } catch {
        ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    if (!isAddress) {
        ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    ctx.wizard.address = address
    await ctx.replyWithHTML(
        `Here's the address:
<b><i>${address}</i></b>`
        )
    await ctx.reply('Enter amount of Eth', exitKeyboard())
    return ctx.wizard.next()
})

step2.on('text', async (ctx) => {
    let text = ctx.update.message.text
    if (text === '🔙 Return') {
        return cancelCommand(ctx)
    }
})


const step3 = new Composer()

step3.on('text', async (ctx) => {
    let amount = ctx.update.message.text
    let address = ctx.wizard.address
    let currentStep = ctx.wizard.cursor
    if (amount === '🔙 Return') {
        ctx.reply('Send a picture of QR code', backKeyboard())
        return ctx.wizard.back()
    }
    if (amount === 'Exit') {
        return cancelCommand(ctx)
    }
    if (amount === '/cancel') {
        return cancelCommand(ctx)
    }
    if (amount === '/start') {
        return cancelCommand(ctx)
    }
    let isNotNumber = isNaN(amount)
    if (isNotNumber) {
        ctx.reply('amount must contain only numbers. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    let userCurrentAddress = `current_address:${ctx.from.id}`
    let currAddress = await get(userCurrentAddress)
    let { rows } = await dbHandlers.findPrivateKey(currAddress)
    let currKey = rows[0].private_key
    await sendEther(address, amount, currKey, currAddress).then(result => ctx.reply(result, mainKeyboard()))
    let balance = await showBalance(currAddress)
    ctx.reply(balance, optionsKeyboard())
    return ctx.wizard.next()
})


module.exports = new WizardScene('sendWithQRCodeScene', step1, step2, step3)