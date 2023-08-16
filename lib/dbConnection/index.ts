import { ConnectOptions } from 'mongoose';

export const dbConnection = {
  buildUri: (
    { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST }: Record<string, string>,
    IS_LOCAL: boolean
  ): string => {
    const protocol = IS_LOCAL ? 'mongodb+srv' : 'mongodb';
    const username = encodeURIComponent(DB_USERNAME);
    const password = encodeURIComponent(DB_PASSWORD);
    const db = DB_NAME;
    const host = DB_HOST;
    const endUrl = IS_LOCAL
      ? `retryWrites=false&w=majority`
      : `retryWrites=false&replicaSet=rs0&readPreference=secondaryPreferred`;
    return `${protocol}://${username}:${password}@${host}/${db}?${endUrl}`;
  },
  buildConnectionOptions: (PEM_FILE: string, IS_LOCAL: boolean) => {
    let connectionOptions = {};

    if (!IS_LOCAL) {
      connectionOptions = {
        ssl: true,
        sslValidate: true,
        sslCA: `${__dirname}/${PEM_FILE}`,
      };
    }

    return connectionOptions as ConnectOptions;
  },
};

export const mongoDBConnection = {
  buildUri: (
    {
      DB_NAME_METALOG,
      DB_USERNAME_METALOG,
      DB_PASSWORD_METALOG,
      DB_HOST_METALOG,
      DB_PORT_METALOG,
      DB_SSL_METALOG,
    }: Record<string, string>,
    IS_LOCAL: boolean
  ): string => {
    const protocol = IS_LOCAL ? 'mongodb+srv' : 'mongodb';
    const username = encodeURIComponent(DB_USERNAME_METALOG);
    const password = encodeURIComponent(DB_PASSWORD_METALOG);
    const db = DB_NAME_METALOG;
    const host = IS_LOCAL
      ? DB_HOST_METALOG
      : `${DB_HOST_METALOG}:${DB_PORT_METALOG}`;
    const endUrl =
      !IS_LOCAL && DB_SSL_METALOG === 'true'
        ? `retryWrites=false&replicaSet=rs0&readPreference=secondaryPreferred`
        : `retryWrites=false&w=majority`;
    return `${protocol}://${username}:${password}@${host}/${db}?${endUrl}`;
  },
  buildConnectionOptions: (
    PEM_FILE: string,
    IS_LOCAL: boolean,
    {
      SSL,
      SSL_VALIDATE,
    }: {
      SSL: string;
      SSL_VALIDATE: string;
    }
  ) => {
    let connectionOptions = {};

    if (!IS_LOCAL && SSL === 'true') {
      connectionOptions = {
        ssl: SSL === 'true',
        sslValidate: SSL_VALIDATE === 'true',
        sslCA: SSL === 'true' ? `${__dirname}/${PEM_FILE}` : '',
      };
    }

    return connectionOptions as ConnectOptions;
  },
};
