import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { TopCategoriesSection } from './TopCategoriesSection';
import api from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';

// Mock the API and toast
vi.mock('@/lib/axiosInstance');
vi.mock('@/hooks/use-toast');

// Mock the DealCard component
vi.mock('./DealCard', () => ({
  DealCard: ({ title, onPreview }: { title: string; onPreview: (category: string) => void }) => (
    <div data-testid="deal-card" onClick={() => onPreview('Electronics')}>
      <span>{title}</span>
    </div>
  ),
}));

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: any }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dialog', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
      <div data-testid={`dialog-${open ? 'open' : 'closed'}`}>
        {children}
      </div>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-title">{children}</div>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-description">{children}</div>
    ),
  };
});

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Sparkles: (props: any) => <svg {...props} data-testid="sparkles-icon">Sparkles</svg>,
    ArrowRight: (props: any) => <svg {...props} data-testid="arrow-right-icon">ArrowRight</svg>,
    ExternalLink: (props: any) => <svg {...props} data-testid="external-link-icon">ExternalLink</svg>,
  };
});

describe('TopCategoriesSection', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
  });

  it('renders the top categories section with title and description', () => {
    render(<TopCategoriesSection />);

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Best performing deals this week')).toBeInTheDocument();
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('renders the view all button', () => {
    render(<TopCategoriesSection />);

    expect(screen.getByText('View All')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
  });

  it('renders the deal cards', () => {
    render(<TopCategoriesSection />);

    // Check for the hardcoded top deals
    expect(screen.getByText('Sony WH-1000XM5 Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Organic Coffee Beans Premium Blend')).toBeInTheDocument();
    expect(screen.getByText('Luxury Skincare Set with Vitamin C')).toBeInTheDocument();
    expect(screen.getByText('LEGO Star Wars Millennium Falcon')).toBeInTheDocument();

    // Check for the deal cards
    const dealCards = screen.getAllByTestId('deal-card');
    expect(dealCards).toHaveLength(4); // There are 4 top deals
  });

  it('opens preview dialog when a deal card is clicked', async () => {
    render(<TopCategoriesSection />);

    // Initially dialog should be closed
    expect(screen.queryByTestId('dialog-open')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dialog-closed')).toBeInTheDocument();

    // Click on a deal card
    const dealCards = screen.getAllByTestId('deal-card');
    fireEvent.click(dealCards[0]);

    // Dialog should now be open
    await waitFor(() => {
      expect(screen.getByTestId('dialog-open')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Preview Deals')).toBeInTheDocument();
  });

  it('loads preview deals when dialog is opened', async () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Test Deal 1',
        category: 'Electronics',
        shopping_platform: 'Amazon',
        price: 100,
        discounted: 80,
        created_at: '2023-01-01T00:00:00Z',
        image_url: 'https://example.com/image1.jpg',
        badge: '20% OFF',
        status: 'Sent',
        org_link: 'https://example.com/deal1',
      },
      {
        id: '2',
        title: 'Test Deal 2',
        category: 'Electronics',
        shopping_platform: 'eBay',
        price: 200,
        discounted: 150,
        created_at: '2023-01-02T00:00:00Z',
        image_url: null,
        badge: '25% OFF',
        status: 'Pending',
        org_link: 'https://example.com/deal2',
      },
    ];

    // Set up the mock before rendering
    (api.get as jest.Mock).mockResolvedValue({ data: mockDeals });

    render(<TopCategoriesSection />);

    // Click on a deal card to open the dialog
    const dealCards = screen.getAllByTestId('deal-card');
    fireEvent.click(dealCards[0]);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/recent-deals');
    });

    // Check that the deals are loaded in the preview
    await waitFor(() => {
      expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    expect(screen.getByText('Test Deal 2')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('eBay')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$80.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('handles API error when loading preview deals', async () => {
    const mockError = {
      response: {
        data: {
          message: 'API Error'
        }
      },
      message: 'Network Error'
    };
    // Set up the mock before rendering
    (api.get as jest.Mock).mockRejectedValue(mockError);

    render(<TopCategoriesSection />);

    // Click on a deal card to open the dialog
    const dealCards = screen.getAllByTestId('deal-card');
    fireEvent.click(dealCards[0]);

    // Wait for the API call to fail
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to load deals',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });

  it('disables view button when link is null', async () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Test Deal 1',
        category: 'Electronics',
        org_link: null,
        status: 'Sent',
      },
    ];

    // Set up the mock before rendering
    (api.get as jest.Mock).mockResolvedValue({ data: mockDeals });

    render(<TopCategoriesSection />);

    // Click on a deal card to open the dialog
    const dealCards = screen.getAllByTestId('deal-card');
    fireEvent.click(dealCards[0]);

    // Wait for the API call to complete and deals to load
    await waitFor(() => {
      expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    });

    // Find the "View" button in the table - it should be disabled
    const table = screen.getByRole('table');
    const viewButton = within(table).getByRole('button', { name: /View/i });
    expect(viewButton).toBeDisabled();
  });

  it('formats money correctly', async () => {
    const mockDeals = [
      {
        id: '1',
        title: 'Test Deal 1',
        price: 99.99,
        discounted: 79.99,
        status: 'Sent',
      },
    ];

    // Set up the mock before rendering
    (api.get as jest.Mock).mockResolvedValue({ data: mockDeals });

    render(<TopCategoriesSection />);

    // Click on a deal card to open the dialog
    const dealCards = screen.getAllByTestId('deal-card');
    fireEvent.click(dealCards[0]);

    // Wait for the API call to complete and deals to load
    await waitFor(() => {
      expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    });

    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });
});