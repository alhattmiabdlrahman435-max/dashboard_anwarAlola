import { useState, useEffect, useRef } from 'react';

const focusNextInput = (currentEl) => {
  if (!currentEl) return;
  const allInputs = Array.from(
    document.querySelectorAll('input.grades-input, input[type="number"]:not([disabled])')
  );
  const index = allInputs.indexOf(currentEl);
  if (index !== -1 && index < allInputs.length - 1) {
    const nextEl = allInputs[index + 1];
    nextEl.focus();
    if (typeof nextEl.select === 'function') {
      nextEl.select();
    }
  }
};

const focusPrevInput = (currentEl) => {
  if (!currentEl) return;
  const allInputs = Array.from(
    document.querySelectorAll('input.grades-input, input[type="number"]:not([disabled])')
  );
  const index = allInputs.indexOf(currentEl);
  if (index > 0) {
    const prevEl = allInputs[index - 1];
    prevEl.focus();
    if (typeof prevEl.select === 'function') {
      prevEl.select();
    }
  }
};

export default function GradeInput({ value, onChange, min = 0, max = 100, className, disabled }) {
  const [localValue, setLocalValue] = useState(value ?? 0);
  const inputRef = useRef(null);

  const minNum = Number(min);
  const maxNum = Number(max);

  useEffect(() => {
    setLocalValue(value ?? 0);
  }, [value]);

  const handleChange = (e) => {
    const rawVal = e.target.value;

    // Allow empty string while editing
    if (rawVal === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    let numVal = Number(rawVal);
    if (isNaN(numVal)) {
      numVal = minNum;
    }

    // Clamp value to maximum allowed limit (e.g. max 15, max 10, max 50)
    if (numVal > maxNum) {
      numVal = maxNum;
    }
    if (numVal < minNum) {
      numVal = minNum;
    }

    setLocalValue(numVal);
    onChange(numVal);

    // Auto-advance focus to next field when max digits entered (e.g. 2 digits for max 15 or 50)
    const strVal = String(numVal);
    const maxStrLen = String(maxNum).length;

    if (strVal.length >= maxStrLen) {
      setTimeout(() => {
        focusNextInput(inputRef.current);
      }, 50);
    }
  };

  const handleBlur = () => {
    if (localValue === '' || localValue === null || localValue === undefined) {
      setLocalValue(0);
      onChange(0);
    } else {
      let numVal = Number(localValue);
      if (isNaN(numVal) || numVal < minNum) numVal = minNum;
      if (numVal > maxNum) numVal = maxNum;
      setLocalValue(numVal);
      onChange(numVal);
    }
  };

  const handleKeyDown = (e) => {
    // Block +, -, e, E
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      return;
    }

    // Key navigation with Enter, Tab, ArrowDown, ArrowUp
    if (e.key === 'Enter' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      focusNextInput(inputRef.current);
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      focusPrevInput(inputRef.current);
    }
  };

  const handleFocus = (e) => {
    if (e.target && typeof e.target.select === 'function') {
      e.target.select();
    }
  };

  return (
    <input
      ref={inputRef}
      type="number"
      className={className || 'grades-input'}
      min={minNum}
      max={maxNum}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    />
  );
}
