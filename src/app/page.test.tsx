import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './page'; // Assuming page.tsx is in the same directory

describe('HomePage (Landing Page)', () => {
  it('renders the main heading with the app name', () => {
    render(<HomePage />);
    // The heading has gradient text, so we look for the text content within an h1
    const headingElement = screen.getByRole('heading', { level: 1, name: /SociAI Reels/i });
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the Get Started Free button', () => {
    // We are testing the page, which includes the GetStartedButton component
    render(<HomePage />);
    const getStartedButton = screen.getByRole('button', { name: /Get Started Free/i });
    expect(getStartedButton).toBeInTheDocument();
  });
}); 