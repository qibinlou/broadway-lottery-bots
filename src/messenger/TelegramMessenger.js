const {TelegramClient} = require('messaging-api-telegram');
const getPropertyOrDefault = require('../utils/getPropertyOrDefault');

const TOKEN = getPropertyOrDefault('TELEGRAM_TOKEN');
const CHAT_ID = getPropertyOrDefault('TELEGRAM_CHAT_ID');

const client = TelegramClient.connect(TOKEN);

const sendMessage = (message) => client.sendMessage(CHAT_ID, message);

module.exports = {sendMessage};
