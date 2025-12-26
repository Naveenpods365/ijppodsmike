import { renderHook, act } from '@testing-library/react';
import { useDashboardMetricsWebSocket, DashboardTilesPayload } from './useDashboardMetricsWebSocket';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock WebSocket
const mockWebSocket = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

const mockWebSocketConstructor = vi.fn();

// Mock WebSocket constructor
Object.defineProperty(window, 'WebSocket', {
  value: mockWebSocketConstructor,
  writable: true,
});

// Create a mock WebSocket instance that we can use in tests
const createMockWebSocket = (url: string) => {
  const instance = {
    url,
    readyState: mockWebSocket.CONNECTING,
    onopen: null,
    onclose: null,
    onerror: null,
    onmessage: null,
    close: vi.fn(),
    send: vi.fn(),
    open: () => {
      instance.readyState = mockWebSocket.OPEN;
      if (instance.onopen) {
        instance.onopen(new Event('open'));
      }
    },
    triggerMessage: (data: any) => {
      if (instance.onmessage) {
        instance.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
      }
    },
    triggerError: () => {
      if (instance.onerror) {
        instance.onerror(new Event('error'));
      }
    },
  };
  
  // Mock the constructor to return this instance
  mockWebSocketConstructor.mockReturnValue(instance);
  
  return instance;
};

// Mock setTimeout
const originalSetTimeout = global.setTimeout;
const originalConsole = { ...console };

beforeEach(() => {
  global.setTimeout = vi.fn((fn) => {
    fn();
    return 1;
  }) as any;
  
  // Mock console methods to avoid console output in tests
  console.log = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  global.setTimeout = originalSetTimeout;
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  mockLocalStorage.clear();
});

describe('useDashboardMetricsWebSocket', () => {
  it('should initialize with null metrics and disconnected state', () => {
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    expect(result.current.metrics).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it('should connect WebSocket when token is present in localStorage', () => {
    const mockToken = 'test-token';
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    // Wait for useEffect to run
    act(() => {
      // Simulate WebSocket connection
      mockWs.open();
    });
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should update metrics when WebSocket receives a dashboard_tiles message', () => {
    const mockToken = 'test-token';
    
    const mockMetrics: DashboardTilesPayload = {
      total_deals: 100,
      deals_sent: 80,
      top_category: {
        name: 'Electronics',
        count: 25
      },
      active_groups: 10,
      avg_discount_pct: 15.5,
      next_run_in_seconds: 300
    };
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    // Wait for useEffect to run and establish connection
    act(() => {
      mockWs.open();
    });
    
    // Simulate receiving a message from WebSocket
    act(() => {
      mockWs.triggerMessage({
        type: 'dashboard_tiles',
        payload: mockMetrics,
      });
    });
    
    expect(result.current.metrics).toEqual(mockMetrics);
  });

  it('should not update metrics for non-dashboard_tiles message types', () => {
    const mockToken = 'test-token';
    
    const mockMetrics: DashboardTilesPayload = {
      total_deals: 100,
      deals_sent: 80,
      top_category: {
        name: 'Electronics',
        count: 25
      },
      active_groups: 10,
      avg_discount_pct: 15.5,
      next_run_in_seconds: 300
    };
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    // Wait for useEffect to run and establish connection
    act(() => {
      mockWs.open();
    });
    
    // Simulate receiving a message with wrong type
    act(() => {
      mockWs.triggerMessage({
        type: 'other_type',
        payload: mockMetrics,
      });
    });
    
    // Metrics should remain null
    expect(result.current.metrics).toBeNull();
  });

  it('should handle WebSocket connection errors', () => {
    const mockToken = 'test-token';
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    // Wait for useEffect to run
    act(() => {
      // Simulate WebSocket connection first
      mockWs.open();
    });
    
    // Simulate WebSocket error
    act(() => {
      mockWs.triggerError();
    });
    
    // WebSocket should attempt to reconnect after error
    expect(setTimeout).toHaveBeenCalled();
  });

  it('should handle WebSocket disconnection and attempt reconnection', () => {
    const mockToken = 'test-token';
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    // Wait for useEffect to run
    act(() => {
      // Simulate WebSocket connection first
      mockWs.open();
    });
    
    // Simulate WebSocket disconnection
    act(() => {
      mockWs.readyState = mockWebSocket.CLOSED;
      mockWs.onclose?.(new CloseEvent('close'));
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(setTimeout).toHaveBeenCalled();
  });

  it('should not connect if no token is present in localStorage', () => {
    // Ensure no token is set
    mockLocalStorage.removeItem('AUTH_TOKEN');
    
    const { result } = renderHook(() => useDashboardMetricsWebSocket());
    
    expect(result.current.isConnected).toBe(false);
  });
});