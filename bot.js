import { session, Telegraf } from 'telegraf';
import actions from './src/actions';

import { subscribeToDfuse } from './src/dfuse/subscriptions';

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(Telegraf.log());
bot.use(session());
subscribeToDfuse(bot);
actions(bot);
bot.launch();

// eslint-disable-next-line no-console
console.log('Server started and listening to Telegram');
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
