import React, { useState } from 'react';

const Tooltip = ({ children, content, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm font-medium
            text-white bg-gray-900 rounded-lg shadow-lg
            border border-gray-700
            transition-all duration-200 ease-in-out
            ${position === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : ''}
            ${position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''}
            ${position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : ''}
          `}
        >
          <div className="relative">
            {/* Tooltip arrow */}
            <div
              className={`
                absolute w-2 h-2 bg-gray-900 transform rotate-45
                border-gray-700
                ${position === 'right' ? 'left-0 -ml-1 top-1/2 -translate-y-1/2 border-l border-b' : ''}
                ${position === 'left' ? 'right-0 -mr-1 top-1/2 -translate-y-1/2 border-r border-t' : ''}
                ${position === 'top' ? 'bottom-0 -mb-1 left-1/2 -translate-x-1/2 border-b border-r' : ''}
                ${position === 'bottom' ? 'top-0 -mt-1 left-1/2 -translate-x-1/2 border-t border-l' : ''}
              `}
            />
            
            {/* Tooltip content */}
            <div className="relative z-10">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Tooltip;