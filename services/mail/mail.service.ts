import * as aws from '@aws-sdk/client-ses';
import { createTransport, SentMessageInfo } from 'nodemailer';

import { config } from '../../config';
import Mail = require('nodemailer/lib/mailer');
import SESTransport = require('nodemailer/lib/ses-transport');
import hbs from 'nodemailer-express-handlebars';

import path = require('path');
import { logger } from '../../lib/logger';
import { SubscriptionPlatforms, SubscriptionStatus } from '../../models';
import {
  confirmEmailTemplateImages,
  paymentMediaText,
  RecurringCharge,
  resetPasswordTemplateImages,
  subscriptionText,
  summaryCheckOutTemplateImages,
} from './mail.helpers';

const { mail } = config;

const ses = new aws.SES({
  region: mail.EMAIL_VERIFICATION_REGION,
});

class MailService {
  SendMail(
    from: string,
    to: string,
    code: number,
    subject: string,
    templateName: string
  ) {
    const templatePINPath = '../../lib/emailTemplates/ConfirmCorreo/';

    const transporter: Mail<SentMessageInfo> = createTransport({
      SES: { ses, aws },
    });

    // point to the template folder
    const hbsConfig = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, templatePINPath),
        layoutsDir: path.join(__dirname, templatePINPath),
        defaultLayout: '',
      },
      viewPath: path.join(__dirname, templatePINPath),
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(hbsConfig));

    // URLs
    const termsConditionsURL = `${config.WEB_URL}/terminos-y-condiciones`;
    const noticeOfPrivacyURL = `${config.WEB_URL}/aviso-de-privacidad`;
    const helpURL = `${config.WEB_URL}/#preguntas-frecuentes`;

    const options = {
      from: from,
      to: to,
      subject: subject,
      template: templateName,
      attachments: confirmEmailTemplateImages(templatePINPath),
      context: {
        pin: code.toString(),
        termsConditionsURL,
        noticeOfPrivacyURL,
        helpURL,
      },
    };

    // SEND MAIL
    transporter.sendMail(options, (_error, _info) => {
      logger.error(
        'EMAIL_VERIFICATION_REGION: ' + mail.EMAIL_VERIFICATION_REGION
      );
    });

    return true;
  }

  async SendResetPasswordMail(
    from: string,
    to: string,
    url: string,
    subject: string,
    templateName: string
  ) {
    const ses = new aws.SES({
      region: mail.EMAIL_VERIFICATION_REGION,
    });

    const templateContraseniaPath = '../../lib/emailTemplates/Contrasea/';

    const transporter: Mail<SentMessageInfo> = createTransport({
      SES: { ses, aws },
    });

    // point to the template folder
    const hbsConfig = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, templateContraseniaPath),
        layoutsDir: path.join(__dirname, templateContraseniaPath),
        defaultLayout: '',
      },
      viewPath: path.join(__dirname, templateContraseniaPath),
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(hbsConfig));

    const options = {
      from: from,
      to: to,
      subject: subject,
      template: templateName,
      attachments: resetPasswordTemplateImages(templateContraseniaPath),
      context: {
        urlToken: url,
      },
    };

    // SEND MAIL
    await transporter.sendMail(options);

    return true;
  }

  async sendSuscriptionMail(
    from: string,
    to: string,
    purchaseDetails: Record<string, string>,
    suscription: SubscriptionStatus,
    subject: string,
    templateName: string
  ) {
    const ses = new aws.SES({
      region: mail.EMAIL_VERIFICATION_REGION,
    });

    const templateSubscriptionPath = '../../lib/emailTemplates/Compra/';

    const transporter: Mail<SentMessageInfo> = createTransport({
      SES: { ses, aws },
    });

    // point to the template folder
    const hbsConfig = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, templateSubscriptionPath),
        layoutsDir: path.join(__dirname, templateSubscriptionPath),
        defaultLayout: '',
      },
      viewPath: path.join(__dirname, templateSubscriptionPath),
      extName: '.handlebars',
    };

    let recurringChargeText = '';
    if (
      purchaseDetails.paymentMedia === SubscriptionPlatforms.STRIPE_SUBSCRIPTION
    ) {
      recurringChargeText = RecurringCharge;
    }

    transporter.use('compile', hbs(hbsConfig));

    const options = {
      from: from,
      to: to,
      subject: subject,
      template: templateName,
      attachments: summaryCheckOutTemplateImages(templateSubscriptionPath),
      context: {
        Amount: purchaseDetails.amount,
        RenewDate: purchaseDetails.dueDate,
        Fullname: purchaseDetails.userFullName,
        IDRequest: purchaseDetails.transactionId,
        ActiveDate: purchaseDetails.activationDate,
        PaymentMedia: paymentMediaText(purchaseDetails.paymentMedia),
        RecurringCharge: recurringChargeText,
        Subscription: subscriptionText(suscription),
        mes: String(suscription),
      },
    };

    // SEND MAIL
    await transporter.sendMail(options);

    return true;
  }

  async sendReportErrorMail(
    from: string,
    to: string,
    {
      userEmail,
      userFullName,
      errorCategory,
      errorType,
      description,
    }: Record<string, string>,
    subject: string,
    html: string
  ) {
    const ses = new aws.SES({
      region: mail.EMAIL_VERIFICATION_REGION,
    });

    const transporter: Mail<SentMessageInfo> = createTransport({
      SES: { ses, aws },
    });

    html = html.replace('<username>', userFullName);
    html = html.replace('<email>', userEmail);
    html = html.replace('<errorcategory>', errorCategory);
    html = html.replace('<errortype>', errorType);
    html = html.replace(
      '<subject>',
      `${errorCategory} | ${errorType} | ${subject}`
    );
    html = html.replace('<description>', description);

    const options: SESTransport.MailOptions = {
      from,
      to,
      subject,
      html,
    };

    // SEND MAIL
    await transporter.sendMail(options);

    return true;
  }
}

export default new MailService();
