export type ApiResponse<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
};

export type ProfileResponse = {
  userId: number;
  ownerId: number;
  sailceptId: string;
  ownerName: string;
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  idType: string;
  idLast4: string;
  dateOfRegistration: string;
  isActive: boolean;
  lastLoginAt: string;
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

