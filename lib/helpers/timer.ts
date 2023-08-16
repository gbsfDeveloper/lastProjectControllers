import { hrtime } from 'process';

import { logger } from '../logger';

export class Timer {
  #startTimer: bigint;
  #endTimer: bigint;
  #message: string;
  constructor(message = 'Timer end') {
    this.#startTimer = BigInt(0);
    this.#endTimer = BigInt(0);
    this.#message = message;
  }

  start() {
    this.#startTimer = hrtime.bigint();
  }

  end() {
    this.#endTimer = hrtime.bigint();

    logger.debug(
      `${this.#message}, ${(
        Number(this.#endTimer - this.#startTimer) / 1e9
      ).toFixed(3)}ms`
    );

    this.#startTimer = BigInt(0);
    this.#endTimer = BigInt(0);
  }
}
