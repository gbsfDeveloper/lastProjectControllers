import { unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

import { config } from '../config';
import { ErrorMessage } from './errors';
import { logger } from './logger';

const fileContent = config.GCLOUD_SERVICE_ACCOUNT;
const outputDir = join(
  __dirname,
  `../${config.playStore.credentialfileName}.json`
);

export const initKeyFile = () => {
  try {
    if (!fileContent) {
      throw new Error(ErrorMessage.GCP_MISSING_VARIABLE);
    }

    writeFileSync(outputDir, fileContent, 'utf-8');
  } catch (error) {
    logger.error(error);
  }
};

export const removeKeyFile = () => {
  try {
    logger.debug(ErrorMessage.GCP_REMOVE_FILE);
    unlinkSync(outputDir);
  } catch (error) {
    logger.error(error);
  }
};
