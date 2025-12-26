import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { AffiliateLinksSection } from './AffiliateLinksSection';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axiosInstance';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock the axios instance
vi.mock('@/lib/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock the dialog components to avoid issues with portal rendering
vi.mock('@/components/ui/dialog', async () => {
  const actual = await vi.importActual('@/components/ui/dialog');
  return {
    ...actual,
    Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
  };
});

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Pencil: (props: any) => <svg {...props} data-testid="pencil-icon">Pencil</svg>,
    Send: (props: any) => <svg {...props} data-testid="send-icon">Send</svg>,
    MessageCircle: (props: any) => <svg {...props} data-testid="message-circle-icon">MessageCircle</svg>,
    ExternalLink: (props: any) => <svg {...props} data-testid="external-link-icon">ExternalLink</svg>,
    Plus: (props: any) => <svg {...props} data-testid="plus-icon">Plus</svg>,
    Sparkles: (props: any) => <svg {...props} data-testid="sparkles-icon">Sparkles</svg>,
    Link2: (props: any) => <svg {...props} data-testid="link2-icon">Link2</svg>,
  };
});

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, id, ...props }: any) => (
    <input value={value} onChange={onChange} id={id} {...props} data-testid={id || 'input'} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

describe('AffiliateLinksSection', () => {
  const mockToast = vi.fn();
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPatch = vi.fn();

  beforeEach(() => {
    (useToast as vi.Mock).mockReturnValue({
      toast: mockToast,
    });

    (api.get as vi.Mock).mockImplementation(mockGet);
    (api.post as vi.Mock).mockImplementation(mockPost);
    (api.patch as vi.Mock).mockImplementation(mockPatch);

    // Mock successful API calls by default
    mockGet.mockResolvedValue({
      data: [
        {
          id: '1',
          url: 'https://example.com/product',
          title: 'Test Product',
          retailer: 'Amazon',
          category: 'Electronics',
          discount_label: '20% OFF',
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with initial loading state', async () => {
    mockGet.mockReturnValue(new Promise(() => {})); // Never resolve to simulate loading

    render(<AffiliateLinksSection />);

    // Initially should show loading skeletons
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should render affiliate links when data is loaded', async () => {
    render(<AffiliateLinksSection />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
  });

  it('should show empty state when no affiliate links exist', async () => {
    mockGet.mockResolvedValue({ data: [] });

    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('No affiliate links yet')).toBeInTheDocument();
    });

    expect(screen.getByText('No affiliate links yet')).toBeInTheDocument();
    expect(screen.getByText('Add a new affiliate link to get started!')).toBeInTheDocument();
  });

  it('should open the dialog when "Add New Affiliate Link" button is clicked', async () => {
    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click add button - look for the button with Plus icon
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Affiliate Link')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button is clicked', async () => {
    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Find the edit button which has a Pencil icon
    const editButton = screen.getByTestId('pencil-icon').closest('button');
    
    fireEvent.click(editButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Edit Affiliate Link')).toBeInTheDocument();
  });

  it('should submit a new affiliate link when form is filled and submitted', async () => {
    const mockNewLink = {
      id: '2',
      url: 'https://example.com/new-product',
      title: 'New Product',
      retailer: 'New Retailer',
      category: 'New Category',
      discount_label: '25% OFF',
    };

    mockPost.mockResolvedValue({ data: mockNewLink });

    render(<AffiliateLinksSection />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click add button - look for the button with Plus icon
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Fill the form
    const urlInput = screen.getByTestId('affiliate_url');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/new-product' } });

    const productTitleInput = screen.getByTestId('product_title');
    fireEvent.change(productTitleInput, { target: { value: 'New Product' } });

    const retailerInput = screen.getByTestId('retailer');
    fireEvent.change(retailerInput, { target: { value: 'New Retailer' } });

    const categoryInput = screen.getByTestId('category');
    fireEvent.change(categoryInput, { target: { value: 'New Category' } });

    const discountInput = screen.getByTestId('discount');
    fireEvent.change(discountInput, { target: { value: '25% OFF' } });

    // Submit the form
    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/affiliate', {
        url: 'https://example.com/new-product',
        title: 'New Product',
        retailer: 'New Retailer',
        category: 'New Category',
        discount_label: '25% OFF',
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Affiliate link added',
      description: 'Your affiliate link has been saved.',
    });
  });

  it('should show error when URL is empty on form submission', async () => {
    render(<AffiliateLinksSection />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click add button - look for the button with Plus icon
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Leave URL empty and submit
    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Affiliate Link URL is required',
        variant: 'destructive',
      });
    });
  });

  it('should handle API error when loading affiliate links', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to load affiliate links',
        description: 'Network error',
        variant: 'destructive',
      });
    });
  });

  it('should handle API error when creating affiliate link', async () => {
    mockPost.mockRejectedValue({
      response: {
        data: {
          message: 'API Error',
        },
      },
    });

    render(<AffiliateLinksSection />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click add button - look for the button with Plus icon
    const addButton = screen.getByTestId('plus-icon').closest('button');
    fireEvent.click(addButton!);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Fill the form
    const urlInput = screen.getByTestId('affiliate_url');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/new-product' } });

    // Submit the form
    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Failed to add affiliate link',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });

  it('should handle send to Telegram functionality', async () => {
    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Mock window.open
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);

    // Find the Telegram send button which has a Send icon
    const telegramButton = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.click(telegramButton!);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
    });

    openSpy.mockRestore();
  });

  it('should handle send to WhatsApp functionality', async () => {
    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Mock window.open
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);

    // Find the WhatsApp send button which has a MessageCircle icon
    const whatsappButton = screen.getByTestId('message-circle-icon').closest('button');
    
    fireEvent.click(whatsappButton!);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
    });

    openSpy.mockRestore();
  });

  it('should handle open URL functionality', async () => {
    render(<AffiliateLinksSection />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Mock window.open
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);

    // Find the external link button which has an ExternalLink icon
    const externalLinkButton = screen.getByTestId('external-link-icon').closest('button');
    
    fireEvent.click(externalLinkButton!);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalled();
    });

    openSpy.mockRestore();
  });
});