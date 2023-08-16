export declare interface TestPayments {
  cpl_signature: string;
  cpl_amount: string;
  cpl_transaction: string;
  cpl_auth_code: string;
}

export declare type TestResponse = {
  status: number;
  data: {
    code: 'SUCCESS' | 'FAILED' | 'ERROR' | '200';
    data: string;
    message: string;
  };
};
