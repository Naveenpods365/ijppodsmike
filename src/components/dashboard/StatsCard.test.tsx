import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { StatsCard } from './StatsCard';

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    TrendingUp: (props: any) => <svg {...props} data-testid="trending-up-icon">TrendingUp</svg>,
    TrendingDown: (props: any) => <svg {...props} data-testid="trending-down-icon">TrendingDown</svg>,
    BarChart3: (props: any) => <svg {...props} data-testid="bar-chart-icon">BarChart3</svg>,
  };
});

describe('StatsCard', () => {
  const MockIcon = (props: any) => <svg {...props} data-testid="mock-icon">Icon</svg>;
  const defaultProps = {
    title: 'Total Revenue',
    value: '$1,234',
    icon: MockIcon,
  };

  it('renders the title correctly', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders the value correctly', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('renders the icon correctly', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders with positive change type', () => {
    render(<StatsCard {...defaultProps} change="+12.5%" changeType="positive" />);
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    const changeElement = screen.getByText('+12.5%');
    expect(changeElement).toHaveClass('text-success');
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders with negative change type', () => {
    render(<StatsCard {...defaultProps} change="-5.2%" changeType="negative" />);
    
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
    const changeElement = screen.getByText('-5.2%');
    expect(changeElement).toHaveClass('text-destructive');
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('renders with neutral change type', () => {
    render(<StatsCard {...defaultProps} change="0%" changeType="neutral" />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
    const changeElement = screen.getByText('0%');
    expect(changeElement).toHaveClass('text-muted-foreground');
  });

  it('renders without change when not provided', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.queryByText('+')).not.toBeInTheDocument();
    expect(screen.queryByText('-')).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('handles null value', () => {
    render(<StatsCard {...defaultProps} value={null} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles undefined value', () => {
    render(<StatsCard {...defaultProps} value={undefined} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles boolean value', () => {
    render(<StatsCard {...defaultProps} value={true} />);
    
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('handles boolean value as false', () => {
    render(<StatsCard {...defaultProps} value={false} />);
    
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('handles array value', () => {
    render(<StatsCard {...defaultProps} value={['Item 1', 'Item 2', 'Item 3']} />);
    
    expect(screen.getByText('Item 1, Item 2, Item 3')).toBeInTheDocument();
  });

  it('handles array with null values', () => {
    render(<StatsCard {...defaultProps} value={['Item 1', null, 'Item 3', undefined]} />);
    
    expect(screen.getByText('Item 1, Item 3')).toBeInTheDocument();
  });

  it('handles object value with name property', () => {
    const objValue = { name: 'Test Object' };
    render(<StatsCard {...defaultProps} value={objValue} />);
    
    expect(screen.getByText('Test Object')).toBeInTheDocument();
  });

  it('handles object value with derived_category property', () => {
    const objValue = { derived_category: 'Test Category' };
    render(<StatsCard {...defaultProps} value={objValue} />);
    
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('handles object value with matched_keywords array', () => {
    const objValue = { matched_keywords: ['keyword1', 'keyword2'] };
    render(<StatsCard {...defaultProps} value={objValue} />);
    
    expect(screen.getByText('keyword1, keyword2')).toBeInTheDocument();
  });

  it('handles delay prop', () => {
    render(<StatsCard {...defaultProps} delay={500} />);
    
    // Find the outermost div with the animation delay
    const elements = screen.getAllByText('Total Revenue');
    const titleElement = elements[0];
    // Navigate up the DOM tree to find the parent with the delay style
    const card = titleElement.parentElement?.parentElement?.parentElement;
    expect(card).toHaveStyle('animation-delay: 500ms');
  });

  it('applies custom icon color', () => {
    render(<StatsCard {...defaultProps} iconColor="bg-red-100 text-red-500" />);
    
    const iconContainer = screen.getByTestId('mock-icon').closest('div');
    expect(iconContainer).toHaveClass('bg-red-100');
    expect(iconContainer).toHaveClass('text-red-500');
  });

  it('renders with default changeType as neutral', () => {
    render(<StatsCard {...defaultProps} change="0%" />);
    
    const changeElement = screen.getByText('0%');
    expect(changeElement).toHaveClass('text-muted-foreground');
  });

  it('handles different value types correctly', () => {
    // Test with number
    render(<StatsCard {...defaultProps} value={1234} />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });
});