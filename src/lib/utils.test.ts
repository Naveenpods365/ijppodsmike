import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', {
        'active-class': isActive,
        'inactive-class': !isActive,
      });
      
      expect(result).toBe('base-class active-class');
    });

    it('should merge conflicting classes (later ones override)', () => {
      const result = cn('text-red', 'text-blue');
      expect(result).toBe('text-blue');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle null and undefined values', () => {
      const result = cn('class1', null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle mixed inputs', () => {
      const isActive = true;
      const result = cn(
        'base',
        ['class1', 'class2'],
        { 'active': isActive },
        null,
        'class3'
      );
      
      expect(result).toBe('base class1 class2 active class3');
    });
  });
});