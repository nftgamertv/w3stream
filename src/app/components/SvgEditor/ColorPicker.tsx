"use client";

import { useCallback, useState } from 'react';
import { useEditorStore } from './store';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  initialColor: string;
}

function ColorPickerModal({ isOpen, onClose, onColorSelect, initialColor }: ColorPickerModalProps) {
  const [currentColor, setCurrentColor] = useState(initialColor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        className="absolute left-24 top-20 w-[320px] bg-[#2b2b2b] rounded shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Color Picker</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setCurrentColor(newColor);
                  onColorSelect(newColor);
                }}
                className="w-[200px] h-[200px]"
              />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white">RGB</label>
                  <input
                    type="text"
                    value={currentColor.toUpperCase()}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setCurrentColor(newColor);
                      onColorSelect(newColor);
                    }}
                    className="w-full px-2 py-1 bg-[#3b3b3b] text-white border border-[#4b4b4b] rounded text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-white bg-[#3b3b3b] rounded hover:bg-[#4b4b4b]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onColorSelect(currentColor);
                  onClose();
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColorPicker() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<'fill' | 'stroke'>('fill');
  const { 
    tools: { fillColor, strokeColor },
    selection: { selectedElements },
    setFillColor, 
    setStrokeColor, 
    addToHistory 
  } = useEditorStore();

  const handleColorChange = useCallback((color: string) => {
    const mainLayer = document.getElementById('mainLayer');
    if (!mainLayer) return;

    // Update store and elements
    if (activeColor === 'fill') {
      setFillColor(color);
      selectedElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.setAttribute('fill', color);
        }
      });
    } else {
      setStrokeColor(color);
      selectedElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.setAttribute('stroke', color);
        }
      });
    }

    // Add to history after color change
    addToHistory();
  }, [activeColor, setFillColor, setStrokeColor, selectedElements, addToHistory]);

  return (
    <>
      <div className="absolute left-4 top-4 flex items-center space-x-1">
        <div className="relative w-8 h-8">
          {/* Stroke Square */}
          <button
            onClick={() => {
              setActiveColor('stroke');
              setIsModalOpen(true);
            }}
            className={`absolute inset-0 w-6 h-6 border-2 bg-transparent transition-all cursor-pointer
              ${activeColor === 'stroke' ? 'z-20' : 'z-10'}`}
            style={{ borderColor: strokeColor }}
          />
          {/* Fill Square */}
          <button
            onClick={() => {
              setActiveColor('fill');
              setIsModalOpen(true);
            }}
            className={`absolute left-2 top-2 w-6 h-6 transition-all cursor-pointer
              ${activeColor === 'fill' ? 'z-20' : 'z-10'}`}
            style={{ backgroundColor: fillColor }}
          />
        </div>
      </div>

      <ColorPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onColorSelect={handleColorChange}
        initialColor={activeColor === 'fill' ? fillColor : strokeColor}
      />
    </>
  );
}