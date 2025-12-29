import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MetricCard } from './MetricCard';

// Mock the Lucide icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    TrendingUp: (props: any) => <svg {...props} data-testid="trending-up-icon">TrendingUp</svg>,
    TrendingDown: (props: any) => <svg {...props} data-testid="trending-down-icon">TrendingDown</svg>,
    Sparkles: (props: any) => <svg {...props} data-testid="sparkles-icon">Sparkles</svg>,
  };
});

describe('MetricCard', () => {
  const defaultProps = {
    label: 'Total Deals',
    value: '1,234',
    change: '+12.5%',
    isPositive: true,
  };

  it('renders the label correctly', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Total Deals')).toBeInTheDocument();
  });

  it('renders the value correctly', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders the change indicator correctly', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('renders the icon based on isPositive prop', () => {
    render(<MetricCard {...defaultProps} />);
    
    // When isPositive is true, it should show TrendingUp icon
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('applies positive change styling when isPositive is true', () => {
    render(<MetricCard {...defaultProps} />);
    
    const changeElement = screen.getByText('+12.5%');
    expect(changeElement).toHaveClass('text-success');
  });

  it('applies negative change styling when isPositive is false', () => {
    render(<MetricCard {...defaultProps} isPositive={false} change="-5.2%" />);
    
    const changeElement = screen.getByText('-5.2%');
    expect(changeElement).toHaveClass('text-destructive');
  });

  it('applies styling based on isPositive prop', () => {
    render(<MetricCard {...defaultProps} isPositive={false} />);
    
    const changeElement = screen.getByText('+12.5%');
    expect(changeElement).toHaveClass('text-destructive');
  });

  it('applies styling based on isPositive prop', () => {
    render(<MetricCard {...defaultProps} isPositive={false} />);
    
    // Should apply destructive styling when isPositive is false
    const changeElement = screen.getByText('+12.5%');
    expect(changeElement).toHaveClass('text-destructive');
  });

  it('renders with delay prop', () => {
    render(<MetricCard {...defaultProps} delay={500} />);
    
    expect(screen.getByText('Total Deals')).toBeInTheDocument();
  });

  it('handles large numbers with proper formatting', () => {
    render(<MetricCard {...defaultProps} value="1,234,567" />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with different values for isPositive prop', () => {
    const positiveProps = {
      label: 'Sales',
      value: '1,234',
      change: '+15%',
      isPositive: true,
    };
    
    render(<MetricCard {...positiveProps} />);
    
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('renders correctly with isPositive false', () => {
    render(<MetricCard {...defaultProps} isPositive={false} />);
    
    expect(screen.getByText('Total Deals')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
});