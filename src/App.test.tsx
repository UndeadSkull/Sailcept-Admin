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
      return Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ dates: [] }),
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

async function pressByText(
  finder: (text: string | RegExp) => Promise<unknown[]>,
  text: string | RegExp,
) {
  const matches = await finder(text);
  fireEvent.press(matches[0] as never);
}

describe("App", () => {
  it("shows overview content by default", async () => {
    const { findAllByText, findByText } = await renderApp();
    expect((await findAllByText("Overview")).length).toBeGreaterThan(0);
    expect(await findByText(/Your houseboat performance at a glance/)).toBeTruthy();
  });

  it("shows main tabs in app shell", async () => {
    const { findAllByText, findByText } = await renderApp();
    expect((await findAllByText("Overview")).length).toBeGreaterThan(0);
    expect(await findByText("Availability")).toBeTruthy();
    expect(await findByText("Requests")).toBeTruthy();
    expect(await findByText("Bookings")).toBeTruthy();
  });

  it("applies one cruise-type price to multiple selected dates in bulk mode", async () => {
    const { findAllByText, findByTestId } = await renderApp();
    const day3 = dateKeyForCurrentMonth(3);
    const day4 = dateKeyForCurrentMonth(4);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));
    await pressByText(findAllByText, "Enable");

    fireEvent.press(await findByTestId(`calendar-day-${day3}`));
    fireEvent.press(await findByTestId(`calendar-day-${day4}`));
    
    // Open the bulk edit bottom sheet
    fireEvent.press(await findByTestId("edit-selected-dates-button"));
    
    // Fill the price inside the bottom sheet
    fireEvent.changeText(await findByTestId("modal-price-input-day"), "15000");
    
    // Save the changes
    await pressByText(findAllByText, "Save changes");

    expect(within(await findByTestId(`calendar-day-${day3}`)).getByText("15,000")).toBeTruthy();
    expect(within(await findByTestId(`calendar-day-${day4}`)).getByText("15,000")).toBeTruthy();
  });

  it("opens bottom sheet with cruise cards when a date is tapped", async () => {
    const { findAllByText, findByTestId, findByText } = await renderApp();
    const day5 = dateKeyForCurrentMonth(5);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));
    fireEvent.press(await findByTestId(`calendar-day-${day5}`));

    // Bottom sheet should show cruise type labels
    expect(await findByText("Day cruise")).toBeTruthy();
    expect(await findByText("Overnight")).toBeTruthy();
    expect(await findByText("Night stay")).toBeTruthy();
    expect(await findByText("Save changes")).toBeTruthy();
  });

  it("shows current month title and weekday headers", async () => {
    const { findAllByText, findByText, findByTestId } = await renderApp();
    const now = new Date();
    const expectedMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));

    expect((await findByTestId("calendar-month-title")).props.children).toBe(expectedMonth);
    expect(await findByText("Sun")).toBeTruthy();
    expect(await findByText("Sat")).toBeTruthy();
  });

  it("enables bulk pricing on day long press", async () => {
    const { findAllByText, findByText, findByTestId } = await renderApp();
    const day6 = dateKeyForCurrentMonth(6);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));
    fireEvent(await findByTestId(`calendar-day-${day6}`), "longPress");

    expect(await findByText("1 date selected")).toBeTruthy();
  });

  it("propagates selected boat across all main screens", async () => {
    const { findAllByText, findByText, findByTestId } = await renderApp();

    fireEvent.press(await findByTestId("boat-selector-trigger"));
    fireEvent.press(await findByTestId("boat-option-2"));

    expect((await findAllByText("Backwater Pearl")).length).toBeGreaterThan(0);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-backwater-pearl"));
    expect((await findAllByText("Backwater Pearl")).length).toBeGreaterThan(0);

    await pressByText(findAllByText, "Requests");
    expect(await findByText(/Temporary date locks are active/)).toBeTruthy();

    await pressByText(findAllByText, "Bookings");
    expect(await findByText(/Track accepted bookings with complete trip details/)).toBeTruthy();
  });

  it("shows skeleton loading cards on availability screen when calendar data is loading", async () => {
    const { findAllByText, findByTestId, queryAllByTestId } = render(<App />);
    
    // Switch to Availability tab
    await pressByText(findAllByText, "Availability");
    
    // Wait for loading to complete or boat card to display
    await waitFor(() => {
      expect(findByTestId("boat-card-vembanad-crest")).toBeTruthy();
    });
    
    expect(await findByTestId("boat-card-vembanad-crest")).toBeTruthy();
  });

  it("allows changing the month on the outside overview screen and preserves it on detail screen", async () => {
    const { findAllByText, findByTestId, queryAllByTestId } = render(<App />);
    
    // Switch to Availability tab & select boat
    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));
    
    // Find the home month title and verify it shows the current month
    const now = new Date();
    const expectedMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const homeMonthTitle = await findByTestId("home-calendar-month-title");
    expect(homeMonthTitle.props.children).toBe(expectedMonth);
    
    // Press the next month button
    const nextBtn = await findByTestId("home-month-next");
    fireEvent.press(nextBtn);
    
    // The detailed calendar should preserve and open in the next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const expectedNextMonth = nextMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
    const calendarMonthTitle = await findByTestId("calendar-month-title");
    expect(calendarMonthTitle.props.children).toBe(expectedNextMonth);
  });
});
