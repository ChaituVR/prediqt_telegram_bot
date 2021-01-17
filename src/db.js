import { Pool } from 'pg';
import _has from 'lodash/has';
import _uniq from 'lodash/uniq';

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query(`CREATE TABLE IF NOT EXISTS users (
    id integer NOT NULL,
    username varchar(450) NOT NULL,
    subscriptions text[],
    enabled integer NOT NULL DEFAULT '1',
    PRIMARY KEY (username)
  )`);

export const getSubscriptionsById = (id) => new Promise((resolve, reject) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      return reject(error);
    }
    return resolve(_has(results, 'rows[0].subscriptions') ? results.rows[0].subscriptions : null);
  });
});

export const getAllUserChatIds = () => new Promise((resolve, reject) => {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) {
      return reject(error);
    }
    return resolve(_has(results, 'rows') ? results.rows.map((a) => a.id) : null);
  });
});

export const getSubscribedUserChatIds = (accountName) => new Promise((resolve, reject) => {
  pool.query(`SELECT * from users WHERE '${accountName}'=ANY(subscriptions);`, (error, results) => {
    if (error) {
      return reject(error);
    }
    return resolve(_has(results, 'rows') ? results.rows.map((a) => a.id) : null);
  });
});

export const createUser = (id, username) => new Promise((resolve, reject) => {
  pool.query('INSERT INTO users (id, username) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, username], (error, results) => {
    if (error) {
      reject(error);
    }
    resolve(results);
  });
});

export const updateUserSubscription = (
  id,
  action,
  accountName,
// eslint-disable-next-line no-async-promise-executor
) => new Promise(async (resolve, reject) => {
  let subscriptions = await getSubscriptionsById(id) || [];
  if (action === 'remove') {
    if (subscriptions.length > 0 && subscriptions.indexOf(accountName) > -1) {
      subscriptions.splice(subscriptions.indexOf(accountName), 1);
    }
  } else {
    subscriptions.push(accountName);
    subscriptions = _uniq(subscriptions);
  }
  if (subscriptions.length === 0) {
    subscriptions = null;
  }
  pool.query(
    'UPDATE users SET subscriptions = $1 WHERE id = $2',
    [subscriptions, id],
    (error) => {
      if (error) {
        return reject(error);
      }
      return resolve('Success');
    },
  );
});
