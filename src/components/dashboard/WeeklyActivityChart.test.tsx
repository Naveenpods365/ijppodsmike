import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import api from '@/lib/axiosInstance';

// Mock the API
vi.mock('@/lib/axiosInstance');

// Mock recharts components
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    Cell: () => <div data-testid="cell" />,
  };
});

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    TrendingUp: (props: any) => <svg {...props} data-testid="trending-up-icon">TrendingUp</svg>,
    Loader2: (props: any) => <svg {...props} data-testid="loader-icon">Loader2</svg>,
  };
});

describe('WeeklyActivityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (api.get as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolve to keep loading state

    render(<WeeklyActivityChart />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Weekly Activity')).toBeInTheDocument();
    expect(screen.getByText('Deal distribution this week')).toBeInTheDocument();
  });

  it('renders with data when API call succeeds', async () => {
    const mockData = [
      { day: 'Mon', deals: 10 },
      { day: 'Tue', deals: 15 },
      { day: 'Wed', deals: 8 },
      { day: 'Thu', deals: 12 },
      { day: 'Fri', deals: 20 },
      { day: 'Sat', deals: 5 },
      { day: 'Sun', deals: 18 },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<WeeklyActivityChart />);

    // Initially should show loading
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    // Check that chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders no data message when API returns empty array', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    render(<WeeklyActivityChart />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<WeeklyActivityChart />);

    // Wait for the API call to fail
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    // The component should still render but with no data
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching weekly activity:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('displays total deals correctly', async () => {
    const mockData = [
      { day: 'Mon', deals: 10 },
      { day: 'Tue', deals: 15 },
      { day: 'Wed', deals: 8 },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<WeeklyActivityChart />);

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    // Total deals is 10 + 15 + 8 = 33
    // The component shows +0.3% (33/100)
    expect(screen.getByText('+0.3%')).toBeInTheDocument();
  });

  it('displays zero percentage when total deals is 0', async () => {
    const mockData = [
      { day: 'Mon', deals: 0 },
      { day: 'Tue', deals: 0 },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<WeeklyActivityChart />);

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders chart components with correct data', async () => {
    const mockData = [
      { day: 'Mon', deals: 10 },
      { day: 'Tue', deals: 15 },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<WeeklyActivityChart />);

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    // Check that cells are rendered for each data point
    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(2); // Should have 2 cells for 2 data points
  });

  it('renders legend elements', async () => {
    const mockData = [
      { day: 'Mon', deals: 10 },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<WeeklyActivityChart />);

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/weekly-activity');
    });

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    // Check for legend items
    expect(screen.getByText('Daily Deals')).toBeInTheDocument();
    expect(screen.getByText('Peak Day')).toBeInTheDocument();
  });
});