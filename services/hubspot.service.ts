import { Types } from 'mongoose';
import request from 'request';

import { config } from '../config';
import { UTCDate } from '../lib/helpers/generateDates';
import { logger } from '../lib/logger';
import { TrkDailyDashboardVisitModel } from '../models/hubspotDailyDashboardVisit.model';
import {
  AuthProps,
  HubspotEventName,
  HubspotGPI_reponseBody,
  ParentHubspotProps,
  StorePaymentNotificationHubspotProps,
  StorePlanNotificationHubspotProps,
  StudentHubspotProps,
  UpdateParentInfoProps,
  UpdateParentNoEmailProps,
} from '../types/Hubspot';

class HubspotService {
  storePaymentNotificationHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StorePaymentNotificationHubspotProps
  ) {
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.user_email,
        eventName: 'pe22409842_store_payment_notification',
        properties: {
          transaction_id: userProps.transaction_id,
          store_status: userProps.store_status,
          store: userProps.store,
          purchase_date: userProps.purchase_date,
          product_id: userProps.product_id,
          user_id: userProps.user_id,
          user_email: userProps.user_email,
        },
      }),
    };

    request(options, function (error: string) {
      if (error) {
        logger.error('fucn:storePaymentNotificationHttpRequest');
        logger.error(error);
        throw new Error(error);
      }
    });
  }

  paymentPlanHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StorePlanNotificationHubspotProps,
    eventName: `${HubspotEventName}`
  ) {
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.user_email,
        eventName: eventName.toString(),
        properties: {
          user_id: userProps.user_id,
          created_at: userProps.created_at, //new Date().toISOString(),
        },
      }),
    };

    request(options, function (error: string) {
      if (error) {
        logger.error('fucn:paymentPlanHttpRequest');
        logger.error(error);
        throw new Error(error);
      }
    });
  }

  updateParentInfoHttpRequest(
    url: string,
    authProperties: AuthProps,
    optionsProps: UpdateParentNoEmailProps
  ) {
    const options = {
      method: 'PATCH',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProperties.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        properties: optionsProps,
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  getParentInfoHttpRequest(
    url: string,
    authProperties: AuthProps,
    updateParentInfo: UpdateParentInfoProps
  ) {
    const options = {
      method: 'POST',
      url: url, //'https://api.hubapi.com/crm/v3/objects/contacts/search',
      headers: {
        authorization: 'Bearer ' + authProperties.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: updateParentInfo.email,
              },
            ],
          },
        ],
      }),
    };

    request(options, (error: string, response: request.Response) => {
      if (error) throw new Error(error);

      const bodyString = response.body as string;
      const responseParsed: HubspotGPI_reponseBody = JSON.parse(
        bodyString
      ) as HubspotGPI_reponseBody;
      if (responseParsed.results && responseParsed.results.length > 0) {
        const parentHubspotId = responseParsed.results[0].id;
        const optionsProps: UpdateParentNoEmailProps = {};

        if (updateParentInfo.firstname && updateParentInfo.firstname != '') {
          optionsProps.firstname = updateParentInfo.firstname;
        }
        if (updateParentInfo.lastname && updateParentInfo.lastname != '') {
          optionsProps.lastname = updateParentInfo.lastname;
        }
        const url =
          'https://api.hubapi.com/crm/v3/objects/contacts/' + parentHubspotId;
        const authProperties = {
          authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
        };
        this.updateParentInfoHttpRequest(url, authProperties, optionsProps);
      }
    });
  }

  parentOnboardingCompleteHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StudentHubspotProps
  ) {
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.parentEmail,
        eventName: 'pe22409842_onboarding_completed',
        properties: {
          parent_id: userProps.parent_id,
          student_id: userProps.student_id,
        },
        occurredAt: new Date().toISOString(),
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  studentRemovedCompleteHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StudentHubspotProps
  ) {
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.parentEmail,
        eventName: 'pe22409842_removed_student',
        properties: {
          student_username: userProps.username,
        },
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  parentDashboardDailyVisitHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StudentHubspotProps
  ) {
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.parentEmail,
        eventName: 'pe22409842_parents_dashboard_daily_visit',
        properties: {
          parent_id: userProps.parent_id,
          email: userProps.parentEmail,
          visited_date: new Date().toISOString(),
        },
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  studentHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: StudentHubspotProps
  ) {
    //Variable de Ambiente
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.parentEmail,
        eventName: 'pe22409842_registration_completed_student',
        properties: {
          profile_type: 'Student',
          username: userProps.username,
          parent_id: userProps.parent_id,
          student_id: userProps.student_id,
        },
        occurredAt: new Date().toISOString(),
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  parentHttpRequest(
    url: string,
    authProps: AuthProps,
    userProps: ParentHubspotProps
  ) {
    //Variable de Ambiente
    const options = {
      method: 'POST',
      url: url,
      headers: {
        authorization: 'Bearer ' + authProps.authToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        utk: '',
        email: userProps.email,
        eventName: 'pe22409842_registration_completed',
        properties: {
          profile_type: 'Parent',
          first_name: userProps.first_name,
          last_name: userProps.last_name ? userProps.last_name : '',
          parent_id: userProps.parent_id,
          email: userProps.email,
        },
        occurredAt: new Date().toISOString(),
      }),
    };

    request(options, function (error: string) {
      if (error) throw new Error(error);
    });
  }

  getParentHubspotInfo(updateParentInfo: UpdateParentInfoProps) {
    const url = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };

    const newParentInfoObject: UpdateParentInfoProps = {
      email: updateParentInfo.email,
    };

    if (updateParentInfo.firstname && updateParentInfo.firstname != '') {
      newParentInfoObject.firstname = updateParentInfo.firstname;
    }
    if (updateParentInfo.lastname && updateParentInfo.lastname != '') {
      newParentInfoObject.lastname = updateParentInfo.lastname;
    }

    this.getParentInfoHttpRequest(url, authProperties, newParentInfoObject);
  }

  registerParent(parentHubspotProps: ParentHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };

    this.parentHttpRequest(url, authProperties, parentHubspotProps);
  }

  registerStudent(studentHubspotProps: StudentHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    this.studentHttpRequest(url, authProperties, studentHubspotProps);
  }

  onboardingParentComplete(studentHubspotProps: StudentHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    this.parentOnboardingCompleteHttpRequest(
      url,
      authProperties,
      studentHubspotProps
    );
  }

  onRemoveStudent(studentHubspotProps: StudentHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    this.studentRemovedCompleteHttpRequest(
      url,
      authProperties,
      studentHubspotProps
    );
  }

  onDailyParentDashboardVisit(studentHubspotProps: StudentHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    this.parentDashboardDailyVisitHttpRequest(
      url,
      authProperties,
      studentHubspotProps
    );
  }

  async findDailyParentDashboardVisit(parentId: Types.ObjectId, date: string) {
    return await TrkDailyDashboardVisitModel.findOne({
      parentId,
      visitedAt: date,
    });
  }

  async saveDailyParentDashboardVisit(parentId: Types.ObjectId, date: string) {
    const trkHubspotDailyVisit = new TrkDailyDashboardVisitModel({
      parentId,
      visitedAt: date,
      createdAt: UTCDate(),
    });
    await trkHubspotDailyVisit.save();
  }

  // PAYMENT
  savePaymentEvent(storePaymentProps: StorePaymentNotificationHubspotProps) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    this.storePaymentNotificationHttpRequest(
      url,
      authProperties,
      storePaymentProps
    );
  }

  // PAYMENT
  savePaymentPlanEvent(
    storePaymentPlanProps: StorePlanNotificationHubspotProps,
    planNameRaw: string
  ) {
    const url = config.hubspot.HUBSPOT_URL;
    const authProperties = {
      authToken: config.hubspot.HUBSPOT_AUTH_TOKEN,
    };
    let planName: `${HubspotEventName}` = HubspotEventName.ONE_MONTH_PLAN;

    switch (planNameRaw) {
      case 'com.e1technology.testmax.1dayl_subs':
      case 'e1tech.testmax.oneday':
        planName = HubspotEventName.ONE_DAY_PLAN;
        break;
      case 'com.e1technology.testmax.week_subs':
      case 'e1tech.testmax.weekly':
        planName = HubspotEventName.SEVEN_DAY_PLAN;
        break;
      case 'com.e1technology.testmax.3months_subs':
      case 'e1tech.testmax.quarterly':
      case 'e1technology.testmax.quarterly':
        planName = HubspotEventName.THREE_MONTH_PLAN;
        break;
      case 'com.e1technology.testmax.6months_subs':
      case 'e1tech.testmax.semiannual':
        planName = HubspotEventName.SIX_MONTH_PLAN;
        break;
      case 'com.e1technology.testmax.anual_v2':
      case 'e1tech.testmax.annual_50':
        planName = HubspotEventName.TWELVE_MONTH_PLAN;
        break;
      default:
        planName = HubspotEventName.ONE_MONTH_PLAN;
        break;
    }

    this.paymentPlanHttpRequest(
      url,
      authProperties,
      storePaymentPlanProps,
      planName
    );
  }
}

export default new HubspotService();
