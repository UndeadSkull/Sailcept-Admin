import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, AUTH_TOKEN_KEY, subscribeToUnauthorized } from "./apiClient";

describe("apiClient 401 handling", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, "test-token");
  });

  it("triggers logout and clears auth token on 401 response", async () => {
    const unauthorizedListener = jest.fn();
    const unsubscribe = subscribeToUnauthorized(unauthorizedListener);

    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Unauthorized" }),
      } as Response)
    ) as jest.Mock;

    const response = await apiClient.get("/protected-route");

    expect(response.error?.code).toBe("HTTP_401");
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    expect(token).toBeNull();

    unsubscribe();
  });
});
