'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Progress } from '@/components/ui/progress'

interface LoadingScreenProps {
  language: string
  onComplete: () => void
}

const LOADING_MESSAGES = [
  'Initializing AIdroid OS...',
  'Loading system modules...',
  'Setting up user interface...',
  'Configuring applications...',
  'Establishing connections...',
  'Optimizing performance...',
  'Finalizing setup...',
  'Welcome to AIdroid!'
]

export default function LoadingScreen({ language, onComplete }: LoadingScreenProps): JSX.Element {
  const [progress, setProgress] = useState<number>(0)
  const [currentMessage, setCurrentMessage] = useState<string>(LOADING_MESSAGES[0])
  const [messageIndex, setMessageIndex] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    setIsVisible(true)
    animate('.loading-container', 'fadeIn')

    const loadingInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15 + 5, 100)
        
        // Update message based on progress
        const newMessageIndex = Math.floor((newProgress / 100) * (LOADING_MESSAGES.length - 1))
        if (newMessageIndex !== messageIndex && newMessageIndex < LOADING_MESSAGES.length) {
          setMessageIndex(newMessageIndex)
          setCurrentMessage(LOADING_MESSAGES[newMessageIndex])
          animate('.loading-message', 'fadeInUp')
        }

        // Complete loading after 10 seconds (or when progress reaches 100)
        if (newProgress >= 100) {
          clearInterval(loadingInterval)
          setTimeout(() => {
            animate('.loading-complete', 'zoomIn').then(() => {
              setTimeout(onComplete, 1000)
            })
          }, 500)
        }

        return newProgress
      })
    }, 200)

    // Fallback: Complete after exactly 10 seconds
    const fallbackTimeout = setTimeout(() => {
      clearInterval(loadingInterval)
      setProgress(100)
      setTimeout(() => {
        animate('.loading-complete', 'zoomIn').then(() => {
          setTimeout(onComplete, 1000)
        })
      }, 500)
    }, 10000)

    return () => {
      clearInterval(loadingInterval)
      clearTimeout(fallbackTimeout)
    }
  }, [onComplete, messageIndex])

  return (
    <div className="h-full w-full bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-400/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-400/5 rounded-full animate-pulse"></div>
      </div>

      {/* Loading content */}
      <div className={`loading-container text-center z-10 ${isVisible ? 'animate__animated' : ''}`}>
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <div className="text-2xl font-bold text-white">AI</div>
          </div>
          <h1 className="text-xl font-bold text-white">AIdroid</h1>
          <p className="text-sm text-blue-200">Language: {language}</p>
        </div>

        {/* Loading circle animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <svg className="w-20 h-20 animate-spin" viewBox="0 0 50 50">
              <circle
                className="text-blue-200/20"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="25"
                cy="25"
              />
              <circle
                className="text-cyan-400"
                strokeWidth="3"
                strokeDasharray={`${progress * 1.26}, 126`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="20"
                cx="25"
                cy="25"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mb-6">
          <Progress value={progress} className="bg-white/20 h-2" />
        </div>

        {/* Loading message */}
        <div className="loading-message animate__animated">
          <p className="text-white text-sm font-medium">{currentMessage}</p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Complete message */}
        {progress >= 100 && (
          <div className="loading-complete mt-6">
            <div className="text-green-400 text-lg font-bold">✓ Setup Complete!</div>
            <div className="text-green-300 text-sm">Welcome to your AIdroid</div>
          </div>
        )}
      </div>
    </div>
  )
}