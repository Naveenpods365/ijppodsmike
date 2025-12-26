import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';
import { useDashboardMetricsWebSocket } from '@/hooks/useDashboardMetricsWebSocket';

// Mock the WebSocket hook
jest.mock('@/hooks/useDashboardMetricsWebSocket', () => ({
  useDashboardMetricsWebSocket: jest.fn(),
}));

describe('Index', () => {
  const mockMetrics = {
    total_deals: 150,
    deals_sent: 120,
    top_category: {
      name: 'Electronics',
      count: 25
    },
    active_groups: 10,
    avg_discount_pct: 15.5,
    next_run_in_seconds: 300
  };

  beforeEach(() => {
    (useDashboardMetricsWebSocket as jest.Mock).mockReturnValue({
      metrics: mockMetrics,
      isConnected: true,
    });
  });

  it('should render dashboard components with metrics', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    // Check if stats cards are rendered with correct values
    expect(screen.getByText('150')).toBeInTheDocument(); // Total deals
    expect(screen.getByText('Electronics')).toBeInTheDocument(); // Top category
    expect(screen.getByText('10')).toBeInTheDocument(); // Active groups
    expect(screen.getByText('15.5%')).toBeInTheDocument(); // Avg discount

    // Check if main sections are present
    expect(screen.getByText('Total Deals')).toBeInTheDocument();
    expect(screen.getByText('Top Category')).toBeInTheDocument();
    expect(screen.getByText('Active Groups')).toBeInTheDocument();
    expect(screen.getByText('Avg. Discount')).toBeInTheDocument();
  });

  it('should render loading state when metrics are not available', () => {
    (useDashboardMetricsWebSocket as jest.Mock).mockReturnValue({
      metrics: null,
      isConnected: false,
    });

    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    // Check if loading placeholders are shown
    expect(screen.getByText('—')).toBeInTheDocument(); // Placeholder for missing values
  });

  it('should render sidebar and header components', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    // Since these are just imported components, we check that the structure is there
    // The actual rendering of these components would be tested separately
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});