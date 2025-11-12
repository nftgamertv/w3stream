import React, { useState, useEffect, useRef } from 'react';

const DualButtonSelect = ({
  // Icon and content props
  leftIcon,
  leftIconToggled, // Alternative icon when toggled
  leftContent,
  isToggled = false, // Toggle state
  
  // Select options
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option",
  
  // Left button action
  onLeftClick,
  
  // Styling props
  backgroundColor = '#4a6b94',
  hoverColor = '#3d5a7d',
  dividerColor = '#3d5a7d',
  width = 'w-32',
  height = 'h-20',
  leftButtonWidth = 'flex-1',
  rightButtonWidth = 'w-8',
  className = ''
}) => {
  const [isHoveredLeft, setIsHoveredLeft] = useState(false);
  const [isHoveredRight, setIsHoveredRight] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const modalRef = useRef(null);

  // Sync internal state with value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Handle selection
  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  // Handle left button click
  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick(selectedValue);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <>
      {/* Dual Button */}
      <div 
        className={`flex items-center ${width} ${height} rounded-lg overflow-hidden shadow-lg bg-gray-950 ${className}`}
         
      >
        {/* Left Button */}
        <button
          onClick={handleLeftClick}
          onMouseEnter={() => setIsHoveredLeft(true)}
          onMouseLeave={() => setIsHoveredLeft(false)}
          className={`${leftButtonWidth} h-full flex items-center justify-center transition-all`}
          style={{ backgroundColor: isHoveredLeft ? hoverColor : 'transparent' }}
        >
          {isToggled && leftIconToggled ? leftIconToggled : (leftIcon || leftContent)}
        </button>

        {/* Vertical Divider */}
        <div 
          className="w-0.5 h-full bg-gray-800"
       
        />

        {/* Right Button - Opens Modal */}
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHoveredRight(true)}
          onMouseLeave={() => setIsHoveredRight(false)}
          className={`${rightButtonWidth} h-full flex items-center justify-center transition-all`}
          style={{ backgroundColor: isHoveredRight ? hoverColor : 'transparent' }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M 8 12 L 16 20 L 24 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
      </div>
      <div className="text-xs px-1 py-0.5 mt-1 bg-gray-950 text-cyan-300 max-w-[128px] truncate" >{selectedOption?.label || "No selection"}</div>
      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="3 backdrop-blur-sm" aria-hidden="true" />
          
          {/* Modal Content */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-full max-w-md mx-4"
          >
            <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {placeholder}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Options */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {options.map((option) => {
                  const isSelected = option.value === selectedValue;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`group relative flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-gray-100 ${
                        isSelected ? 'bg-gray-100' : ''
                      }`}
                    >
                      {/* Check Icon */}
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isSelected && (
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Option Content */}
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500">{option.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
         
        </div>
      )}
    </>
  );
};

// Example Icons
const SpeakerIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <path d="M20 28 L20 52 L32 52 L48 64 L48 16 L32 28 Z" fill="white" />
    <path d="M 54 32 Q 58 40 54 48" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 60 26 Q 66 40 60 54" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 66 20 Q 74 40 66 60" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
);

const SpeakerMutedIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <path d="M20 28 L20 52 L32 52 L48 64 L48 16 L32 28 Z" fill="white" />
    <path d="M 56 30 L 70 44 M 70 30 L 56 44" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const PlayIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path d="M 20 15 L 20 45 L 45 30 Z" fill="white" />
  </svg>
);

const PauseIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="18" y="15" width="8" height="30" fill="white" />
    <rect x="34" y="15" width="8" height="30" fill="white" />
  </svg>
);
export default DualButtonSelect;  