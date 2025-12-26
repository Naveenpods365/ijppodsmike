import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound', () => {
  const renderWithRouter = (initialEntries = ['/non-existent']) => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <NotFound />
      </MemoryRouter>
    );
  };

  it('should render the 404 error page with correct content', () => {
    renderWithRouter();

    // Check if the 404 heading is present
    expect(screen.getByText('404')).toBeInTheDocument();
    
    // Check if the error message is present
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    
    // Check if the home link is present
    const homeLink = screen.getByRole('link', { name: /Return to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should log an error message when component mounts', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithRouter(['/test-path']);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:', 
      '/test-path'
    );
    
    consoleErrorSpy.mockRestore();
  });
});