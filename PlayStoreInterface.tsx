'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { getTranslation } from '@/lib/translations'

interface BootScreenProps {
  onComplete: () => void
  onHaptic: (duration?: number) => void
  language?: string
}

export default function BootScreen({ onComplete, onHaptic, language = 'English' }: BootScreenProps): JSX.Element {
  const t = getTranslation(language)
  const [showLogo, setShowLogo] = useState<boolean>(false)
  const [showText, setShowText] = useState<boolean>(false)

  useEffect(() => {
    const bootSequence = async (): Promise<void> => {
      // Immediate haptic feedback for 2 seconds
      onHaptic(2000)
      
      // Show logo with animation
      setShowLogo(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      await animate('.boot-logo', 'zoomIn')
      
      // Show text with animation
      setShowText(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      await animate('.boot-text', 'fadeInUp')
      
      // Wait total 4 seconds then proceed
      await new Promise(resolve => setTimeout(resolve, 2700))
      onComplete()
    }

    bootSequence()
  }, [onComplete, onHaptic])

  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background particles animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-48 right-12 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
      </div>

      {/* Logo */}
      {showLogo && (
        <div className="boot-logo text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
            <div className="text-4xl font-bold text-white">AI</div>
          </div>
        </div>
      )}

      {/* Text */}
      {showText && (
        <div className="boot-text text-center animate__animated">
          <h1 className="text-3xl font-bold text-white mb-2">AIdroid</h1>
          <p className="text-lg text-blue-200 mb-1">powered by:</p>
          <p className="text-xl font-semibold text-cyan-300">OharaAI</p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      )}

      {/* Version info */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-xs text-gray-400">Version 2.0.0</p>
      </div>
    </div>
  )
}