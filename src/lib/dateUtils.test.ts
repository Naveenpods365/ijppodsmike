import moment from 'moment';
import { formatNextRunTime } from './dateUtils';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock moment to control time in tests
vi.mock('moment', async () => {
  const actual = await vi.importActual('moment');
  
  const mockMoment = (date?: string | number | Date) => {
    const momentInstance = actual.default(date || '2023-01-15T10:30:00Z');
    return momentInstance;
  };
  
  // Copy all properties from the actual moment object
  Object.assign(mockMoment, actual.default);
  
  // Ensure parseZone is available
  mockMoment.parseZone = actual.default.parseZone;
  
  return {
    default: mockMoment,
  };
});

describe('dateUtils', () => {
  describe('formatNextRunTime', () => {
    it('should return empty string when isoString is falsy', () => {
      expect(formatNextRunTime(null)).toBe('');
      expect(formatNextRunTime(undefined)).toBe('');
      expect(formatNextRunTime('')).toBe('');
    });

    it('should format time for today', () => {
      // Mock moment to return a specific date
      const mockDate = '2023-01-15T14:30:00Z';
      const mockNow = moment('2023-01-15T10:00:00Z'); // Same day
      
      // Mock moment() to return our fixed "now" time
      vi.spyOn(global.Date, 'now').mockImplementation(() => mockNow.valueOf());
      
      const result = formatNextRunTime(mockDate);
      
      expect(result).toBe('Today at 02:30 PM');
    });

    it('should format time for tomorrow', () => {
      const mockDate = '2023-01-16T09:15:00Z';
      const mockNow = moment('2023-01-15T10:00:00Z'); // Day before
      
      vi.spyOn(global.Date, 'now').mockImplementation(() => mockNow.valueOf());
      
      const result = formatNextRunTime(mockDate);
      
      expect(result).toBe('Tomorrow at 09:15 AM');
    });

    it('should format time for future date', () => {
      const mockDate = '2023-01-20T16:45:00Z';
      const mockNow = moment('2023-01-15T10:00:00Z'); // 5 days before
      
      vi.spyOn(global.Date, 'now').mockImplementation(() => mockNow.valueOf());
      
      const result = formatNextRunTime(mockDate);
      
      expect(result).toBe('20 Jan at 04:45 PM');
    });

    it('should handle different time zones properly', () => {
      const mockDate = '2023-01-15T23:30:00+05:30'; // Different timezone
      const mockNow = moment('2023-01-15T10:00:00Z');
      
      vi.spyOn(global.Date, 'now').mockImplementation(() => mockNow.valueOf());
      
      const result = formatNextRunTime(mockDate);
      
      // Should still format correctly despite timezone difference
      expect(result).toContain('Today');
    });
  });
});

// Restore the Date.now mock after tests
afterEach(() => {
  vi.restoreAllMocks();
});