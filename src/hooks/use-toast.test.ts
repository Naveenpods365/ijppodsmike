import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer, addToRemoveQueue } from './use-toast';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock setTimeout to control timing in tests
vi.useFakeTimers();

describe('useToast', () => {
  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Test Toast' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string | undefined;
    
    act(() => {
      const newToast = toast({ title: 'Test Toast' });
      toastId = newToast.id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId);
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts when called without id', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Test Toast 1' });
      toast({ title: 'Test Toast 2' });
    });
    
    expect(result.current.toasts).toHaveLength(2);
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts[0].open).toBe(false);
    expect(result.current.toasts[1].open).toBe(false);
  });
});

describe('reducer', () => {
  const initialState = { toasts: [] };

  it('should handle ADD_TOAST', () => {
    const newToast = { id: '1', title: 'New Toast' };
    const action = { type: 'ADD_TOAST', toast: newToast };
    
    const newState = reducer(initialState, action);
    
    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0]).toEqual({ ...newToast, open: true });
  });

  it('should handle UPDATE_TOAST', () => {
    const initialStateWithToast = {
      toasts: [
        { id: '1', title: 'Old Title', description: 'Old Description' }
      ]
    };
    const action = {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'New Title' }
    };
    
    const newState = reducer(initialStateWithToast, action);
    
    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0].title).toBe('New Title');
    expect(newState.toasts[0].description).toBe('Old Description'); // Should remain unchanged
  });

  it('should handle DISMISS_TOAST with specific id', () => {
    const initialStateWithToasts = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true }
      ]
    };
    const action = { type: 'DISMISS_TOAST', toastId: '1' };
    
    const newState = reducer(initialStateWithToasts, action);
    
    expect(newState.toasts[0].open).toBe(false); // Toast with id '1' should be closed
    expect(newState.toasts[1].open).toBe(true);  // Toast with id '2' should remain open
  });

  it('should handle DISMISS_TOAST without id (dismiss all)', () => {
    const initialStateWithToasts = {
      toasts: [
        { id: '1', title: 'Toast 1', open: true },
        { id: '2', title: 'Toast 2', open: true }
      ]
    };
    const action = { type: 'DISMISS_TOAST', toastId: undefined };
    
    const newState = reducer(initialStateWithToasts, action);
    
    expect(newState.toasts[0].open).toBe(false); // All toasts should be closed
    expect(newState.toasts[1].open).toBe(false);
  });

  it('should handle REMOVE_TOAST with specific id', () => {
    const initialStateWithToasts = {
      toasts: [
        { id: '1', title: 'Toast 1' },
        { id: '2', title: 'Toast 2' }
      ]
    };
    const action = { type: 'REMOVE_TOAST', toastId: '1' };
    
    const newState = reducer(initialStateWithToasts, action);
    
    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0].id).toBe('2'); // Should only contain toast with id '2'
  });

  it('should handle REMOVE_TOAST without id (remove all)', () => {
    const initialStateWithToasts = {
      toasts: [
        { id: '1', title: 'Toast 1' },
        { id: '2', title: 'Toast 2' }
      ]
    };
    const action = { type: 'REMOVE_TOAST', toastId: undefined };
    
    const newState = reducer(initialStateWithToasts, action);
    
    expect(newState.toasts).toHaveLength(0); // Should be empty
  });
});

describe('addToRemoveQueue', () => {
  it('should add a timeout to remove toast after delay', () => {
    const toastId = 'test-toast';
    
    // Initially no timeout should exist for this toast
    expect(setTimeout).not.toHaveBeenCalled();
    
    addToRemoveQueue(toastId);
    
    // Verify setTimeout was called with the correct delay
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000000);
    
    // Fast-forward time to trigger the timeout
    act(() => {
      vi.advanceTimersByTime(1000000);
    });
  });

  it('should not add duplicate timeouts for the same toast', () => {
    const toastId = 'test-toast';
    
    addToRemoveQueue(toastId);
    addToRemoveQueue(toastId); // Should not add another timeout
    
    // Should still only have one setTimeout call
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });
});