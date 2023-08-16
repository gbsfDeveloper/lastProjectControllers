import { Request, Response } from 'express';

export const webhookBufferFilter = {
  verify: function (
    req: Request & { rawBody: string },
    _res: Response,
    buffer: Buffer
  ) {
    if (req.originalUrl.startsWith('/payment/webhook/stripe')) {
      req.rawBody = buffer.toString();
    }
  },
};
