const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const { backKeyboard, mainKeyboard, optionsKeyboard } = require('../keyboards');
const { showBalance, getAddress } = require('../eth/handleEther');
const { dbHandlers } = require('../Controllers/dbHandlers');
const { hset, incr, set } = require('../Controllers/redisHandlers');

const cancelCommand = (ctx) => {
    ctx.reply('Hi! You can use me as a simple ether wallet. Save your private key here and I will be happy with it.', mainKeyboard())
    return ctx.scene.leave()
}

const step1 = (ctx) => {
    ctx.reply('Enter your private key', backKeyboard())
    return ctx.wizard.next()
}

const step2 = new Composer()

step2.on('text', async (ctx) => {
    let privateKey = ctx.update.message.text
    let currentStep = ctx.wizard.cursor
    if (privateKey === '🔙 Return') {
        return cancelCommand(ctx)
    }
    if (privateKey === '/cancel') {
        return cancelCommand(ctx)
    }
    let address
    try {
        address = await getAddress(privateKey)
    } catch {
        await ctx.reply('invalid key. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    if (!address) {
        await ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }

    try {
        let userAddress = `address:${ctx.from.id}`

        let userAddressKey = await incr('key:address')
        await hset(userAddress, userAddressKey, address)

        let userCurrentAddress = `current_address:${ctx.from.id}`
        
        await set(userCurrentAddress, address)
    } catch (e) {
        console.log(e)
    }

    try {
        dbHandlers.addPrivateKey(ctx.from.id, privateKey, address)
    } catch (e) {
        console.log(e)
    }
    let balance
    try {
        balance = await showBalance(address)
    } catch (e) {
        console.log(e)
        await ctx.reply('cannot get balance. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    if (!balance) {
        await ctx.reply('invalid address. try again')
        return ctx.wizard.selectStep(currentStep)
    }
    try {
        await ctx.reply('Your key was saved. Now you can receive payments or send a transaction.', mainKeyboard())
    } catch {
        return ctx.reply('Some error happened. Hit /cancel to return to the main menu')
    }
    await ctx.reply(balance, optionsKeyboard())
    return ctx.scene.leave()
})

module.exports = new WizardScene('addAccountScene', step1, step2)