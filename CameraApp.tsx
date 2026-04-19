'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface LocationWarningScreenProps {
  onAccept: () => void
  onReject: () => void
  onHaptic: (duration?: number) => void
  language?: string
}

export default function LocationWarningScreen({ onAccept, onReject, onHaptic, language = 'English' }: LocationWarningScreenProps): JSX.Element {
  const t = getTranslation(language)
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)

  // Play warning sound for users outside Great Britain
  const playWarningSound = (): void => {
    try {
      // Create audio context for warning sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create warning tone (500Hz and 800Hz alternating)
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator1.frequency.setValueAtTime(500, audioContext.currentTime)
      oscillator2.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator1.type = 'sine'
      oscillator2.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      
      // Alternating warning pattern
      const startTime = audioContext.currentTime
      oscillator1.start(startTime)
      oscillator1.stop(startTime + 0.3)
      
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.setValueAtTime(800, audioContext.currentTime)
        osc2.type = 'sine'
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
        osc2.start()
        osc2.stop(audioContext.currentTime + 0.3)
      }, 400)
      
      setTimeout(() => {
        const osc3 = audioContext.createOscillator()
        const gain3 = audioContext.createGain()
        osc3.connect(gain3)
        gain3.connect(audioContext.destination)
        osc3.frequency.setValueAtTime(500, audioContext.currentTime)
        osc3.type = 'sine'
        gain3.gain.setValueAtTime(0.3, audioContext.currentTime)
        osc3.start()
        osc3.stop(audioContext.currentTime + 0.3)
      }, 800)
      
      setAudioPlaying(true)
      setTimeout(() => setAudioPlaying(false), 1200)
      
    } catch (error) {
      console.warn('Could not play warning sound:', error)
    }
  }

  useEffect(() => {
    const checkLocation = async (): Promise<void> => {
      try {
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              
              // Great Britain approximate bounds
              const gbBounds = {
                north: 60.9,
                south: 49.8,
                east: 2.0,
                west: -8.2
              }
              
              // Check if user is outside Great Britain
              const isOutsideGB = (
                latitude > gbBounds.north ||
                latitude < gbBounds.south ||
                longitude > gbBounds.east ||
                longitude < gbBounds.west
              )
              
              if (isOutsideGB) {
                // Show warning and play sound
                setTimeout(() => {
                  playWarningSound()
                  onHaptic(1000)
                  setShowWarning(true)
                  animate('.location-warning', 'shakeX')
                }, 2000) // 2 seconds black screen first
              } else {
                // User is in Great Britain, proceed normally
                setTimeout(() => {
                  onAccept()
                }, 2000)
              }
            },
            (error) => {
              // If geolocation fails, assume user is outside GB and show warning
              setTimeout(() => {
                playWarningSound()
                onHaptic(1000)
                setShowWarning(true)
                animate('.location-warning', 'shakeX')
              }, 2000)
            },
            {
              timeout: 10000,
              enableHighAccuracy: false,
              maximumAge: 300000
            }
          )
        } else {
          // Geolocation not supported, show warning
          setTimeout(() => {
            playWarningSound()
            onHaptic(1000)
            setShowWarning(true)
            animate('.location-warning', 'shakeX')
          }, 2000)
        }
      } catch (error) {
        // Any error, show warning
        setTimeout(() => {
          playWarningSound()
          onHaptic(1000)
          setShowWarning(true)
          animate('.location-warning', 'shakeX')
        }, 2000)
      }
    }

    checkLocation()
  }, [onAccept, onHaptic])

  const handleAccept = (): void => {
    onHaptic(100)
    animate('.location-warning', 'fadeOut')
    setTimeout(() => {
      onAccept()
    }, 500)
  }

  const handleReject = (): void => {
    onHaptic(200)
    animate('.location-warning', 'fadeOut')
    setTimeout(() => {
      onReject()
    }, 500)
  }

  if (!showWarning) {
    // Black screen for 2 seconds
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white/70 text-sm mt-4">Checking location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="location-warning h-full w-full bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex flex-col items-center justify-center relative overflow-hidden animate__animated">
      {/* Warning Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-16 w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-48 right-12 w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
      </div>

      {/* Warning Icon */}
      <div className="text-8xl mb-8 animate-bounce">⚠️</div>
      
      {/* Warning Sound Indicator */}
      {audioPlaying && (
        <div className="absolute top-16 right-6 flex items-center space-x-2 bg-red-600/80 rounded-full px-4 py-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-sm">🔊</span>
        </div>
      )}

      {/* Warning Title */}
      <h1 className="text-4xl font-bold text-white mb-6 text-center animate-pulse">
        LOCATION WARNING
      </h1>

      {/* Warning Message */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mx-6 mb-8 border-2 border-red-500/50">
        <p className="text-white text-xl text-center font-semibold leading-relaxed">
          Do you understand that weather and time is not correctly?
        </p>
        <p className="text-red-200 text-sm text-center mt-4">
          You appear to be outside Great Britain. Local services may not function properly.
        </p>
      </div>

      {/* Accept/Reject Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-8 py-4 rounded-2xl border-4 border-green-500/30 shadow-2xl transform transition-all hover:scale-105"
          size="lg"
        >
          YES
        </Button>
        <Button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-8 py-4 rounded-2xl border-4 border-red-500/30 shadow-2xl transform transition-all hover:scale-105"
          size="lg"
        >
          NO
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center mt-6 max-w-sm space-y-2">
        <p className="text-green-200 text-xs">
          <strong>YES:</strong> Continue with limited weather and time accuracy
        </p>
        <p className="text-red-200 text-xs">
          <strong>NO:</strong> Disable weather and clock features entirely
        </p>
      </div>

      {/* Warning Lines Animation */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-pulse"></div>
    </div>
  )
}