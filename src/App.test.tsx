import { render } from '@testing-library/react-native';
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
});
