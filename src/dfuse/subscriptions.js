import { getAllUserChatIds } from '../db';
import dfuseClient from './client';

export const subscribtomarkets = async (bot) => {
  const streamPredIQt = `subscription($cursor: String!) {
    searchTransactionsForward(query: "receiver:prediqtpedia (action:propmarket OR action:createmarket OR action:mktresolve OR action:mktinvalid OR action:acceptmarket OR action:rejectmarket)", cursor: $cursor) {
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
        //   const timestamp = moment(data.trace.block.timestamp);
        const actions = data.trace.matchingActions;
        //   if (timestamp.unix() + MAX_TIME > moment().unix()) {
        const allChatIds = await getAllUserChatIds();

        actions.forEach(({
          json,
          name,
          dbOps,
        }) => {
          let msg;
          if (name === 'propmarket') {
            const {
              creator,
              resolver,
              ipfs,
              timeIn,
            } = json;
            msg = `💫 Market proposed [ Creator: ${creator}, IPFS: ${ipfs} Time: ${timeIn} ]`;
            if (process.env.BOT_ENV === 'prod') {
              const marketId = dbOps[1].newJSON.object.id;
              // if (marketId) {
              msg = `✅️ Market Created [ Resolver: ${resolver}, Id: ${marketId}], URL: ${process.env.PUBLIC_URL}/market/${marketId} ]`;
              allChatIds.forEach((id) => {
                bot.telegram.sendMessage(id, msg);
              });
              // }
            }
          } else if (name === 'createmarket') {
            const {
              creator,
              resolver,
              ipfs,
              timeIn,
            } = json;
            msg = `⚡️ Market created [ Creator: ${creator}, IPFS: ${ipfs} Time: ${timeIn} ]`;
          } else if (name === 'mktresolve') {
            const {
              resolver,
              marketId,
              sharetype,
              memo,
            } = json;
            msg = `☄️ Market Resolved by: ${resolver}, Result: ${sharetype ? 'YES' : 'NO'}, Link: ${process.env.PUBLIC_URL}/market/${marketId}`;
            //   if (process.env.BOT_ENV === 'prod') {
            allChatIds.forEach((id) => {
              bot.telegram.sendMessage(id, msg);
            });
            //   }/
          } else if (name === 'mktinvalid') {
            const {
              marketId,
              memo,
            } = json;
            msg = `🥀️ Market Invalid [ Id: ${marketId}, Memo: ${memo}, URL: ${process.env.PUBLIC_URL}/market/${marketId} ]`;
          } else if (name === 'acceptmarket') {
            const {
              resolver,
              marketId,
            } = json;
            msg = `✅️ Market Accepted [ Resolver: ${resolver}, Id: ${marketId}], URL: ${process.env.PUBLIC_URL}/market/${marketId} ]`;
            //   if (process.env.BOT_ENV === 'prod') {
            allChatIds.forEach((id) => {
              bot.telegram.sendMessage(id, msg);
            });
            //   }
          } else if (name === 'rejectmarket') {
            const {
              resolver,
              marketId,
            } = json;
            msg = `❌️ Market Rejected [ Resolver: ${resolver}, Id: ${marketId}], URL: ${process.env.PUBLIC_URL}/market/${marketId} ]`;
          }

          if (msg) {
            //   bot.telegram.sendMessage(process.env.TG_DEBUG, msg);
            // eslint-disable-next-line no-console
            console.info(msg);
          }
        });

        stream2.mark({
          cursor: data.cursor,
        });
      }
      // }

      if (message.type === 'complete') {
        // eslint-disable-next-line no-console
        console.log('Stream completed');
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const subscribtoorders = () => {

};
