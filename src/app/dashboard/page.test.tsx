import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from './page'; // Assuming page.tsx is in src/app/dashboard/

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />);
    const headingElement = screen.getByRole('heading', { level: 1, name: /Dashboard/i });
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome to your protected dashboard!/i)).toBeInTheDocument();
  });
}); 