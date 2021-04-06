const Telegraf = require('telegraf');
const Stage = require('telegraf/stage');
const {session} = require('telegraf');
const dotenv = require('dotenv');
const privateKeyScene = require('./Scenes/privateKeyScene');
const sendWithAddressScene = require('./Scenes/sendWithAddressScene');
const sendWithQRCodeScene = require('./Scenes/sendWithQRCodeScene');
const { mainKeyboard, optionsKeyboard, selectAccountKeyboard } = require('./keyboards');
const { showBalance, getAddress } = require('./eth/handleEther');
const { dbHandlers } = require('./Controllers/dbHandlers');
const { get, set } = require('./Controllers/redisHandlers');
const { receiveAction, sendingOptionAction, removeAccount } = require('./botActions');
const addAccountScene = require('./Scenes/addAccountScene');

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const stage = new Stage([privateKeyScene, sendWithAddressScene, sendWithQRCodeScene, addAccountScene])
bot.use(session())
bot.use(stage.middleware())

isAuth = async (ctx, next) => {
    let sessionAddress
    try {
        let userCurrentAddress = `current_address:${ctx.from.id}`
        sessionAddress = await get(userCurrentAddress)
    } catch (e) {
        console.log(e)
        try {
            let { rows } = await dbHandlers.findAddressByID(ctx.from.id)
            let privateKey = rows[0].private_key
            sessionAddress = await getAddress(privateKey)
        } catch (e) {
            console.log(e)
        }
    }
    if (sessionAddress) {
        let balance = await showBalance(sessionAddress)
        return ctx.reply(balance, optionsKeyboard())
    }
    next()
}

doesAccountExist = async (ctx, next) => {
    let sessionAddress
    try {
        let userCurrentAddress = `current_address:${ctx.from.id}`
        sessionAddress = await get(userCurrentAddress)
    } catch (e) {
        console.log(e)
    }
    if (!sessionAddress) {
        return ctx.reply('no accounts yet')
    }
    return next()
}

isLessThanFive = async (ctx, next) => {
    let { rows } = await dbHandlers.findAddressByID(ctx.from.id)
    if (rows[4]) {
        return ctx.reply('You cannot have more than five accounts')
    }
    return next()
}

bot.start(async (ctx) => {
    await ctx.reply(`\•.•/ Hi
❖ I'm your personal wallet ❖
   Save your private key 🗝 here
 ♡ And I will be happy with it ♡`, mainKeyboard())
    await ctx.replyWithSticker('CAACAgIAAxkBAAEBHMNgaK0CrGPgywKRGYud8unuyPhLfgAC0AwAArTbOUvJjieRZ4UaQh4E')
})
bot.hears('❖ Wallet', isAuth, Stage.enter('privateKeyScene'))
bot.hears('📋 About', ctx => ctx.reply('about'))

bot.action('receiveEth', doesAccountExist, ctx => receiveAction(ctx))
bot.action('sendEth', doesAccountExist, ctx => sendingOptionAction(ctx))

bot.action('selectAccount', doesAccountExist, async ctx => await selectAccountKeyboard(ctx))
bot.action('addAccount', isLessThanFive, Stage.enter('addAccountScene'))
bot.action('removeAccount', ctx => removeAccount(ctx))

bot.action('sendWithAddress', Stage.enter('sendWithAddressScene'))
bot.action('sendWithQRCode', Stage.enter('sendWithQRCodeScene'))

bot.on('callback_query', async ctx => {
    let privateKey = ctx.callbackQuery.data
    try {
        let address = await getAddress(privateKey)
        let userCurrentAddress = `current_address:${ctx.from.id}`
        await set(userCurrentAddress, address)
        let balance = await showBalance(address)
        return ctx.reply(balance, optionsKeyboard())
    } catch {
        return
    }
})

bot.launch()