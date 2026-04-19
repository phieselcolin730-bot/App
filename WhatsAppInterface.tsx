'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'

interface CriticalErrorScreenProps {
  onComplete: () => void
  onHaptic: (duration?: number) => void
}

export default function CriticalErrorScreen({ onComplete, onHaptic }: CriticalErrorScreenProps): JSX.Element {
  const [countdown, setCountdown] = useState<number>(15)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    // Haptic feedback for critical error
    onHaptic(200)
    
    // Show animation
    setIsVisible(true)
    animate('.critical-error-screen', 'fadeIn')
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          // Animate out and complete
          animate('.critical-error-screen', 'fadeOut')
          setTimeout(() => {
            onComplete()
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [onComplete, onHaptic])

  return (
    <div className={`critical-error-screen h-full w-full bg-red-600 flex flex-col items-center justify-center p-8 text-white ${isVisible ? 'animate__animated' : ''}`}>
      {/* Critical Error Icon */}
      <div className="mb-8 animate-pulse">
        <svg 
          className="w-24 h-24 text-white" 
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {/* Critical Error Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 animate-pulse">
          CRITICAL ERROR
        </h1>
        <div className="w-32 h-1 bg-white mx-auto mb-6 animate-pulse"></div>
      </div>

      {/* Error Message */}
      <div className="text-center mb-8">
        <p className="text-xl font-semibold leading-relaxed">
          Something went wrong
        </p>
        <p className="text-lg mt-2">
          we try again in {countdown} seconds
        </p>
      </div>

      {/* Countdown Circle */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"
          style={{
            animation: 'spin 2s linear infinite'
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{countdown}</span>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Warning Text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-white/80 px-4">
          System attempting automatic recovery...
        </p>
      </div>
    </div>
  )
}