import { fireEvent, render, within, waitFor } from "@testing-library/react-native";
import { ActionSheetIOS } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "./App";

beforeEach(async () => {
  await AsyncStorage.setItem("@sailcept_admin_auth_token", "dummy-token");
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

    // Mock ActionSheetIOS to select "Backwater Pearl" (index 1)
    const spy = jest.spyOn(ActionSheetIOS, "showActionSheetWithOptions");
    spy.mockImplementationOnce((options, callback: (index: number) => void) => {
      callback(1); // Index 1 is Backwater Pearl
    });

    fireEvent.press(await findByTestId("boat-selector-trigger"));

    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Availability");
    fireEvent.press(await findByTestId("boat-card-backwater-pearl"));
    expect(await findByText("Backwater Pearl")).toBeTruthy();

    await pressByText(findAllByText, "Requests");
    expect(await findByText(/Temporary date locks are active/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Bookings");
    expect(await findByText(/Track accepted bookings with complete trip details/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();
  });


  it("shows skeleton loading cards on availability screen when calendar data is loading", async () => {
    const { findAllByText, findByTestId, queryAllByTestId } = render(<App />);
    
    // Switch to Availability tab
    await pressByText(findAllByText, "Availability");
    
    // We expect the skeleton loader container and skeleton boat cards to be displayed
    // since boats might be loading or the calendar is loading
    const skeletonGrid = await findByTestId("skeleton-loading-grid");
    expect(skeletonGrid).toBeTruthy();
    
    const skeletonCards = queryAllByTestId("skeleton-boat-card");
    expect(skeletonCards.length).toBeGreaterThan(0);
    
    // Wait for the skeleton loader to be replaced by the actual boat cards once loading finishes
    await waitFor(() => {
      expect(queryAllByTestId("skeleton-boat-card").length).toBe(0);
    });
    
    // Now we should see the real boat cards (e.g. Vembanad Crest)
    expect(await findByTestId("boat-card-vembanad-crest")).toBeTruthy();
  });

  it("allows changing the month on the outside overview screen and preserves it on detail screen", async () => {
    const { findAllByText, findByTestId, queryAllByTestId } = render(<App />);
    
    // Switch to Availability tab
    await pressByText(findAllByText, "Availability");

    // Wait for the skeleton loader to be replaced by the actual boat cards once loading finishes
    await waitFor(() => {
      expect(queryAllByTestId("skeleton-boat-card").length).toBe(0);
    });
    
    // Find the home month title and verify it shows the current month
    const now = new Date();
    const expectedMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const homeMonthTitle = await findByTestId("home-calendar-month-title");
    expect(homeMonthTitle.props.children).toBe(expectedMonth);
    
    // Press the next month button
    const nextBtn = await findByTestId("home-month-next");
    fireEvent.press(nextBtn);
    
    // Check that it changes to the next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const expectedNextMonth = nextMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
    expect(homeMonthTitle.props.children).toBe(expectedNextMonth);
    
    // Open the detailed calendar of a boat
    fireEvent.press(await findByTestId("boat-card-vembanad-crest"));
    
    // The detailed calendar should preserve and open in the next month
    const calendarMonthTitle = await findByTestId("calendar-month-title");
    expect(calendarMonthTitle.props.children).toBe(expectedNextMonth);
  });

});

