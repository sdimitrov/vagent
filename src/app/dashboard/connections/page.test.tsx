import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectionsPage from './page';

// Mock next/navigation
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'), // Preserve other exports
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(), // Mock replace for potential future use (e.g., clearing query params)
  }),
}));

// Mock window.location.href for testing navigation within handleConnect
const mockLocationAssign = jest.fn();
Object.defineProperty(window, 'location', {
  writable: true,
  value: { assign: mockLocationAssign, href: '' }, // href is used by handleConnect
});

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('ConnectionsPage', () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams()); // Default: no params
    mockLocationAssign.mockClear();
    (global.confirm as jest.Mock).mockClear();
    // window.location.href needs to be assignable for the handleConnect function
    // We can reset it or ensure the mock handles assignments if needed, but direct assignment is tested via mockLocationAssign
    Object.defineProperty(window, 'location', { value: { assign: mockLocationAssign, href: '' }, writable: true });
  });

  it('renders the main heading', () => {
    render(<ConnectionsPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Manage Social Connections/i })).toBeInTheDocument();
  });

  it('renders "Connect New Account" section and platform buttons', () => {
    render(<ConnectionsPage />);
    expect(screen.getByRole('heading', { level: 2, name: /Connect New Account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connect YouTube/i })).toBeInTheDocument();
  });

  it('renders "Connected Accounts" section and initially shows no accounts message', async () => {
    render(<ConnectionsPage />);
    expect(screen.getByRole('heading', { level: 2, name: /Connected Accounts/i })).toBeInTheDocument();
    await screen.findByText(/No accounts connected yet/i);
    expect(screen.getByText(/No accounts connected yet/i)).toBeInTheDocument();
  });

  it('clicking a connect button attempts to navigate to the authorize URL', () => {
    render(<ConnectionsPage />);
    const connectYouTubeButton = screen.getByRole('button', { name: /Connect YouTube/i });
    fireEvent.click(connectYouTubeButton);
    // Check the assignment to window.location.href
    // We re-check window.location.href because it's directly assigned to.
    expect(window.location.href).toBe('/api/oauth/youtube/authorize');
  });

  it('displays an error message if error query param is present', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('error=test_error&platform=youtube'));
    render(<ConnectionsPage />);
    const alertDiv = await screen.findByRole('alert');
    expect(alertDiv).toBeInTheDocument();
    expect(alertDiv).toHaveTextContent(/Connection failed for youtube: test_error. Please try again./i);
  });

  it('displays a success message (console.log) if success query param is present', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockUseSearchParams.mockReturnValue(new URLSearchParams('success=true&platform=youtube'));
    render(<ConnectionsPage />);
    expect(consoleLogSpy).toHaveBeenCalledWith('Successfully connected youtube');
    consoleLogSpy.mockRestore();
  });
}); 