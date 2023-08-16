import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app';

import { config } from '../../config';
import { logger } from '../logger';
const { firebase } = config;

const gbCloudServiceObject = JSON.parse(config.GCLOUD_SERVICE_ACCOUNT) as {
  project_id: string;
};
const constructedServiceAccount = {
  type: 'service_account',
  project_id: gbCloudServiceObject.project_id,
  private_key_id: firebase.PRIVATE_KEY_ID,
  private_key: firebase.PRIVATE_KEY,
  client_email: firebase.CLIENT_EMAIL,
  client_id: firebase.CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: firebase.CLIENT_X509_CERT_URL,
} as ServiceAccount; // Firebase types for typescript are not really quite compatible.

export function initializeFirebase() {
  try {
    initializeApp({
      credential: cert(constructedServiceAccount),
    });
    logger.info('Successfully connected to Firebase');
  } catch (error) {
    logger.error(error);
  }
}
