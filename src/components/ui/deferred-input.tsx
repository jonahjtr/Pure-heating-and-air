import { useState, useRef, useEffect, forwardRef } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';

interface DeferredInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Input that uses local state during editing and only commits on blur.
 * This prevents caret jumping when parent state updates trigger re-renders.
 */
export const DeferredInput = forwardRef<HTMLInputElement, DeferredInputProps>(
  ({ value, onValueChange, onBlur, onFocus, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value);
    const isEditingRef = useRef(false);
    const lastExternalValueRef = useRef(value);

    // Sync from props only when NOT editing and value actually changed
    useEffect(() => {
      if (!isEditingRef.current && value !== lastExternalValueRef.current) {
        setLocalValue(value);
        lastExternalValueRef.current = value;
      }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isEditingRef.current = true;
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isEditingRef.current = false;
      lastExternalValueRef.current = localValue;
      if (localValue !== value) {
        onValueChange(localValue);
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    };

    return (
      <Input
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

DeferredInput.displayName = 'DeferredInput';

interface DeferredTextareaProps extends Omit<React.ComponentProps<typeof Textarea>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Textarea that uses local state during editing and only commits on blur.
 * This prevents caret jumping when parent state updates trigger re-renders.
 */
export const DeferredTextarea = forwardRef<HTMLTextAreaElement, DeferredTextareaProps>(
  ({ value, onValueChange, onBlur, onFocus, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value);
    const isEditingRef = useRef(false);
    const lastExternalValueRef = useRef(value);

    // Sync from props only when NOT editing and value actually changed
    useEffect(() => {
      if (!isEditingRef.current && value !== lastExternalValueRef.current) {
        setLocalValue(value);
        lastExternalValueRef.current = value;
      }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      isEditingRef.current = true;
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      isEditingRef.current = false;
      lastExternalValueRef.current = localValue;
      if (localValue !== value) {
        onValueChange(localValue);
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    };

    return (
      <Textarea
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

DeferredTextarea.displayName = 'DeferredTextarea';
