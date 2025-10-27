'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { generateSvg } from '@/actions/generateSvg'
import { getRandomSvg } from '@/actions/getRandomSvg'
import { createClient } from '@/utils/supabaseClients/client'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'
import { DialogModal } from './DialogModal'


interface PromptPhaseProps {
  user: any;
  promptCount: number;
  prompts: number;
  onSvgGenerated?: (svgUrl: string) => void;
}

export function AIPrompt({
  user,
  promptCount,
  prompts,
  onSvgGenerated
}: PromptPhaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<'init' | 'timer' | 'limit' | null>(null)
 
  const router = useRouter()
  const supabase = createClient()
  // Check prompt count on component mount
 useEffect(() => {  
    setIsModalOpen(true)
 }, [])
  // Handle form submission
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (promptCount >= 4) {
        setModalContent('limit')
        setIsModalOpen(true)
        return
      }

      try {
        setIsSubmitting(true)
        const formData = new FormData(event.target as HTMLFormElement)
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          throw new Error('User not authenticated')
        }

        // Generate SVG and upload to Supabase
        const result = await generateSvg(formData, user.id)

        if (result.success && result.data?.svg) {
          toast.success('Prompt submitted! Fetching your SVG...')

          // Now fetch a random SVG from the bucket (for now, later we'll implement proper distribution)
          const randomSvgResult = await getRandomSvg()

          if (randomSvgResult.success && randomSvgResult.svgUrl) {
            // Call the callback to pass the SVG URL to the parent component
            if (onSvgGenerated) {
              onSvgGenerated(randomSvgResult.svgUrl)
            }

            // Close the modal
            setIsModalOpen(false)
            toast.success('SVG loaded successfully!')
          } else {
            throw new Error(randomSvgResult.error || 'Failed to fetch SVG')
          }
        } else {
          throw new Error(result.error || 'Failed to generate image')
        }
      } catch (error: any) {
        console.error('Submission error:', error)
        toast.error(error.message || 'An error occurred')
      } finally {
        setIsSubmitting(false)
      }
    },
    [promptCount, onSvgGenerated]
  )
  // Check if the user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedPromptPhase')
    if (!hasVisited) {
      setModalContent('init')
      // setIsModalOpen(true)
      localStorage.setItem('hasVisitedPromptPhase', 'true')
    }
  }, [])

  // Handle timer expiration
  const handleTimeExpired = () => {
    setModalContent('timer')
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
    
    // Redirect to home if limit reached
    if (promptCount >= 4) {
      router.push('/')
    }
  }

  return (
    <>
 <DialogModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={modalContent === 'init' ? 'Welcome' : modalContent === 'timer' ? 'Time Up' : 'Limit Reached'}
        >
      <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 md:p-12 w-screen max-w-2xl">
        <div className="absolute top-2 md:top-6 right-4 md:right-6 text-xs md:text-sm text-blue-300/80">
          Drawing {promptCount + 1} of 4
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
          Enter Your Prompt
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
  <textarea
            id="textArea"
            name="prompt"
            required
            rows={6}
            className="w-full p-4 rounded-xl bg-black/30 text-blue-50 placeholder-blue-300 border-2 border-blue-500 focus:border-yellow-400 focus:ring focus:ring-yellow-400/50 transition-all duration-300 ease-in-out text-sm md:text-lg resize-none"
            placeholder="Enter something creative..."
            disabled={isSubmitting || promptCount >= 4}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
          /> 
          <button
            type="submit"
            disabled={isSubmitting || promptCount >= 4}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-md md:rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 text-sm md:text-lg font-semibold uppercase"
          >
            {isSubmitting ? 'Generating...' : promptCount >= 4 ? 'Limit Reached' : 'Generate Image'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              className="fill-yellow-500 mx-2"
              viewBox="0 0 24 24"
            >
              <g>
                <path d="M12.594 23.258l-.012.002-.071.035-.02.004-.014-.004-.071-.036q-.016-.004-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092q.019.005.029-.008l.004-.014-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 00-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01z" />
                <path d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16.807 2.36a4 4 0 002.276 2.411l.217.081 2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06-2.36.807a4 4 0 00-2.412 2.276l-.081.216-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16-.806-2.36a4 4 0 00-2.276-2.412l-.216-.081-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062 2.36-.806A4 4 0 008.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 01-3.49 3.649l-.25.091-2.36.806 2.36.806a6 6 0 013.649 3.49l.091.25.806 2.36.806-2.36a6 6 0 013.49-3.649l.25-.09 2.36-.807-2.36-.806a6 6 0 01-3.649-3.49l-.09-.25zM19 2a1 1 0 01.898.56l.048.117.35 1.026 1.027.35a1 1 0 01.118 1.845l-.118.048-1.026.35-.35 1.027a1 1 0 01-1.845.117l-.048-.117-.35-1.026-1.027-.35a1 1 0 01-.118-1.845l.118-.048 1.026-.35.35-1.027A1 1 0 0119 2" />
              </g>
            </svg>
          </button>
        </form>

        <div className="mt-8 flex justify-end">
          <a
            href="/"
            className="text-[10px] uppercase cursor-pointer px-2 py-1 border border-red-300 bg-red-900/50 text-red-300 hover:bg-red-800/40 transition-all duration-300 ease-in-out rounded"
          >
            exit testing
          </a>
        </div>
      </div>
      </DialogModal>
    </>
  )
}