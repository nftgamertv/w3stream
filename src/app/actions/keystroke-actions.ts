// app/actions/keystroke-actions.ts
'use server'

import { createHash } from 'crypto';
import { keyPattern } from '@/stores/keys';
// Store hashed patterns (the actual patterns are never in the code)
const VALID_PATTERN_HASHES = new Set([
  'd7e9b6abf3c848b4a5b797b0fb64ba2bea63e6853464384d0ba83b9bc2f25dc4',
]);

function hashPattern(pattern: string): string {
  return createHash('sha256').update(pattern).digest('hex');
}

export async function verifyKeystrokePattern(pattern: string) {
  // DEBUG: Log what we're receiving
  console.log('=== KEYSTROKE DEBUG ===');
  console.log('Raw pattern received:', pattern);
  console.log('Pattern length:', pattern.length);
  console.log('Individual keys:', pattern.split(''));
  
  const patternHash = hashPattern(pattern);
  console.log('Generated hash:', patternHash);
  console.log('Valid hashes:', Array.from(VALID_PATTERN_HASHES));
  console.log('Match found:', VALID_PATTERN_HASHES.has(patternHash));
  console.log('=======================');
  
  if (VALID_PATTERN_HASHES.has(patternHash)) {
    keyPattern.set([{
      isValid: true,
      hash: patternHash,
    }]);
    return { 
      success: true, 
      message: 'Pattern recognized' 
    };
  }
  keyPattern.set([{
    isValid: false,
    hash: patternHash,
  }]);
  return { 
    success: false, 
    message: 'Invalid pattern' 
  };
}

// Utility function to generate hashes (use this once to create your hashes, then remove)
export async function generatePatternHash(pattern: string) {
  const hash = hashPattern(pattern);
  console.log('Pattern:', pattern);
  console.log('Hash:', hash);
  return hash;
}