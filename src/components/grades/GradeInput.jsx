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

    if (rawVal === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    let numVal = Number(rawVal);
    if (isNaN(numVal)) {
      numVal = 0;
    }

    // Clamp maximum limit
    if (numVal > maxNum) {
      numVal = maxNum;
    }
    // Clamp minimum limit
    if (numVal < minNum) {
      numVal = minNum;
    }

    setLocalValue(numVal);
    onChange(numVal);

    // Auto-advance logic
    const strVal = String(numVal);
    const maxStrLen = String(maxNum).length;

    let shouldAutoAdvance = false;
    if (strVal.length >= maxStrLen) {
      shouldAutoAdvance = true;
    } else if (maxNum <= 15 && numVal >= 2 && numVal <= 9) {
      shouldAutoAdvance = true;
    } else if (maxNum <= 50 && numVal >= 6 && numVal <= 9) {
      shouldAutoAdvance = true;
    }

    if (shouldAutoAdvance) {
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
      if (isNaN(numVal)) numVal = 0;
      if (numVal > maxNum) numVal = maxNum;
      if (numVal < minNum) numVal = minNum;
      setLocalValue(numVal);
      onChange(numVal);
    }
  };

  const handleKeyDown = (e) => {
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
