import { fireEvent, render, within, waitFor } from "@testing-library/react-native";
import { ActionSheetIOS } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./App";

beforeEach(async () => {
  await AsyncStorage.setItem("@sailcept_admin_auth_token", "dummy-token");

  globalThis.fetch = jest.fn((url: string | URL | Request) => {
    const cleanUrl = String(url);
    if (cleanUrl.includes("/boats")) {
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve([
            { boatId: 1, boatName: "Vembanad Crest" },
            { boatId: 2, boatName: "Backwater Pearl" },
          ]),
      } as Response);
    }
    if (cleanUrl.includes("/overview/stats")) {
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            asOfDate: "2026-08-06",
            todaysTrips: 2,
            pendingRequests: 1,
            confirmedBookingsThisMonth: 5,
            bookingConversionRateLast30Days: 85,
          }),
      } as Response);
    }
    if (cleanUrl.includes("/notifications")) {
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ content: [] }),
      } as Response);
    }
    if (cleanUrl.includes("/availability/boats")) {
      if (cleanUrl.includes("/calendar")) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              boatId: 1,
              month: "2026-08",
              shared: false,
              physicalRoomCount: 2,
              days: [],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () =>
          Promise.resolve({
            boatId: 1,
            shared: false,
            physicalRoomCount: 2,
            fromDate: "2026-08-01",
            toDate: "2026-08-01",
            manualSalesRangeState: "OPEN",
            pricingRangeState: "OPEN",
            sharedInventoryRangeState: "UNIFORM",
            dates: [],
            addedBookings: [],
            allowedActions: {
              canOpen: true,
              canClose: true,
              canSetRates: true,
              canSetSharedInventory: true,
              canAddBooking: true,
              blockingReasons: [],
            },
          }),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ content: [] }),
    } as Response);
  }) as jest.Mock;
});

function dateKeyForCurrentMonth(day: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

async function renderApp() {
  const utils = render(<App />);
  await utils.findAllByText("Overview");
  return utils;
}

async function pressTab(utils: any, tabName: string) {
  const tabBtn = await utils.findByLabelText(new RegExp(`${tabName}, tab`, "i"));
  fireEvent.press(tabBtn);
}

describe("App", () => {
  it("shows overview content by default", async () => {
    const utils = await renderApp();
    expect((await utils.findAllByText("Overview")).length).toBeGreaterThan(0);
    expect(await utils.findByText(/Today's trips/i)).toBeTruthy();
  });

  it("shows main tabs in app shell", async () => {
    const utils = await renderApp();
    expect((await utils.findAllByText("Overview")).length).toBeGreaterThan(0);
    expect(await utils.findByText("Availability")).toBeTruthy();
    expect(await utils.findByText("Requests")).toBeTruthy();
    expect(await utils.findByText("Bookings")).toBeTruthy();
  });

  it("shows current month title and weekday headers", async () => {
    const utils = await renderApp();
    const now = new Date();
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const expectedMonthName = MONTHS[now.getMonth()];

    await pressTab(utils, "Availability");
    fireEvent.press(await utils.findByTestId("boat-card-vembanad-crest"));

    expect((await utils.findByTestId("home-calendar-month-title")).props.children).toBe(expectedMonthName);
    expect(await utils.findByText("Sun")).toBeTruthy();
    expect(await utils.findByText("Sat")).toBeTruthy();
  });

  it("propagates selected boat across all main screens", async () => {
    const utils = await renderApp();

    fireEvent.press(await utils.findByTestId("boat-selector-trigger"));
    fireEvent.press(await utils.findByTestId("boat-option-2"));

    expect((await utils.findAllByText("Backwater Pearl")).length).toBeGreaterThan(0);

    await pressTab(utils, "Availability");
    fireEvent.press(await utils.findByTestId("boat-card-backwater-pearl"));
    expect((await utils.findAllByText("Backwater Pearl")).length).toBeGreaterThan(0);

    await pressTab(utils, "Requests");
    expect((await utils.findAllByText("Requests")).length).toBeGreaterThan(0);

    await pressTab(utils, "Bookings");
    expect((await utils.findAllByText("Bookings")).length).toBeGreaterThan(0);
  });

  it("shows boat cards on availability screen", async () => {
    const utils = render(<App />);
    
    // Switch to Availability tab
    await pressTab(utils, "Availability");
    
    expect(await utils.findByTestId("boat-card-vembanad-crest")).toBeTruthy();
  });

  it("allows changing the month on availability screen", async () => {
    const utils = render(<App />);
    
    // Switch to Availability tab & select boat
    await pressTab(utils, "Availability");
    fireEvent.press(await utils.findByTestId("boat-card-vembanad-crest"));
    
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const expectedMonthName = MONTHS[now.getMonth()];
    const homeMonthTitle = await utils.findByTestId("home-calendar-month-title");
    expect(homeMonthTitle.props.children).toBe(expectedMonthName);
    
    // Press the next month button
    const nextBtn = await utils.findByTestId("home-month-next");
    fireEvent.press(nextBtn);
    
    const nextMonthIdx = (now.getMonth() + 1) % 12;
    const expectedNextMonthName = MONTHS[nextMonthIdx];
    const homeMonthTitleAfter = await utils.findByTestId("home-calendar-month-title");
    expect(homeMonthTitleAfter.props.children).toBe(expectedNextMonthName);
  });
});
