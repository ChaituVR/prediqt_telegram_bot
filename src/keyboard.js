import { Keyboard } from 'telegram-keyboard';

export const mainMenuKeyboardText = [
  ['🔔 Moniter PredIQt Accounts'],
  ['💡 Features and Tips', '📮 About and Feedback'],
];

export const mainMenuKeyboard = Keyboard.make(mainMenuKeyboardText);

export const secondaryKeyboardText = [
  ['➕ Add new account', '❌ Remove an account'],
  ['✔️ Show Subscribed Accounts'],
  ['🔙 Back to Menu'],
];

export const secondaryKeyboard = Keyboard.make(secondaryKeyboardText);

export const cancelKeyboard = Keyboard.make([
  ['Cancel'],
]);

export const makeInlineSubscriptionsList = (subscriptions) => Keyboard.make(subscriptions, {
  columns: 3,
}).inline();
