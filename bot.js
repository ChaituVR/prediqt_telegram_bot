import { session, Telegraf } from 'telegraf';
import actions from './src/actions';

import { subscribeToDfuse } from './src/dfuse/subscriptions';

require('dotenv').config();

let bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(Telegraf.log());
bot.use(session());
(async () => {
  bot = await subscribeToDfuse(bot);
  actions(bot);
  bot.launch();
  // eslint-disable-next-line no-console
  console.log('Server started and listening to Telegram');
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
