import http from 'http';
import mongoose from 'mongoose';

import app from '../app';
import { config } from '../config';
import { initializeFirebase } from '../lib/firebase/initializeFirebase';
import { initKeyFile, removeKeyFile } from '../lib/googleWebhookHelper';
import { logger } from '../lib/logger';
import { initPubSubService } from '../services/googleWebHook';

const { db, metalogDB } = config;

/**
 * Normalize a port into a number, string, or false.
 */

const port = (function normalizePort(val: string) {
  const portNumber = parseInt(val, 10);

  if (isNaN(portNumber)) {
    // named pipe
    return val;
  }

  if (portNumber >= 0) {
    // port number
    return portNumber;
  }

  logger.error('No port number assigned or out of range');
  process.exit(1);
})(config.PORT);

app.set('port', port);
const server = http.createServer(app);

export let METALOG_DB_CONNECTION: mongoose.Connection | false = false;

/**
 * Connect to mongodb and start the webserver listening on provided port, on all network interfaces.
 */
void (async function initServer() {
  try {
    logger.debug(`IS_LOCAL: ${config.IS_LOCAL.toString()}`);
    logger.info(`NODE_ENV: ${config.NODE_ENV}`);
    logger.info(`TLD_DOMAIN: ${config.domain.TLD}`);
    logger.info(`API_DOMAIN: ${config.domain.API}`);
    logger.info(`WEBAPP_CLIENT_DOMAIN: ${config.domain.WEB}`);

    // DB — if it fails to connect, app will exit
    await mongoose.connect(db.DATABASE_ENDPOINT, db.CONNECTION_OPTIONS);

    // DB METALOG CONNECTION
    // DEPLOY COMMENT
    mongoose.createConnection(
      metalogDB.DATABASE_ENDPOINT,
      metalogDB.CONNECTION_OPTIONS,
      (error: mongoose.CallbackError) => {
        if (error) {
          logger.error(error);
        } else {
          METALOG_DB_CONNECTION = mongoose.createConnection(
            metalogDB.DATABASE_ENDPOINT,
            metalogDB.CONNECTION_OPTIONS
          );
          logger.info('Successfully connected to DB_METALOG');
        }
      }
    );

    logger.info('Successfully connected to DB');

    // GCP Webhook file
    initKeyFile();

    // FIREBASE
    initializeFirebase();

    // Google PubSub
    initPubSubService();

    // SERVER
    server.listen(port);
  } catch (error) {
    removeKeyFile();

    logger.error(error);
    process.exit(1);
  }
})();

server.on('error', onError);
server.on('listening', onListening);

if (config.IS_LOCAL) {
  process.on('SIGINT', onInterruptSignal); // CTRL+C
  process.on('SIGQUIT', onInterruptSignal); // Keyboard quit
  process.on('SIGTERM', onInterruptSignal); // `kill` command
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `${typeof port === 'string' ? 'Pipe' : 'Port'} ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address() || '';
  const typeofAddr = typeof addr === 'string';
  const bind = typeofAddr ? `pipe ${port}` : `port ${port}`;

  logger.info(`Listening on ${bind}`);

  if (config.IS_LOCAL) {
    logger.debug(`Server listening on http://localhost:${port}/api-docs`);
  }
}

/**
 * Event listener for interrupt signal
 */

function onInterruptSignal() {
  try {
    logger.debug('Quitting app');

    removeKeyFile();

    process.removeAllListeners();
    process.exit(0);
  } catch (error) {
    logger.error(error);
  }
}

// export const METALOG_DB_CONNECTION = mongoose.createConnection(
//   metalogDB.DATABASE_ENDPOINT,
//   metalogDB.CONNECTION_OPTIONS,
//   (error: mongoose.CallbackError) => {
//     if (error) {
//       logger.error(error);
//       return this;
//     } else {
//       logger.info('Successfully connected to DB_METALOG');
//       return this;
//     }
//   }
// );

// let PRE: mongoose.Connection | false = false;
