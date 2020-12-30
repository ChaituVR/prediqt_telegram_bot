import { session, Telegraf } from 'telegraf';
import actions from './src/actions';
import { subscribtomarkets } from './src/subscriptions';

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(Telegraf.log());
bot.use(session());
subscribtomarkets(bot);
actions(bot);

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
