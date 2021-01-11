import { createDfuseClient } from '@dfuse/client';

require('dotenv').config();
global.fetch = require('node-fetch');
global.WebSocket = require('ws');

const dfuseClient = createDfuseClient({
  apiKey: process.env.DFUSE_API_KEY,
  network: process.env.network === 'kylin' ? process.env.KYLIN_NETWOR : process.env.DFUSE_NETWORK,
});

export default dfuseClient;
