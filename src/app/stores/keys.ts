import { map } from 'nanostores'

export const keyPattern = map([{
    isValid: null as boolean | null,
    hash: '' as string,
}])


keyPattern.set([{
    isValid: false,
    hash: 'd7e9b6abf3c848b4a5b797b0fb64ba2bea63e6853464384d0ba83b9bc2f25dc4',
    }])  


keyPattern.subscribe((value) => {   
    console.log('Key pattern store updated:', value);
})// src/app/stores/keys.ts