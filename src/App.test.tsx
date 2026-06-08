import { fireEvent, render, within } from "@testing-library/react-native";
import App from "./App";

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
    const { findAllByText, getByTestId } = await renderApp();
    const day3 = dateKeyForCurrentMonth(3);
    const day4 = dateKeyForCurrentMonth(4);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-vembanad-crest"));
    await pressByText(findAllByText, "Enable");

    fireEvent.press(getByTestId(`calendar-day-${day3}`));
    fireEvent.press(getByTestId(`calendar-day-${day4}`));
    
    // Open the bulk edit bottom sheet
    fireEvent.press(getByTestId("edit-selected-dates-button"));
    
    // Fill the price inside the bottom sheet
    fireEvent.changeText(getByTestId("modal-price-input-day"), "15000");
    
    // Save the changes
    await pressByText(findAllByText, "Save changes");

    expect(within(getByTestId(`calendar-day-${day3}`)).getByText("15000")).toBeTruthy();
    expect(within(getByTestId(`calendar-day-${day4}`)).getByText("15000")).toBeTruthy();
  });

  it("opens bottom sheet with cruise cards when a date is tapped", async () => {
    const { findAllByText, getByTestId, findByText } = await renderApp();
    const day5 = dateKeyForCurrentMonth(5);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-vembanad-crest"));
    fireEvent.press(getByTestId(`calendar-day-${day5}`));

    // Bottom sheet should show cruise type labels
    expect(await findByText("Day cruise")).toBeTruthy();
    expect(await findByText("Overnight")).toBeTruthy();
    expect(await findByText("Night stay")).toBeTruthy();
    expect(await findByText("Save changes")).toBeTruthy();
  });

  it("shows current month title and weekday headers", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();
    const now = new Date();
    const expectedMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-vembanad-crest"));

    expect(getByTestId("calendar-month-title").props.children).toBe(expectedMonth);
    expect(await findByText("Sun")).toBeTruthy();
    expect(await findByText("Sat")).toBeTruthy();
  });

  it("enables bulk pricing on day long press", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();
    const day6 = dateKeyForCurrentMonth(6);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-vembanad-crest"));
    fireEvent(getByTestId(`calendar-day-${day6}`), "longPress");

    expect(await findByText("1 date selected")).toBeTruthy();
  });

  it("propagates selected boat across all main screens", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();

    // Mock ActionSheetIOS to select "Backwater Pearl" (index 1)
    const spy = jest.spyOn(require("react-native").ActionSheetIOS, "showActionSheetWithOptions");
    spy.mockImplementationOnce((options, callback: any) => {
      callback(1); // Index 1 is Backwater Pearl
    });

    fireEvent.press(getByTestId("boat-selector-trigger"));

    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-backwater-pearl"));
    expect(await findByText("Backwater Pearl")).toBeTruthy();

    await pressByText(findAllByText, "Requests");
    expect(await findByText(/Temporary date locks are active/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Bookings");
    expect(await findByText(/Track accepted bookings with complete trip details/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();
  });

});
