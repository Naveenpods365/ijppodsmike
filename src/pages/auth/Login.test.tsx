import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import Login from './Login';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock the logo import
vi.mock('@/assets/logo.png', () => ({ default: '/mock-logo.png' }));

// Mock the Image constructor
const mockImage = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  set src(_: string) {
    // Simulate image loading
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  },
  get src() {
    return '';
  },
  onload: null as ((this: GlobalEventHandlers, ev: Event) => any) | null,
  onerror: null as ((this: GlobalEventHandlers, ev: Event) => any) | null,
};

global.Image = vi.fn().mockImplementation(() => mockImage);

describe('Login', () => {
  const mockLogin = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({
      login: mockLogin,
    });

    (useToast as vi.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with all fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Check if form elements are present
    expect(screen.getByLabelText(/Email/i, { selector: '#email' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i, { selector: '#password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Remember Me/i)).toBeInTheDocument();

    // Check if the show/hide password button is present
    expect(screen.getByLabelText(/Show password/i)).toBeInTheDocument();
  });

  it('should update email and password state when input values change', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i, { selector: '#email' });
    const passwordInput = screen.getByLabelText(/Password/i, { selector: '#password' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should toggle password visibility when eye icon is clicked', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/Password/i, { selector: '#password' });
    const toggleButton = screen.getByLabelText(/Show password/i);

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should call login function with correct credentials when form is submitted', async () => {
    mockLogin.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i, { selector: '#email' });
    const passwordInput = screen.getByLabelText(/Password/i, { selector: '#password' });
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error toast when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i, { selector: '#email' });
    const passwordInput = screen.getByLabelText(/Password/i, { selector: '#password' });
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('should show generic error message when login fails without specific error', async () => {
    // Mock an error that doesn't have response.data.message or message
    mockLogin.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i, { selector: '#email' });
    const passwordInput = screen.getByLabelText(/Password/i, { selector: '#password' });
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    });
  });
});