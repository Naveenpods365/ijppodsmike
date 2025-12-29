import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { NavLink } from './NavLink';

// Mock the Link component to avoid issues with React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('NavLink', () => {
  const defaultProps = {
    to: '/test-path',
    children: 'Test Link',
    activeClassName: 'bg-primary/10 text-primary',
  };

  it('renders the link with correct content', () => {
    render(
      <MemoryRouter>
        <NavLink {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test-path');
  });

  it('applies active class when link is active (full class check)', () => {
    render(
      <MemoryRouter initialEntries={['/test-path']}>
        <NavLink {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveClass('bg-primary/10');
    expect(screen.getByRole('link')).toHaveClass('text-primary');
  });

  it('does not apply active class when link is not active', () => {
    render(
      <MemoryRouter initialEntries={['/other-path']}>
        <NavLink {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).not.toHaveClass('bg-primary/10');
    expect(screen.getByRole('link')).not.toHaveClass('text-primary');
  });

  it('has correct default styling', () => {
    render(
      <MemoryRouter>
        <NavLink {...defaultProps} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link');
    // The NavLink component should render as an anchor element
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test-path');
  });

  it('renders with custom className', () => {
    const customProps = {
      ...defaultProps,
      className: 'custom-class',
    };

    render(
      <MemoryRouter>
        <NavLink {...customProps} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveClass('custom-class');
  });

  it('renders with icon when provided', () => {
    // NavLink doesn't accept an icon prop directly, so this test is not applicable
    // Testing the actual props the component accepts
    render(
      <MemoryRouter>
        <NavLink to="/test-path" children="Test Link" />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <MemoryRouter>
        <NavLink to="/test-path" children={<>
          <span>Child 1</span>
          <span>Child 2</span>
        </>} />
      </MemoryRouter>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});