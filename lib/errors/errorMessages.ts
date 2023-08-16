// Messages ending with semicolon :
// Must be constructed using error message plus the missing property
// ex: throw new Error(`${ErrorMessage.MISSING_PARAM_VALUE} lessonId`);
export enum ErrorMessage {
  // 400 ERROR MESSAGES
  EMAIL_UNVERIFIED = 'El usuario no ha verificado su correo electrónico',
  EMAIL_ALREADY_REGISTER = 'Este correo electrónico ya está registrado',
  EMAIL_NOT_REGISTER = 'Este correo electrónico no está registrado',
  USERNAME_ALREADY_REGISTER = 'Este nombre de usuario ya está registrado',
  INVALID_CREDENTIALS = 'El correo electrónico o la contraseña no son válidos',
  INVALID_EMAIL = 'El correo electrónico no es válido',
  INVALID_PHONE_NUMBER = 'El teléfono no es válido',
  INVALID_USERNAME = 'Nombre de usuario no válido',
  PASSWORD_NOT_STRONG = 'Contraseña no es lo suficientemente fuerte',
  USERNAME_TOO_LONG = 'Prueba un nombre de usuario más corto',
  USERNAME_IS_PROFANE = 'El nombre de usuario no debe contener groserías.',
  STUDENT_LINKED_PARENT = 'El estudiante ya tiene un padre registrado',
  TERMS_AND_CONDITIONS_NOT_ACCEPTED = 'Los Términos y Condiciones no han sido aceptados',
  AUTH_TOKEN_EXPIRED = 'El link ha caducado',
  USER_NOT_FOUND = 'Usuario no registrado',
  PARENT_NOT_FOUND = 'Usuario no registrado',
  STUDENT_NOT_FOUND = 'Usuario no registrado',

  // NOT FRONT END MESSAGES
  NOT_PARENT_USER = 'Not a parent user',
  NOT_STUDENT_USER = 'Not a student user',
  RECORD_NOT_FOUND = 'No record was found:',
  RECORDS_ARRAY_NOT_FOUND = 'No records were found:',
  MISSING_QUERY_VALUE = 'Missing url query value:',
  MISSING_PARENT_INFORMATION = 'Parent information was not found',

  INVALID_AVATAR = 'Invalid Avatar Type',
  INVALID_MONGO_ID = 'Invalid ID',
  INVALID_QUERY_STRING = 'Search Query: The query string provided is not valid to perform a secure search.',

  WRONG_REQUEST_PROP_VALUE = 'Incorrect value from request property:',
  MISSING_REQUEST_PROP = 'Missing required property from request body:',
  MISSING_PARAM_VALUE = 'Missing url param value:',
  INVALID_VALUE = 'Incorrect value provided:',
  INVALID_PLAY_STORE_PURCHASE_TOKEN = 'Play store: purchase token must be a string',
  INVALID_PRODUCT_ID = 'ProductId must be a string',
  INVALID_STEP_BY_STEP_ID = 'stepByStepId must be a string',
  INVALID_IS_LIKE = 'isLike must be a string',

  // 500 ERROR MESSAGES
  AUTH_TOKEN_MISSING = 'Auth Header: No token provided',
  AUTH_SECRET_MISSING = 'Auth Secret: Valiue is undefined',
  SUBSCRIPTION_NOT_FOUND = 'Parent Record: subscription property is undefined',
  SUBSCRIPTION_NO_DUEDATE = 'Parent Record: subscription has no property dueDate',

  CALENDAR_WEEK = 'School Calendar: current week has no record',
  CALENDAR_VIDEOGAME = 'School Calendar: There is no VIDEOGAME asset associated to this week',
  CALENDAR_SUBSKILL = 'School Calendar: There is no SUBSKILL (relatedSubSkillsId) associated to this week',

  GCP_MISSING_VARIABLE = 'GCP: GCLOUD_SERVICE_ACCOUNT value is undefined',
  GCP_REMOVE_FILE = 'GCP: Removing credentials file',

  PLAY_STORE_SUBSCRIPTIONTYPE_NOT_FOUND = 'Play Store: SubscriptionType not found',

  APP_STORE_MISSING_PRIVATE_KEY = 'App Store: PRIVATE_KEY not provided.',
  APP_STORE_MISSING_TEST_NOTIFICATION_URL = 'App Store: TEST_NOTIFICATION_URL not provided.',
  APP_STORE_MISSING_API_KEY_ID = 'App Store: API_KEY_ID not provided.',
  APP_STORE_MISSING_TRANSACTION_ID = 'App Store: A transaction ID is needed',
  APP_STORE_REQUIRED_TRANSACTION_ID = 'App Store: Original transaction ID required',
  APP_STORE_TRANSACTION_ID_STRING = 'App Store: Original transaction ID has to be a string',
  APP_STORE_LINKED_PARENT = 'App Store: The parent user already has a testmax membership',
  APP_STORE_NOT_AUTH = 'App Store: ERROR has ocurred on load payment info',

  EMAIL_VERIFICATION_MISSING = 'Email verification address is undefined',
  FETCH_IFRAME_VIDEO = 'Vimeo: Unable to fetch the iframe video',

  STRIPE_MISSING_UNIT_AMOUNT = "Stripe Price: UNIT_AMOUNT product's price not found",
  STRIPE_MISSING_NICKNAME = "Stripe Price: NICKNAME product's price not found",
  STRIPE_MISSING_METADATA = 'Stripe: No metadata was saved on checkout session',
  STRIPE_MISSING_AMOUNT_TOTAL = 'Stripe: No amount_total was saved on checkout session',
  STRIPE_MISSING_PRODUCT_VALUES = 'Stripe: Product values are missing',
  STRIPE_USER_NOT_RELATED_TO_SUBSCRIPTION = 'Stripe: This user is not related to any subscription',

  TEST_MISSING_TOKEN = 'Test: Missing token key',

  AWS_SEND_MAIL = 'AWS SendMail: Unable to send email',
  SUBSCRIPTION_ACTIVE = 'El usuario ya cuenta con una suscripcion activa',
}
