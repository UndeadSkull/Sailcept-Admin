import { fireEvent, render, within } from '@testing-library/react-native';
import App from './App';

function dateKeyForCurrentMonth(day: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(day).padStart(2, '0');

  return `${year}-${month}-${date}`;
}

describe('App', () => {
  it('shows overview content by default', () => {
    const { getByText, getAllByText } = render(<App />);

    expect(getAllByText('Overview').length).toBeGreaterThan(0);
    expect(getByText('Your houseboat performance at a glance')).toBeTruthy();
  });

  it('shows main tabs in app shell', () => {
    const { getByText } = render(<App />);

    expect(getByText('Boat')).toBeTruthy();
    expect(getByText('Calendar')).toBeTruthy();
    expect(getByText('Bookings')).toBeTruthy();
  });

  it('applies one cruise-type price to multiple selected dates in bulk mode', () => {
    const { getByText, getByTestId } = render(<App />);
    const day3 = dateKeyForCurrentMonth(3);
    const day4 = dateKeyForCurrentMonth(4);

    fireEvent.press(getByText('Calendar'));
    fireEvent.press(getByText('Enable'));

    fireEvent.press(getByTestId(`calendar-day-${day3}`));
    fireEvent.press(getByTestId(`calendar-day-${day4}`));
    fireEvent.changeText(getByTestId('bulk-price-day'), '15000');
    fireEvent.press(getByText('Apply Price'));

    expect(within(getByTestId(`calendar-day-${day3}`)).getByText('₹15k')).toBeTruthy();
    expect(within(getByTestId(`calendar-day-${day4}`)).getByText('₹15k')).toBeTruthy();
  });

  it('keeps overnight and night mutually exclusive', () => {
    const { getByText, getByTestId } = render(<App />);
    const day5 = dateKeyForCurrentMonth(5);

    fireEvent.press(getByText('Calendar'));
    fireEvent.press(getByTestId(`calendar-day-${day5}`));
    expect(getByTestId('day-edit-modal')).toBeTruthy();

    fireEvent(getByTestId('availability-switch-nightCruise'), 'valueChange', true);

    fireEvent.press(getByText('Done'));

    fireEvent.press(getByTestId(`calendar-day-${day5}`));

    expect(getByTestId('availability-switch-overnightCruise').props.value).toBe(false);
    expect(getByTestId('availability-switch-nightCruise').props.value).toBe(true);
  });

  it('shows current month title and weekday headers', () => {
    const { getByText, getByTestId } = render(<App />);
    const now = new Date();
    const expectedMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    fireEvent.press(getByText('Calendar'));

    expect(getByTestId('calendar-month-title').props.children).toBe(expectedMonth);
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('enables bulk pricing on day long press', () => {
    const { getByText, getByTestId } = render(<App />);
    const day6 = dateKeyForCurrentMonth(6);

    fireEvent.press(getByText('Calendar'));
    fireEvent(getByTestId(`calendar-day-${day6}`), 'longPress');

    expect(getByText('1 date selected')).toBeTruthy();
  });
});
