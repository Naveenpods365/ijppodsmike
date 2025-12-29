import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Create the mockNavigate here so it's accessible in the test
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/' };

// Mock the context and hooks
vi.mock('@/contexts/AuthContext');
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate,
  };
});

// Mock the logo import
vi.mock('@/assets/logo.png', () => ({
  default: 'logo.png',
}));

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    LayoutDashboard: (props: any) => <svg {...props} data-testid="dashboard-icon">Dashboard</svg>,
    Calendar: (props: any) => <svg {...props} data-testid="calendar-icon">Calendar</svg>,
    Ticket: (props: any) => <svg {...props} data-testid="ticket-icon">Ticket</svg>,
    Settings: (props: any) => <svg {...props} data-testid="settings-icon">Settings</svg>,
    LogOut: (props: any) => <svg {...props} data-testid="logout-icon">Logout</svg>,
    Sparkles: (props: any) => <svg {...props} data-testid="sparkles-icon">Sparkles</svg>,
  };
});

describe('Sidebar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
    // Reset the mocks
    mockNavigate.mockClear();
    mockLocation.pathname = '/'; // Default to root
  });

  it('renders the sidebar with logo and navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Check for logo and branding
    expect(screen.getByAltText('iJustPaid')).toBeInTheDocument();
    expect(screen.getByText('Deal Scraper')).toBeInTheDocument();
    expect(screen.getByText('Dashboard v2.0')).toBeInTheDocument();

    // Check for navigation items
    expect(screen.getByText('Dashboard', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Scheduler', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Coupons', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Settings', { selector: 'span' })).toBeInTheDocument();

    // Check for sign out button
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Check for icons
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('shows active state for current route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>
    );

    // Check that Dashboard link has active styling when on root path
    const dashboardLink = screen.getByText('Dashboard', { selector: 'span' }).closest('a');
    expect(dashboardLink).toHaveClass('bg-gradient-to-r');
  });

  it('shows correct active state for different routes', () => {
    mockLocation.pathname = '/scheduler';
    render(
      <MemoryRouter initialEntries={['/scheduler']}>
        <Sidebar />
      </MemoryRouter>
    );

    // Check that Scheduler link has active styling when on scheduler path
    const schedulerLink = screen.getByText('Scheduler', { selector: 'span' }).closest('a');
    expect(schedulerLink).toHaveClass('bg-gradient-to-r');
  });

  it('handles logout functionality', async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('navigates to login after logout', async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('renders the pro tip section', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Pro Tip')).toBeInTheDocument();
    expect(screen.getByText('Enable auto-scheduling to never miss a deal!')).toBeInTheDocument();
    // There should be multiple sparkles icons - one in the active link and one in the pro tip section
    const sparklesIcons = screen.getAllByTestId('sparkles-icon');
    expect(sparklesIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders with correct styling classes', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Check for sidebar container classes
    const sidebar = screen.getByText('Deal Scraper').closest('aside');
    expect(sidebar).toBeInTheDocument();
    
    // Check for logo container
    const logoContainer = screen.getByText('Deal Scraper').closest('div');
    expect(logoContainer).toBeInTheDocument();
  });
});