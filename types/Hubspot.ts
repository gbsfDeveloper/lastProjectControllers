export interface AuthProps {
  authToken: string;
}

export interface UpdateParentInfoProps {
  email: string;
  firstname?: string;
  lastname?: string;
}

export interface UpdateParentNoEmailProps {
  firstname?: string;
  lastname?: string;
}

export interface HubspotGPI_reponseBody {
  total: string;
  results: Array<HubspotGPI_resultsElement>;
}
export interface HubspotGPI_resultsElement {
  id: string;
  properties: HubspotGPI_properties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
export interface HubspotGPI_properties {
  createdate?: string;
  email?: string;
  firstname?: string;
  hs_object_id?: string;
  lastmodifieddate?: string;
  lastname?: string;
}

export interface ParentHubspotProps {
  email: string;
  first_name: string;
  last_name?: string;
  parent_id: string;
}

export interface StudentHubspotProps {
  parentEmail: string;
  username: string;
  parent_id: string;
  student_id: string;
}

export interface StorePaymentNotificationHubspotProps {
  transaction_id: string;
  store_status: string;
  store: string;
  purchase_date: string;
  product_id: string;
  user_id: string;
  user_email: string;
}

export interface StorePlanNotificationHubspotProps {
  user_id: string;
  created_at: string;
  user_email: string;
}

export enum HubspotEventName {
  ONE_DAY_PLAN = 'pe22409842_plan_1day',
  SEVEN_DAY_PLAN = 'pe22409842_plan_7days',
  ONE_MONTH_PLAN = 'pe22409842_plan_1month',
  THREE_MONTH_PLAN = 'pe22409842_plan_3months',
  SIX_MONTH_PLAN = 'pe22409842_plan_6months',
  TWELVE_MONTH_PLAN = 'pe22409842_plan_12months',
}
