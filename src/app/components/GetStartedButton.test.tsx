import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GetStartedButton from './GetStartedButton';

describe('GetStartedButton', () => {
  let querySelectorSpy: jest.SpyInstance;
  let querySelectorAllSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Set up spies before each test
    querySelectorSpy = jest.spyOn(document, 'querySelector');
    querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll');
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console output during tests
  });

  afterEach(() => {
    // Restore original implementations after each test
    querySelectorSpy.mockRestore();
    querySelectorAllSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('renders the button with correct text', () => {
    render(<GetStartedButton />);
    const buttonElement = screen.getByRole('button', { name: /Get Started Free/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('clicks the specific Clerk sign-up button if found', () => {
    const mockClerkSignUpButton = document.createElement('button');
    mockClerkSignUpButton.click = jest.fn();
    
    querySelectorSpy.mockImplementation((selector) => {
      if (selector === 'header > div > div > button:nth-child(2)') {
        return mockClerkSignUpButton;
      }
      return null;
    });

    render(<GetStartedButton />);
    const buttonElement = screen.getByRole('button', { name: /Get Started Free/i });
    fireEvent.click(buttonElement);

    expect(querySelectorSpy).toHaveBeenCalledWith('header > div > div > button:nth-child(2)');
    expect(mockClerkSignUpButton.click).toHaveBeenCalledTimes(1);
    expect(querySelectorAllSpy).not.toHaveBeenCalled(); // Fallback should not be reached
  });

  it('clicks the fallback generic sign-up button if specific one is not found', () => {
    const mockGenericSignUpButton = document.createElement('button');
    mockGenericSignUpButton.textContent = 'Sign Up Now';
    mockGenericSignUpButton.click = jest.fn();
    
    querySelectorSpy.mockReturnValue(null); // Specific Clerk button not found
    querySelectorAllSpy.mockReturnValue([mockGenericSignUpButton]); // Corrected: querySelectorAll returns an array of HTMLElements because of Array.from() in component

    render(<GetStartedButton />);
    const buttonElement = screen.getByRole('button', { name: /Get Started Free/i });
    fireEvent.click(buttonElement);

    expect(querySelectorSpy).toHaveBeenCalledWith('header > div > div > button:nth-child(2)');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('header button');
    expect(mockGenericSignUpButton.click).toHaveBeenCalledTimes(1);
  });

  it('logs a warning if no sign-up button is found (neither specific nor fallback)', () => {
    querySelectorSpy.mockReturnValue(null); // Specific Clerk button not found
    querySelectorAllSpy.mockReturnValue([]); // Corrected: querySelectorAll returns an empty array because of Array.from() in component

    render(<GetStartedButton />);
    const buttonElement = screen.getByRole('button', { name: /Get Started Free/i });
    fireEvent.click(buttonElement);

    expect(querySelectorSpy).toHaveBeenCalledWith('header > div > div > button:nth-child(2)');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('header button');
    expect(consoleWarnSpy).toHaveBeenCalledWith('SociAI Reels: Sign Up button not found in header for Get Started click.');
  });
});
