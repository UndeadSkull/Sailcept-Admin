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
    expect(await findByText("Calendar")).toBeTruthy();
    expect(await findByText("Enquiries")).toBeTruthy();
    expect(await findByText("Bookings")).toBeTruthy();
  });

  it("applies one cruise-type price to multiple selected dates in bulk mode", async () => {
    const { findAllByText, getByTestId } = await renderApp();
    const day3 = dateKeyForCurrentMonth(3);
    const day4 = dateKeyForCurrentMonth(4);

    await pressByText(findAllByText, "Calendar");
    await pressByText(findAllByText, "Enable");

    fireEvent.press(getByTestId(`calendar-day-${day3}`));
    fireEvent.press(getByTestId(`calendar-day-${day4}`));
    fireEvent.changeText(getByTestId("bulk-price-day"), "15000");
    await pressByText(findAllByText, "Apply Price");

    expect(within(getByTestId(`calendar-day-${day3}`)).getByText("15000")).toBeTruthy();
    expect(within(getByTestId(`calendar-day-${day4}`)).getByText("15000")).toBeTruthy();
  });

  it("keeps overnight and night mutually exclusive", async () => {
    const { findAllByText, getByTestId } = await renderApp();
    const day5 = dateKeyForCurrentMonth(5);

    await pressByText(findAllByText, "Calendar");
    fireEvent.press(getByTestId(`calendar-day-${day5}`));
    expect(getByTestId("day-edit-modal")).toBeTruthy();

    fireEvent(getByTestId("availability-switch-nightCruise"), "valueChange", true);
    await pressByText(findAllByText, "Done");
    fireEvent.press(getByTestId(`calendar-day-${day5}`));

    expect(getByTestId("availability-switch-overnightCruise").props.value).toBe(false);
    expect(getByTestId("availability-switch-nightCruise").props.value).toBe(true);
  });

  it("shows current month title and weekday headers", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();
    const now = new Date();
    const expectedMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    await pressByText(findAllByText, "Calendar");

    expect(getByTestId("calendar-month-title").props.children).toBe(expectedMonth);
    expect(await findByText("Sun")).toBeTruthy();
    expect(await findByText("Sat")).toBeTruthy();
  });

  it("enables bulk pricing on day long press", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();
    const day6 = dateKeyForCurrentMonth(6);

    await pressByText(findAllByText, "Calendar");
    fireEvent(getByTestId(`calendar-day-${day6}`), "longPress");

    expect(await findByText("1 date selected")).toBeTruthy();
  });

  it("closes boat dropdown on outside tap", async () => {
    const { getByTestId, queryByTestId } = await renderApp();

    fireEvent.press(getByTestId("boat-selector-trigger"));
    expect(getByTestId("boat-dropdown-backdrop")).toBeTruthy();

    fireEvent.press(getByTestId("boat-dropdown-backdrop"));
    expect(queryByTestId("boat-dropdown-backdrop")).toBeNull();
  });

  it("propagates selected boat across all main screens", async () => {
    const { findAllByText, findByText, getByTestId } = await renderApp();

    fireEvent.press(getByTestId("boat-selector-trigger"));
    fireEvent.press(getByTestId("boat-option-backwater-pearl"));

    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Calendar");
    expect(await findByText(/Availability calendar/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Enquiries");
    expect(await findByText(/Temporary date locks are active/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    await pressByText(findAllByText, "Bookings");
    expect(await findByText(/Track accepted bookings with complete trip details/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();

    fireEvent.press(getByTestId("header-boat-button"));
    expect(await findByText(/Boat asset definition/)).toBeTruthy();
    expect(await findByText(/Boat: Backwater Pearl/)).toBeTruthy();
  });
});
