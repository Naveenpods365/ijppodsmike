import { renderHook, act } from '@testing-library/react';
import { useSchedulerMetricsWebSocket, SchedulerMetrics } from './useSchedulerMetricsWebSocket';
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

describe('useSchedulerMetricsWebSocket', () => {
  it('should initialize with default metrics and disconnected state', () => {
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
    expect(result.current.metrics).toEqual({
      active_schedules: 0,
      next_run_in_seconds: 0,
      runs_today: 0,
      success_rate: 0,
    });
    expect(result.current.isConnected).toBe(false);
  });

  it('should connect WebSocket when token is present in localStorage', () => {
    const mockToken = 'test-token';
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
    // Wait for useEffect to run
    act(() => {
      // Simulate WebSocket connection
      mockWs.open();
    });
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should update metrics when WebSocket receives a scheduler_overview message', () => {
    const mockToken = 'test-token';
    
    const mockMetrics: SchedulerMetrics = {
      active_schedules: 5,
      next_run_in_seconds: 300,
      runs_today: 10,
      success_rate: 95.5,
    };
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
    // Wait for useEffect to run and establish connection
    act(() => {
      mockWs.open();
    });
    
    // Simulate receiving a message from WebSocket
    act(() => {
      mockWs.triggerMessage({
        type: 'scheduler_overview',
        scheduler_active: true,
        active_schedules: mockMetrics.active_schedules,
        next_run_in_seconds: mockMetrics.next_run_in_seconds,
        runs_today: mockMetrics.runs_today,
        success_rate: mockMetrics.success_rate,
        generated_at: new Date().toISOString(),
      });
    });
    
    expect(result.current.metrics).toEqual(mockMetrics);
  });

  it('should not update metrics for non-scheduler_overview message types', () => {
    const mockToken = 'test-token';
    
    const mockMetrics: SchedulerMetrics = {
      active_schedules: 5,
      next_run_in_seconds: 300,
      runs_today: 10,
      success_rate: 95.5,
    };
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
    // Wait for useEffect to run and establish connection
    act(() => {
      mockWs.open();
    });
    
    // Simulate receiving a message with wrong type
    act(() => {
      mockWs.triggerMessage({
        type: 'other_type',
        scheduler_active: true,
        active_schedules: mockMetrics.active_schedules,
        next_run_in_seconds: mockMetrics.next_run_in_seconds,
        runs_today: mockMetrics.runs_today,
        success_rate: mockMetrics.success_rate,
        generated_at: new Date().toISOString(),
      });
    });
    
    // Metrics should remain at default values
    expect(result.current.metrics).toEqual({
      active_schedules: 0,
      next_run_in_seconds: 0,
      runs_today: 0,
      success_rate: 0,
    });
  });

  it('should handle WebSocket connection errors', () => {
    const mockToken = 'test-token';
    
    // Create mock WebSocket instance BEFORE setting the token and rendering the hook
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
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
    const mockWs = createMockWebSocket('wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=test-token');
    
    mockLocalStorage.setItem('AUTH_TOKEN', mockToken);
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
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
    
    const { result } = renderHook(() => useSchedulerMetricsWebSocket());
    
    expect(result.current.isConnected).toBe(false);
  });
});