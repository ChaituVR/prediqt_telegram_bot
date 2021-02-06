import { createUser, getSubscriptionsById, updateUserSubscription } from './db';
import { checkForAccount } from './dfuse/queries';
import {
  cancelKeyboard, mainMenuKeyboard, makeInlineSubscriptionsList, secondaryKeyboard,
} from './keyboard';

export const startChat = async (ctx) => {
  try {
    if (ctx.from.is_bot) {
      await ctx.reply('Not supported for Bot Users');
    }
    await createUser(ctx.from.id, ctx.from.username || ctx.from.first_name || 'NO_NAME');
    await ctx.reply(`Hey ${ctx.from.first_name || ctx.from.username}! Welcome to PredIQt telegram bot. I can monitor your selected PredIQt accounts and send you alerts on transactions as they happen.`);
    await ctx.reply('Select an option below to continue', mainMenuKeyboard.reply());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    await ctx.reply('There is an error, Please try again later');
  }
};

export const showSubscribedAccounts = async (ctx) => {
  const subscriptions = await getSubscriptionsById(ctx.from.id);
  if (!subscriptions) {
    return ctx.reply('You don\'t have any accounts subscribed');
  }
  return ctx.reply(`You are subscribed to these following accounts: \n${subscriptions.map((a, index) => `${index + 1}. ${a}`).join('\n')}`);
};

export const addNewAccount = async (ctx) => {
  const subscriptions = await getSubscriptionsById(ctx.from.id);
  if (subscriptions) {
    ctx.reply(`You are already subscribed to these following accounts: \n${subscriptions.map((a, index) => `${index + 1}. ${a}`).join('\n')}`);
  }
  ctx.session.enteredNewAccountCreation = true;
  return ctx.reply('Please enter the PredIQt account you like to monitor', cancelKeyboard.reply());
};

export const removeAccount = async (ctx) => {
  const subscriptions = await getSubscriptionsById(ctx.from.id);
  if (!subscriptions) {
    return ctx.reply('You don\'t have any accounts subscribed');
  }
  return ctx.reply('Select an account below to remove', makeInlineSubscriptionsList(subscriptions));
};

export const cancelAddition = async (ctx) => {
  if (ctx.session.enteredNewAccountCreation) {
    ctx.session.enteredNewAccountCreation = false;
    ctx.reply('Cancelled', secondaryKeyboard.reply());
  }
};

export const updateSubscription = async (ctx) => {
  try {
    const accountExist = await checkForAccount(ctx.message.text);
    if (accountExist) {
      await updateUserSubscription(ctx.from.id, 'add', ctx.message.text);
      ctx.session.enteredNewAccountCreation = false;
      ctx.reply(`Successfully subscribed to account ${ctx.message.text}`, secondaryKeyboard.reply());
    } else {
      ctx.reply('Account Doesn\'t exist on this network, please try with different account');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    await ctx.reply('There is an error, Please try again later');
  }
};

export const moniterPredIQtAccounts = (ctx) => {
  ctx.reply('Select an option below to continue', secondaryKeyboard.reply());
};

export const removeAccountFromSubscriptions = async (ctx) => {
  try {
    await updateUserSubscription(ctx.update.callback_query.from.id, 'remove', ctx.update.callback_query.data);
    ctx.telegram.answerCbQuery(ctx.callbackQuery.id, 'Successfully Removed');
    ctx.editMessageText(`Removed account "${ctx.update.callback_query.data}" from subscriptions`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    await ctx.reply('There is an error, Please try again later');
  }
};
