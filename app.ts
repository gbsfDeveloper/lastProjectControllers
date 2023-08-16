import express, { Application } from 'express';
import helmet from 'helmet';

import { webhookBufferFilter } from './lib/webhook/webhookBuffer';
import errorHandler from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import routesHandler from './routes';

const app: Application = express();

app.use(helmet.hidePoweredBy());

app.use(requestLogger);

app.use(express.urlencoded({ extended: false }));
app.use(express.json(webhookBufferFilter));

app.use('/', routesHandler);

app.use(errorHandler);

export default app;
