'use client'

import React, { useEffect, useState } from 'react'
import { animate } from '@/app/animate-api'
import { getTranslation } from '@/lib/translations'

interface BatteryDeadScreenProps {
  language: string
  onHaptic: (duration?: number) => void
  onCharge?: () => void
}

export default function BatteryDeadScreen({ language, onHaptic, onCharge }: BatteryDeadScreenProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [hapticDuration, setHapticDuration] = useState<number>(0)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.battery-dead-screen', 'fadeIn')
    
    // Start 6-second haptic feedback
    let hapticTimer = 0
    const hapticInterval = setInterval(() => {
      onHaptic(200) // 200ms vibration every 500ms
      hapticTimer += 500
      setHapticDuration(hapticTimer)
      
      if (hapticTimer >= 6000) { // 6 seconds total
        clearInterval(hapticInterval)
      }
    }, 500)

    return () => clearInterval(hapticInterval)
  }, [onHaptic])

  return (
    <div className={`battery-dead-screen h-full w-full bg-black flex flex-col items-center justify-center relative ${isVisible ? 'animate__animated' : ''}`}>
      {/* Dead Battery Animation */}
      <div className="relative mb-8">
        <div className="w-32 h-20 border-4 border-gray-700 rounded-xl relative bg-black">
          {/* Battery Terminal */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-gray-700 rounded-r"></div>
          
          {/* Dead Battery Icon */}
          <div className="absolute inset-2 flex items-center justify-center">
            <div className="text-red-500 text-4xl animate-pulse">⚠️</div>
          </div>
        </div>
        
        {/* Charging Animation (if charging) */}
        {onCharge && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="text-yellow-500 text-2xl animate-bounce">⚡</div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 animate-pulse">
          {t.batteryDead}
        </h1>
        <div className="text-gray-400 text-lg">
          0%
        </div>
        {onCharge && (
          <div className="text-yellow-500 text-sm mt-2 animate-pulse">
            {t.batteryCharging}
          </div>
        )}
      </div>

      {/* Haptic Progress */}
      <div className="w-48 h-2 bg-gray-800 rounded-full mb-4">
        <div 
          className="h-full bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((hapticDuration / 6000) * 100, 100)}%` }}
        ></div>
      </div>
      
      <div className="text-gray-600 text-xs text-center">
        Haptic feedback: {Math.min(hapticDuration / 1000, 6).toFixed(1)}s / 6.0s
      </div>

      {/* Charging Instructions (if needed) */}
      {!onCharge && (
        <div className="absolute bottom-8 left-4 right-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <div className="text-yellow-500 text-3xl mb-2">🔌</div>
              <div className="text-gray-400 text-sm">
                Connect charger to power on
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}