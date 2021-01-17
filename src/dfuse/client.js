import { createDfuseClient } from '@dfuse/client';

require('dotenv').config();
global.fetch = require('node-fetch');
global.WebSocket = require('ws');

const dfuseClient = createDfuseClient({
  authentication: false,
  network: process.env.NETWORK === 'kylin' ? 'kylin.dfuse.eosnation.io' : 'eos.dfuse.eosnation.io',
});

export default dfuseClient;
