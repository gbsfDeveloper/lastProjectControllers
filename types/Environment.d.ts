declare namespace NodeJS {
  interface ProcessEnv {
    npm_package_version: string;
    NODE_ENV: 'development' | 'production';
    IS_LOCAL: string;
    PEM_FILE: string;
    SERVER_URL: string;
    WEBAPP_CLIENT_DOMAIN: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    TEST_SECRET: string;
    TEST_PUBLIC: string;
    AUTH_SECRET: string;
    FIREBASE_APP_KEY: string;
    FIREBASE_PRIVATE_KEY_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_CLIENT_ID: string;
    FIREBASE_CLIENT_X509_CERT_URL: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    EMAIL_VERIFICATION_ADDRESS: string;
    EMAIL_VERIFICATION_REGION: string;
    APPSTORE_TEST_NOTIFICATION_URL: string;
    APPSTORE_PRIVATE_KEY: string;
    APPSTORE_ISSUER_ID: string;
    APPSTORE_BUNDLER_ID: string;
    APPSTORE_API_KEY_ID: string;
    REDIS_USERNAME: string;
    REDIS_AUTH: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    GCLOUD_SERVICE_ACCOUNT: string;
    ASSETS_CDN_URL: string;
    PASS_RESET_SIGNATURE: string;

    MONGODB_METALOGS: string;
    // DB_NAME_METALOG: string;
    // DB_USERNAME_METALOG: string;
    // DB_PASSWORD_METALOG: string;
    // DB_HOST_METALOG: string;
  }
}
