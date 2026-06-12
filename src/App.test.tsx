import { fireEvent, render, within } from "@testing-library/react-native";
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

    expect(within(getByTestId(`calendar-day-${day3}`)).getByText("15,000")).toBeTruthy();
    expect(within(getByTestId(`calendar-day-${day4}`)).getByText("15,000")).toBeTruthy();
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

  it("shows '+ Add booking' button and can add a new booking via the modal with quantities and custom booked amount", async () => {
    const { findAllByText, getByTestId, findByText, queryByText } = await renderApp();
    const day10 = dateKeyForCurrentMonth(10);

    await pressByText(findAllByText, "Availability");
    fireEvent.press(getByTestId("boat-card-vembanad-crest"));
    fireEvent.press(getByTestId(`calendar-day-${day10}`));

    // Verify "+ Add booking" button is visible for day cruise
    const addBookingBtn = getByTestId("add-booking-button-day");
    expect(addBookingBtn).toBeTruthy();

    // Click "+ Add booking"
    fireEvent.press(addBookingBtn);

    // Verify form fields are visible in modal
    const nameInput = getByTestId("form-guest-name");
    const countInput = getByTestId("form-guest-count");
    const basePriceInput = getByTestId("form-base-price");
    const extraPriceInput = getByTestId("form-extra-1");
    const extraQtyInput = getByTestId("form-extra-1-qty");
    const bookedAmountInput = getByTestId("form-booked-amount");
    const notesInput = getByTestId("form-notes");
    const confirmBtn = getByTestId("form-confirm-button");

    expect(nameInput).toBeTruthy();
    expect(countInput).toBeTruthy();
    expect(basePriceInput).toBeTruthy();
    expect(extraPriceInput).toBeTruthy();
    expect(extraQtyInput).toBeTruthy();
    expect(bookedAmountInput).toBeTruthy();
    expect(notesInput).toBeTruthy();

    // Fill the form and check auto-calculation
    fireEvent.changeText(nameInput, "Alice Smith");
    fireEvent.changeText(countInput, "5");
    fireEvent.changeText(basePriceInput, "13000");
    fireEvent.changeText(extraPriceInput, "1000");
    fireEvent.changeText(extraQtyInput, "2");
    fireEvent.changeText(notesInput, "No seafood");

    // Booked amount should be auto-calculated to 13000 + 1000 * 2 = 15000
    expect(bookedAmountInput.props.value).toBe("15,000");

    // Manually override the booked amount to 14,500
    fireEvent.changeText(bookedAmountInput, "14500");

    // Change base price to 12,000 and ensure booked amount is NOT auto-recalculated (remains 14,500)
    fireEvent.changeText(basePriceInput, "12000");
    expect(bookedAmountInput.props.value).toBe("14,500");

    // Click confirm
    fireEvent.press(confirmBtn);

    // Now the form should close and show "Booked" pill and details
    expect(await findByText("Booked")).toBeTruthy();
    expect(await findByText(/Alice Smith · 5 guests · Notes: No seafood/)).toBeTruthy();
    expect(await findByText(/Base Rate: ₹12,000/)).toBeTruthy();
    expect(await findByText(/Extra Guest \(x2\): ₹2,000/)).toBeTruthy();
    expect(await findByText(/Booked For: ₹14,500/)).toBeTruthy();

    // Click edit booking
    const editBtn = getByTestId("edit-booking-button-day");
    fireEvent.press(editBtn);

    // Verify the form fields are pre-filled
    expect(getByTestId("form-guest-name").props.value).toBe("Alice Smith");
    expect(getByTestId("form-base-price").props.value).toBe("12,000");
    expect(getByTestId("form-extra-1-qty").props.value).toBe("2");
    expect(getByTestId("form-booked-amount").props.value).toBe("14,500");

    // Modify details
    fireEvent.changeText(getByTestId("form-guest-name"), "Alice Johnson");
    fireEvent.changeText(getByTestId("form-extra-1-qty"), "3");

    // Save changes
    fireEvent.press(getByTestId("form-confirm-button"));

    // Verify updated details
    expect(await findByText(/Alice Johnson · 5 guests · Notes: No seafood/)).toBeTruthy();
    expect(await findByText(/Extra Guest \(x3\): ₹3,000/)).toBeTruthy();
    expect(await findByText(/Booked For: ₹14,500/)).toBeTruthy();

    // Click remove booking
    const removeBtn = getByTestId("remove-booking-button-day");
    fireEvent.press(removeBtn);

    // Verify it goes back to "+ Add booking"
    expect(queryByText("Booked")).toBeNull();
    expect(getByTestId("add-booking-button-day")).toBeTruthy();
  });

});
