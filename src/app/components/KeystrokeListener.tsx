

// components/KeystrokeListener.tsx
'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { verifyKeystrokePattern } from '@/actions/keystroke-actions';
import { LoginModal } from './LoginModal';
  import { openLoginModal } from "@/store"
export default function KeystrokeListener() {
  const [buffer, setBuffer] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const hasTriggeredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const BUFFER_SIZE = 10;
  const TIMEOUT = 2000;

  const checkPattern = useCallback(async (keys: string[]) => {
    if (keys.length === 0 || hasTriggeredRef.current) return;

    const pattern = keys.join(',');
    const result = await verifyKeystrokePattern(pattern);

    if (result.success) {
      hasTriggeredRef.current = true;
      setShowModal(true);
      console.log('Secret pattern detected');
    }
  }, []);

  useEffect(() => {
    if (buffer.length > 0) {
      checkPattern(buffer);
    }
  }, [buffer, checkPattern]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setBuffer(prev => [...prev, e.key].slice(-BUFFER_SIZE));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setBuffer([]);
      }, TIMEOUT);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (<>
    
    <LoginModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
    />
</>  );
}
