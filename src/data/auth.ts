export type ApiResponse<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
};

export type User = {
  sailceptId: string;
  boatOwnerUserId?: number;
  name: string;
  phone: string;
  email: string;
};

export type LoginRequest = {
  sailceptId: string;
  password: string;
};

export type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
  boatOwnerUserId: number;
  sailceptId: string;
};

export type LoginCredentials = {
  sailceptId: string;
  password: string;
};

export type OtpVerification = {
  phoneNumber: string;
  code: string;
};
