import React from 'react';
import Select from 'react-select';
import { useApp } from '../context/AppContext';

export default function SearchableSelect({ options, value, onChange, placeholder, isDisabled = false }) {
  const { lang } = useApp();
  
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '46px',
      borderRadius: 'var(--radius-input, 8px)',
      backgroundColor: state.isFocused ? 'var(--color-surface-alt, #f8fafc)' : 'var(--color-surface, #ffffff)',
      border: state.isFocused 
        ? '1.5px solid var(--color-primary-ui, #1e3a8a)' 
        : '1.5px solid var(--color-border, #e2e8f0)',
      boxShadow: state.isFocused ? 'var(--color-focus-glow, 0 0 0 3px rgba(30,58,138,0.1))' : 'none',
      padding: '0',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: 'var(--color-text-primary, #1e293b)',
      transition: 'all var(--transition-fast)',
      opacity: state.isDisabled ? '0.6' : '1',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        border: state.isFocused 
          ? '1.5px solid var(--color-primary-ui, #1e3a8a)' 
          : '1.5px solid var(--color-border, #e2e8f0)',
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 12px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
      color: 'var(--color-text-primary, #1e293b)',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '42px',
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: 'var(--color-text-primary, #1e293b)',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--color-border, #e2e8f0)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '0.85rem',
      fontWeight: state.isSelected ? '700' : '500',
      backgroundColor: state.isSelected 
        ? 'var(--color-primary-ui, #1e3a8a)' 
        : state.isFocused 
          ? 'var(--color-surface-alt, #f8fafc)' 
          : 'transparent',
      color: state.isSelected ? '#ffffff' : 'var(--color-text-primary, #1e293b)',
      cursor: 'pointer',
      padding: '10px 12px',
      '&:active': {
        backgroundColor: 'var(--color-primary-ui, #1e3a8a)',
        color: '#ffffff'
      }
    })
  };

  // Convert array of objects/strings to react-select options if necessary
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: opt.toString() };
    }
    return opt;
  });

  return (
    <Select
      styles={customStyles}
      options={normalizedOptions}
      value={normalizedOptions.find(opt => opt.value === value) || null}
      onChange={(selected) => onChange(selected ? selected.value : null)}
      placeholder={placeholder || (lang === 'ar' ? 'بحث...' : 'Search...')}
      isSearchable={true}
      isDisabled={isDisabled}
      noOptionsMessage={() => lang === 'ar' ? 'لا يوجد نتائج' : 'No results found'}
      classNamePrefix="react-select"
    />
  );
}
