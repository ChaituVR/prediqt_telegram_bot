import eosjsAccountName from 'eosjs-account-name';
import _uniq from 'lodash/uniq';
import {
  // getAllUserChatIds,
  getSubscribedUserChatIds,
  getSubscribedUserChatIdsMulitple,
} from '../db';
import dfuseClient from './client';

const URL = process.env.NETWORK === 'kylin' ? process.env.PUBLIC_URL_KYLIN : process.env.PUBLIC_URL;

const getMarketParticipants = async (marketId) => {
  if (marketId) {
    const shares = await dfuseClient.stateTable('prediqtpedia', eosjsAccountName.uint64ToName(marketId.toString()), 'shares');
    const lmtorderyes = await dfuseClient.stateTable('prediqtpedia', eosjsAccountName.uint64ToName(marketId.toString()), 'lmtorderyes');
    const lmtorderno = await dfuseClient.stateTable('prediqtpedia', eosjsAccountName.uint64ToName(marketId.toString()), 'lmtorderno');
    return _uniq([
      ...shares.rows.map((a) => a.json.shareholder),
      ...lmtorderyes.rows.map((a) => a.json.creator),
      ...lmtorderno.rows.map((a) => a.json.creator),
    ]);
  }
  return [];
};

const sendMessagesToChats = (bot, chatIdsSubscribed, msg) => {
  // eslint-disable-next-line no-console
  console.info(msg);
  chatIdsSubscribed.forEach((id) => {
    bot.telegram.sendMessage(id, msg, {
      disable_web_page_preview: true,
    });
  });
};

// eslint-disable-next-line import/prefer-default-export
export const subscribeToDfuse = async (bot) => {
  const streamPredIQt = `subscription($cursor: String!) {
    searchTransactionsForward(query: "receiver:prediqtpedia (action:propmarket OR action:createmarket OR action:mktend OR action:mktresolve OR action:mktinvalid OR action:acceptmarket OR action:rejectmarket OR action:lmtorderyes OR action:lmtorderno OR action:claimshares)", cursor: $cursor) {
        undo cursor
        trace {
            block {
                timestamp
            }
            matchingActions {
                name json dbOps {
                    newJSON {
                      object
                    }
                    oldJSON {
                      object
                    }
                }
            }
        }
    }
  }`;

  try {
    const stream2 = await dfuseClient.graphql(streamPredIQt, async (message) => {
      // eslint-disable-next-line no-console
      console.log('Data Reterived');
      if (message.type === 'error') {
        // eslint-disable-next-line no-console
        console.error('An error occurred', message.errors, message.terminal);
      }

      if (message.type === 'data') {
        const data = message.data.searchTransactionsForward;
        const actions = data.trace.matchingActions;
        // const allChatIds = await getAllUserChatIds();

        actions.map(async ({
          json,
          name,
          dbOps,
        }) => {
          let msg;

          // Markets
          if (name === 'propmarket') {
            const {
              resolver,
              creator,
            } = json;
            const marketId = dbOps[1].newJSON.object.id;
            if (marketId) {
              msg = `✅️ Market Created [ Creator: ${creator}, Resolver: ${resolver}, Id: ${marketId}], URL: ${URL}/market/${marketId} ]`;
              // send only to creator and resolver
              const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(
                _uniq([creator, resolver]),
              );
              sendMessagesToChats(bot, chatIdsSubscribed, msg);
              return true;
            }
          } else if (name === 'mktend') {
            const {
              market_id: marketId,
              sharetype,
            } = json;
            msg = `☄️ Market Ended. \n\n Result: ${sharetype ? 'YES' : 'NO'}, Link: ${URL}/market/${marketId}`;
            const sendAlertToAccounts = await getMarketParticipants(marketId);
            const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(sendAlertToAccounts);
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
            return true;
          } else if (name === 'mktinvalid') {
            const {
              market_id: marketId,
              memo,
            } = json;
            msg = `🥀️ Market Invalid [ Id: ${marketId}, Memo: ${memo}, URL: ${URL}/market/${marketId} ]`;
            const sendAlertToAccounts = await getMarketParticipants(marketId);
            const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(sendAlertToAccounts);
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
            return true;
          } else if (name === 'acceptmarket') {
            const {
              resolver,
              market_id: marketId,
            } = json;
            msg = `✅️ Market Accepted [ Resolver: ${resolver}, Id: ${marketId}], URL: ${URL}/market/${marketId} ]`;
            const sendAlertToAccounts = await getMarketParticipants(marketId);
            const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(
              _uniq([...sendAlertToAccounts, resolver]),
            );
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
            return true;
          } else if (name === 'rejectmarket') {
            const {
              resolver,
              market_id: marketId,
            } = json;
            msg = `❌️ Market Rejected [ Resolver: ${resolver}, Id: ${marketId}], URL: ${URL}/market/${marketId} ]`;
            const sendAlertToAccounts = await getMarketParticipants(marketId);
            const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(
              _uniq([...sendAlertToAccounts, resolver]),
            );
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
            return true;
          } else if (name === 'mktresolve') {
            const {
              resolver,
              market_id: marketId,
              sharetype,
            } = json;
            msg = `☄️ Market Resolved by: ${resolver}, Result: ${sharetype ? 'YES' : 'NO'}, Link: ${URL}/market/${marketId}`;
            const sendAlertToAccounts = await getMarketParticipants(marketId);
            const chatIdsSubscribed = await getSubscribedUserChatIdsMulitple(sendAlertToAccounts);
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
            return true;
          } else if (name === 'lmtorderyes' || name === 'lmtorderno') {
            const {
              user,
              buy,
              limit,
              referral,
              market_id: marketId,
              shares,
            } = json;
            let orderFilled = false;
            // If an order is filled
            // eslint-disable-next-line consistent-return
            dbOps.forEach(async (dpOp) => {
              if (dpOp.newJSON.object) {
                const { creator, isbid } = dpOp.newJSON.object;
                if (creator && isbid) {
                  const sharesRemaining = dpOp.newJSON.object.shares;
                  // First order
                  if (!dpOp.oldJSON.object || dpOp.oldJSON.object.creator !== creator) {
                    return false;
                  }
                  orderFilled = true;
                  getSubscribedUserChatIds(creator).then((creatorsSubscribed) => {
                    const ordermsg = `✅️ Order filled with ${shares / 1000} "${name.indexOf('yes') > -1 ? 'YES' : 'NO'}" shares by ${user}\n\nCreator Name: ${creator}\nMarket URL: ${URL}/market/${marketId}\nNumber of shares bought: ${shares / 1000}\nNumber of shares pending: ${sharesRemaining ? (sharesRemaining / 1000) : 0}`;
                    sendMessagesToChats(bot, creatorsSubscribed, ordermsg);
                  });
                }
              } else if (dpOp.oldJSON.object) {
                // if order is fully filled
                const { creator, isbid } = dpOp.oldJSON.object;
                if (creator && isbid) {
                  const sharesFilled = dpOp.oldJSON.object.shares;
                  orderFilled = true;
                  getSubscribedUserChatIds(creator).then((creatorsSubscribed) => {
                    const ordermsg = `✅️ Order completely filled with ${sharesFilled / 1000} "${name.indexOf('yes') > -1 ? 'YES' : 'NO'}" shares by ${user}\n\nCreator Name: ${creator}\nMarket URL: ${URL}/market/${marketId}\nNumber of shares filled: ${sharesFilled / 1000}\nNumber of shares pending: 0`;
                    sendMessagesToChats(bot, creatorsSubscribed, ordermsg);
                  });
                }
              }
            });
            const chatIdsSubscribed = await getSubscribedUserChatIds(user);
            const ordermsg = `✅️ Order placed to "${buy ? 'Buy' : 'Sell'}" ${shares / 1000} "${name.indexOf('yes') > -1 ? 'YES' : 'NO'}" shares by ${user}\n\nLimit: ${limit}\nMarket URL: ${URL}/market/${marketId}\nReferral by: ${referral},\nNumber of Shares: ${shares / 1000}\nOrder Filled: ${orderFilled ? 'Yes' : 'No'}`;
            sendMessagesToChats(bot, chatIdsSubscribed, ordermsg);
          } else if (name === 'claimshares') {
            const {
              user,
              market_id: marketId,
            } = json;
            msg = `Shares are Claimed/Burned for Market ${URL}/market/${marketId} and sent to account ${user}`;
            const chatIdsSubscribed = await getSubscribedUserChatIds(user);
            sendMessagesToChats(bot, chatIdsSubscribed, msg);
          }

          return false;
        });

        stream2.mark({
          cursor: data.cursor,
        });
      }

      if (message.type === 'complete') {
        // eslint-disable-next-line no-console
        console.log('Stream completed');
      }
    });
    // eslint-disable-next-line no-console
    console.log('Subscribed to dfuse api successfully');
    return bot;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  return bot;
};
