export type ApiResponse<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
};

export type User = {
  name: string;
  phone: string;
  email: string;
};

export type LoginCredentials = {
  phoneNumber: string;
};

export type OtpVerification = {
  phoneNumber: string;
  code: string;
};
