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

    // 1. Allow empty string so user can clear/backspace
    if (rawVal === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    let numVal = Number(rawVal);

    // 2. Reject non-numbers or values below min
    if (isNaN(numVal) || numVal < minNum) {
      return;
    }

    // 3. STRICT NON-ALLOWANCE: Reject any input greater than max completely!
    if (numVal > maxNum) {
      return;
    }

    setLocalValue(numVal);
    onChange(numVal);

    // 4. Auto-tab / Auto-advance on valid 2-digit completion
    const strVal = String(numVal);
    const maxStrLen = String(maxNum).length;

    if (strVal.length >= maxStrLen && numVal <= maxNum) {
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

  const handleKeyDown = (e) => {
    // Block +, -, e, E
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      return;
    }

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
