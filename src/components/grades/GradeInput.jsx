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
    let rawVal = e.target.value;

    // 1. Allow empty string while editing
    if (rawVal === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    // Strip leading zero if user typed a digit after 0 (e.g. "05" -> "5")
    if (rawVal.length > 1 && rawVal.startsWith('0')) {
      rawVal = rawVal.replace(/^0+/, '') || '0';
    }

    let numVal = Number(rawVal);
    if (isNaN(numVal)) {
      numVal = minNum;
    }

    // 2. Strict max enforcement: Cap at maxNum if typed value > maxNum
    if (numVal > maxNum) {
      numVal = maxNum;
    }
    if (numVal < minNum) {
      numVal = minNum;
    }

    setLocalValue(numVal);
    onChange(numVal);

    // 3. Auto-Tab: Trigger auto-advance when 2 digits or max length entered
    const strVal = String(numVal);
    const maxStrLen = String(maxNum).length;

    if (strVal.length >= maxStrLen) {
      setTimeout(() => {
        focusNextInput(inputRef.current);
      }, 60);
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

  const handleFocus = (e) => {
    // Select all text on focus so typing replaces existing text immediately
    if (e.target && typeof e.target.select === 'function') {
      e.target.select();
    }
    // Remove initial 0 for immediate clean typing
    if (localValue === 0 || localValue === '0') {
      setLocalValue('');
    }
  };

  const handleKeyDown = (e) => {
    // Block +, -, e, E
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      return;
    }

    // Keyboard navigation (Tab, Shift+Tab, Enter, Arrow Down, Arrow Up)
    if (e.key === 'Enter' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      focusNextInput(inputRef.current);
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      focusPrevInput(inputRef.current);
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
