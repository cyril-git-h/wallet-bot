const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const { backKeyboard, mainKeyboard, exitKeyboard, optionsKeyboard } = require('../keyboards');
const { dbHandlers } = require('../Controllers/dbHandlers');
const { checkAddress, sendEther, showBalance } = require('../eth/handleEther');
const { get } = require('../Controllers/redisHandlers');

const cancelCommand = (ctx) => {
    ctx.reply('Hi! You can use me as a simple ether wallet. Save your private key here and I will be happy with it.', mainKeyboard())
    return ctx.scene.leave()
}

const step1 = (ctx) => {
    ctx.reply('Enter address you want to send your Eth', backKeyboard())
    return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('text', async (ctx) => {
    let address = ctx.update.message.text
    let currentStep = ctx.wizard.cursor
    if (address === '🔙 Return') {
        return cancelCommand(ctx)
    }
    if (address === '/cancel') {
        return cancelCommand(ctx)
    }
    let isAddress
    try {
        isAddress = checkAddress(address)
    } catch {
        ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    if (!isAddress) {
        ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    ctx.wizard.state.address = address
    ctx.reply('Enter amount of Eth', exitKeyboard())
    return ctx.wizard.next()
})

const step3 = new Composer()

step3.on('text', async (ctx) => {
    let amount = ctx.update.message.text
    let currentStep = ctx.wizard.cursor
    let address = ctx.wizard.state.address
    if (amount === '🔙 Return') {
        ctx.reply('Enter address you want to send your Eth', backKeyboard())
        return ctx.wizard.back()
    }
    if (amount === 'Exit') {
        return cancelCommand(ctx)
    }
    if (amount === '/cancel') {
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
    return ctx.scene.leave()
})

module.exports = new WizardScene('sendWithAddressScene', step1, step2, step3)