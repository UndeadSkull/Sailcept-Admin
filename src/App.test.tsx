import { fireEvent, render, within } from '@testing-library/react-native';
import App from './App';

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

  it('applies one price to multiple selected dates in bulk mode', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<App />);

    fireEvent.press(getByText('Calendar'));
    fireEvent.press(getByText('Enable bulk price mode'));

    fireEvent.press(getByTestId('calendar-day-3'));
    fireEvent.press(getByTestId('calendar-day-4'));
    fireEvent.changeText(getByPlaceholderText('Enter price in INR'), '15000');
    fireEvent.press(getByText('Apply price to selected dates'));

    expect(within(getByTestId('calendar-day-3')).getByText('INR 15000')).toBeTruthy();
    expect(within(getByTestId('calendar-day-4')).getByText('INR 15000')).toBeTruthy();
  });

  it('keeps overnight and night mutually exclusive', () => {
    const { getByText, getByTestId } = render(<App />);

    fireEvent.press(getByText('Calendar'));
    fireEvent.press(getByTestId('calendar-day-5'));

    fireEvent(getByTestId('availability-switch-nightCruise'), 'valueChange', true);

    const dayCell = getByTestId('calendar-day-5');
    expect(within(dayCell).queryByText(/⌂/)).toBeNull();
    expect(within(dayCell).getByText(/☾/)).toBeTruthy();
  });
});
