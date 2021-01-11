import _has from 'lodash/has';
import dfuseClient from './client';

// eslint-disable-next-line import/prefer-default-export
export const checkForAccount = async (accountName) => {
  const queryAccount = `query($opts: [ACCOUNT_BALANCE_OPTION!]) {
    accountBalances(account: "${accountName}", options: $opts) {
      blockRef {
        id
        number
      }
      pageInfo {
        startCursor
        endCursor
      }
      edges {
        node {
          account
          contract
          symbol
          precision
          balance
        }
      }
    }
  }`;

  try {
    const message = await dfuseClient.graphql(queryAccount);
    if (message.type === 'error') {
      // eslint-disable-next-line no-console
      console.error('An error occurred', message.errors, message.terminal);
    }

    if (_has(message, 'data.accountBalances.edges') && message.data.accountBalances.edges.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
