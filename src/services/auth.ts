import { ApiResponse, User } from "../data/auth";

const MOCK_USER: User = {
  name: "Ethan Walker",
  phone: "+1 415 555 0134",
  email: "ethan.walker@sailcept.com",
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function loginWithPhone(phoneNumber: string): Promise<ApiResponse<void>> {
  await delay(600);
  if (!phoneNumber || phoneNumber.trim().length < 5) {
    return {
      data: null,
      error: { message: "Please enter a valid phone number.", code: "INVALID_PHONE" },
    };
  }
  return { data: null, error: null };
}

export async function verifyOtpCode(
  phoneNumber: string,
  code: string
): Promise<ApiResponse<{ token: string; user: User }>> {
  await delay(600);
  if (code !== "123456" && code !== "1234") {
    return {
      data: null,
      error: { message: "Invalid verification code. Please try again (use 123456).", code: "INVALID_OTP" },
    };
  }
  return {
    data: {
      token: `dummy-token-${phoneNumber}-${Date.now()}`,
      user: {
        ...MOCK_USER,
        phone: phoneNumber,
      },
    },
    error: null,
  };
}

export async function logoutUser(): Promise<ApiResponse<void>> {
  await delay(400);
  return { data: null, error: null };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  await delay(400);
  return { data: MOCK_USER, error: null };
}
