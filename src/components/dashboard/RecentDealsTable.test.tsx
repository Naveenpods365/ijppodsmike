import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { RecentDealsTable } from './RecentDealsTable';
import api from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';

// Mock the API and toast
vi.mock('@/lib/axiosInstance');
vi.mock('@/hooks/use-toast');
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    ExternalLink: (props: any) => <svg {...props} data-testid="external-link-icon">ExternalLink</svg>,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('RecentDealsTable', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it('renders loading skeleton when deals are loading', async () => {
    (api.get as any).mockImplementation(() => new Promise(() => {})); // Never resolve to show loading
    
    render(<RecentDealsTable />);
    
    // Should show loading skeletons
    expect(screen.getByText('Scraped Deals')).toBeInTheDocument();
    expect(screen.getByText('Latest scraped deals from your sources')).toBeInTheDocument();
  });

  it('renders with empty deals when API returns no data', async () => {
    (api.get as any).mockResolvedValue({ data: [] });

    render(<RecentDealsTable />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/recent-deals');
    });

    expect(screen.getByText('No recent deals.')).toBeInTheDocument();
  });

  it('renders deals when API returns data', async () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Test Deal 1',
        shopping_platform: 'Amazon',
        price: 100,
        discounted: 80,
        org_link: 'https://example.com/deal1',
        image_url: 'https://example.com/image1.jpg',
        badge: '20% OFF',
        status: 'Sent',
        created_at: '2023-01-01T00:00:00Z',
      }
    ];
    
    (api.get as any).mockResolvedValue({ data: mockDeals });

    render(<RecentDealsTable />);

    await waitFor(() => {
      expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$80.00')).toBeInTheDocument();
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
    // Check for the status in the table row
    expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    // Find the status element in the table by looking for the specific status badge
    const statusElements = screen.getAllByText('Sent');
    // Should have at least one status element from the table row
    expect(statusElements.length).toBeGreaterThanOrEqual(1);
  });

  it('handles API error gracefully', async () => {
    const mockError = {
      response: {
        status: 500,
        data: {
          message: 'Internal Server Error'
        }
      }
    };
    (api.get as any).mockRejectedValue(mockError);

    render(<RecentDealsTable />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to load recent deals',
        description: 'Internal Server Error',
        variant: 'destructive',
      });
    });
  });

  it('handles authentication error when no token found', async () => {
    // Reset the mocks for this specific test
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
    (useToast as any).mockReturnValue({ toast: mockToast });
    (api.get as any).mockResolvedValue({ data: [] });

    render(<RecentDealsTable />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Not authenticated',
        description: 'Please log in again to load recent deals.',
        variant: 'destructive',
      });
    });
  });

  it('formats money correctly', async () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Test Deal',
        price: 99.99,
        discounted: 79.99,
        status: 'Sent',
      },
    ];
    
    (api.get as any).mockResolvedValue({ data: mockDeals });

    render(<RecentDealsTable />);

    await waitFor(() => {
      expect(screen.getByText('Test Deal')).toBeInTheDocument();
    });

    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });
});