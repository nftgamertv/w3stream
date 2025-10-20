import { LoginModal } from '@/components/LoginModal'
import React, { useEffect, useState } from 'react'

export default function WaitlistLogin() {
  const [isOpen, setIsOpen] = useState(false)
useEffect(() => {   

    setIsOpen(true)
  }, [])
 
  return (
    <div>
     
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
