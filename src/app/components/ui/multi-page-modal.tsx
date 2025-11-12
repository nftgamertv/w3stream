'use client'
import { motion, AnimatePresence,  } from 'framer-motion'
import React from 'react'
import { reactive, useObservable } from '@legendapp/state/react'
import { Switch, Show  } from '@legendapp/state/react'
 import AIModalPage1 from '../AIModalPage1'
import dynamic from 'next/dynamic'
import ShimmerButton from './shimmer-button'
import { createPortal } from 'react-dom'
 
const MotionButton = reactive(motion.button)
 
  export function Modal({ show }) {
 
const page$ = useObservable(0)
const spring = {
  type: "spring" as const,
  damping: 10,
  stiffness: 100
}
return (
  <motion.div
    className="flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div
    
      onClick={() => show.set(false)}
    />
    <motion.div
      className="modal"
      initial={{ opacity: 0, scale: 0.7, translateY: 40 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ scale: 0.7, opacity: 0 }}
 
      transition={spring}
    >
 
      <div className="pageText">
        <Switch value={page$}>
          {{
            0: () =>  <AIModalPage1 />,
            1: () => <div>Second Page</div>,
            2: () => <div>Third Page</div>
          }}
        </Switch>
      </div>
      {/* <div className="modalButtons">
        <MotionButton
          className="pageButton"
          $animate={() => ({ opacity: page$.get() === 0 ? 0.5 : 1 })}
          $disabled={() => page$.get() === 0}
          onClick={() => page$.set(p => p - 1)}
          transition={{ duration: 0.15 }}
        >
          Prev
        </MotionButton>
        <MotionButton
          className="pageButton"
          $animate={() => ({ opacity: page$.get() === 2 ? 0.5 : 1 })}
          $disabled={() => page$.get() === 2}
          onClick={() => page$.set(p => p + 1)}
          transition={{ duration: 0.15 }}
        >
          Next
        </MotionButton>
      </div> */}
    </motion.div>
  </motion.div>
)
}

 


export function MultiPageModal() {
 const [isClient, setIsClient] = React.useState(false)
    React.useEffect(() => {
        setIsClient(true)
    }, [])      
const DynamicModal = dynamic(() => import('./multi-page-modal').then((mod) => ({ default: mod.Modal, ssr: false })), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})
const showModal = useObservable(false)

return (
  <>
 
   <ShimmerButton onClick={showModal.toggle} />

   {isClient && createPortal(<> <Show if={showModal} wrap={AnimatePresence}>
      {() => <DynamicModal show={showModal} />}
    </Show></>, document.getElementById('modalRoot')!)}
   
  </>
)
}
