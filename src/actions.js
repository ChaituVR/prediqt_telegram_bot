import { mainMenuKeyboard, mainMenuKeyboardText, secondaryKeyboardText } from './keyboard';

import {
  addNewAccount,
  cancelAddition,
  moniterPredIQtAccounts,
  removeAccount,
  removeAccountFromSubscriptions,
  showSubscribedAccounts,
  startChat,
  updateSubscription,
} from './handlers';

const featuresAndTipsText = mainMenuKeyboardText[1][0];
const aboutAndFeedbackText = mainMenuKeyboardText[1][1];
const moniterPredIQtAccountsText = mainMenuKeyboardText[0][0];
const addNewAccountText = secondaryKeyboardText[0][0];
const removeAccountText = secondaryKeyboardText[0][1];
const showSubscribedAccountsText = secondaryKeyboardText[1][0];
const backToMenuText = secondaryKeyboardText[2][0];

export default (bot) => {
  // Start and help
  bot.start(startChat);
  bot.help((ctx) => ctx.reply('Type `/start` command to go to main menu'));

  // Main menu actions
  bot.hears(featuresAndTipsText, (ctx) => ctx.reply('👍'));
  bot.hears(aboutAndFeedbackText, (ctx) => ctx.reply('👍'));
  bot.hears(moniterPredIQtAccountsText, moniterPredIQtAccounts);

  // secondary menu actions
  bot.hears(addNewAccountText, addNewAccount);
  bot.hears(removeAccountText, removeAccount);
  bot.hears(showSubscribedAccountsText, showSubscribedAccounts);
  bot.hears(backToMenuText, (ctx) => ctx.reply('Main menu, pick an action from below', mainMenuKeyboard.reply()));
  bot.on('callback_query', async (ctx) => {
    if (ctx.update.callback_query.message.text === 'Select an account below to remove') {
      removeAccountFromSubscriptions(ctx);
    }
  });

  // on cancel
  bot.hears('Cancel', cancelAddition);

  // other
  bot.on('sticker', (ctx) => ctx.reply('👍'));
  bot.on('text', async (ctx) => {
    if (ctx.session.enteredNewAccountCreation) {
      updateSubscription(ctx);
    } else {
      ctx.reply('Type `/start` command to go to main menu');
    }
  });
};
