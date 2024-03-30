export interface ApiRequest {
  type: string;
  data: any;
}

export interface ApiResponse {
  code: number;
  msg: string;
  data: any;
  success: boolean;
}

export enum Result {
  Success = 0,
  Fail = 1
}

export const success = (data: any): ApiResponse => {
  return {
    code: Result.Success,
    msg: 'success',
    data,
    success: true
  };
};

export const fail = (msg: string, data: any = null): ApiResponse => {
  return {
    code: Result.Fail,
    msg,
    data,
    success: false
  };
};
