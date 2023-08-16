import Redis, { RedisOptions } from 'ioredis';
import { Types } from 'mongoose';

import { config } from '../../config';
import { UserInfoInToken } from '../../middlewares/authentication';
import { logger } from '../logger';

const { redis } = config;
const isPremium = 'isPremium';

let options: RedisOptions = {
  lazyConnect: true,
  host: redis.HOST,
  port: redis.PORT,
  password: redis.PASSWORD,
};

if (!config.IS_LOCAL) {
  options = {
    ...options,
    tls: {},
  };
}

interface UserKey {
  id: Types.ObjectId;
  userType: UserInfoInToken['userType'];
}

class RedisService {
  #client: Redis;

  constructor() {
    this.#client = new Redis(options);

    this.#client.on('ready', () => {
      logger.info('Successfully connected to Redis');
      this.#client.on('error', (error) =>
        logger.error(`Redis: ${error as string}`)
      );
    });
  }

  async initializeConnection() {
    try {
      await this.#client.connect();
    } catch (error) {
      logger.error(`Redis:${error as string}`);
    }
  }

  async userSetStatus(
    id: Types.ObjectId,
    userType: UserInfoInToken['userType'],
    isPremiumSubscription: boolean
  ) {
    logger.debug(
      `Redis ${isPremium}_status: ${isPremiumSubscription.toString()}`
    );
    return this.#client.set(
      `${userType.toLowerCase()}_${isPremium}:${id.toString()}`,
      isPremiumSubscription.toString()
    );
  }

  async userGetStatus(
    id: Types.ObjectId,
    userType: UserInfoInToken['userType']
  ) {
    return this.#client.get(
      `${userType.toLowerCase()}_${isPremium}:${id.toString()}`
    );
  }

  async userDeleteStatus(
    id: Types.ObjectId,
    userType: UserInfoInToken['userType']
  ) {
    return this.#client.del(
      `${userType.toLowerCase()}_${isPremium}:${id.toString()}`
    );
  }

  async usersDeleteManyStatus(
    parentId: Types.ObjectId,
    students: Types.ObjectId[]
  ) {
    if (!students || !students.length) {
      return this.userDeleteStatus(parentId, 'PARENT');
    }

    const users: UserKey[] = students.map((studentId) => ({
      id: studentId,
      userType: 'STUDENT',
    }));

    users.push({ id: parentId, userType: 'PARENT' });

    const keys = users.map(
      ({ id, userType }) =>
        `${userType.toLowerCase()}_${isPremium}:${id.toString()}`
    );

    return this.#client.del(keys);
  }

  async flushDB() {
    logger.debug('Flush records from Redis DB');
    return this.#client.flushdb();
  }
}

export default new RedisService();
