import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but needed for older browsers
    removeListener: vi.fn(), // Deprecated but needed for older browsers
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024, // Desktop size
});

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset mocks
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size
    });
    (window.matchMedia as vi.MockedFunction<any>).mockClear();
  });

  it('should return false for desktop screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Wait for the effect to run
    act(() => {
      // Trigger the effect manually by simulating the window resize
      const event = new Event('resize');
      window.dispatchEvent(event);
    });
    
    expect(result.current).toBe(false);
  });

  it('should return true for mobile screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile size
    });

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should update when window size changes', () => {
    const addEventListenerMock = vi.fn();
    const removeEventListenerMock = vi.fn();
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });

    const { result, unmount } = renderHook(() => useIsMobile());
    
    // Initially desktop size
    expect(result.current).toBe(false);
    
    // Simulate window resize to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    // Simulate the media query change event
    const mql = window.matchMedia('(max-width: 767px)');
    if (mql.onchange) {
      mql.onchange(new Event('change'));
    }
    
    expect(result.current).toBe(true);
    
    // Clean up
    unmount();
    
    // Verify cleanup was called
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});