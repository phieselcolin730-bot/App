'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'
import { useAuthStore } from '@/lib/authStore'

interface PinAuthScreenProps {
  language: string
  userEmail: string
  onAuthSuccess: () => void
  onForgotPin: () => void
  onHaptic: (duration?: number) => void
}

export default function PinAuthScreen({ 
  language, 
  userEmail, 
  onAuthSuccess, 
  onForgotPin, 
  onHaptic 
}: PinAuthScreenProps): JSX.Element {
  const [pin, setPin] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [attempts, setAttempts] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockTimer, setLockTimer] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  
  const { authenticateUser } = useAuthStore()
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.pin-auth-container', 'fadeInUp')
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            setAttempts(0)
            setError('')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLocked, lockTimer])

  const handleNumberPress = (number: string): void => {
    if (isLocked) return
    
    onHaptic(30)
    
    if (pin.length < 4) {
      const newPin = pin + number
      setPin(newPin)
      animate('.pin-display', 'pulse')
      
      if (newPin.length === 4) {
        setTimeout(() => verifyPin(newPin), 300)
      }
    }
  }

  const verifyPin = (enteredPin: string): void => {
    const success = authenticateUser(userEmail, enteredPin)
    
    if (success) {
      onHaptic(100)
      animate('.pin-success', 'bounceIn').then(() => {
        setTimeout(() => onAuthSuccess(), 1000)
      })
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        // Lock for 2 minutes after 3 failed attempts
        setIsLocked(true)
        setLockTimer(120) // 2 minutes
        setError(t.auth.accountLocked)
        onHaptic(300)
      } else {
        setError(`${t.auth.pinIncorrect} (${3 - newAttempts} ${t.auth.attemptsLeft})`)
        onHaptic(200)
      }
      
      animate('.pin-display', 'shakeX')
      
      setTimeout(() => {
        setPin('')
        if (newAttempts < 3) {
          setError('')
        }
      }, 1500)
    }
  }

  const handleBackspace = (): void => {
    if (isLocked) return
    
    onHaptic(30)
    setPin(prev => prev.slice(0, -1))
    setError('')
    animate('.pin-display', 'pulse')
  }

  const handleForgotPin = (): void => {
    onHaptic(50)
    onForgotPin()
  }

  const pinDots = Array(4).fill(0).map((_, index) => (
    <div
      key={index}
      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
        index < pin.length
          ? 'bg-blue-400 border-blue-400 scale-110'
          : isLocked
          ? 'border-red-400/60'
          : 'border-white/40'
      }`}
    />
  ))

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t.auth.welcomeBack}
        </h1>
        <p className="text-blue-200 text-sm mb-2">
          {userEmail}
        </p>
        <p className="text-cyan-300 text-xs">
          {t.auth.enterPin}
        </p>
      </div>

      {/* PIN Display */}
      <div className={`pin-auth-container flex flex-col items-center mb-8 ${isVisible ? 'animate__animated' : ''}`}>
        <div className="pin-display flex space-x-4 mb-4">
          {pinDots}
        </div>
        
        {error && (
          <div className={`text-sm font-medium animate__animated animate__shakeX ${
            isLocked ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {error}
            {isLocked && (
              <div className="text-red-300 text-xs mt-1">
                {t.auth.tryAgainIn} {formatTime(lockTimer)}
              </div>
            )}
          </div>
        )}

        {pin.length === 4 && !error && (
          <div className="pin-success text-green-400 text-sm font-medium">
            ✓ {t.auth.authSuccess}
          </div>
        )}
      </div>

      {/* Number Pad */}
      <div className="flex-1 px-6 pb-6">
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              variant="ghost"
              size="lg"
              disabled={isLocked}
              className={`h-16 w-16 rounded-xl text-white text-xl font-semibold transition-all duration-200 ${
                isLocked 
                  ? 'bg-white/5 border border-red-400/20 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:scale-105'
              }`}
              onClick={() => handleNumberPress(number.toString())}
            >
              {number}
            </Button>
          ))}
          
          {/* Forgot PIN Button */}
          <Button
            variant="ghost"
            size="lg"
            disabled={isLocked}
            className={`h-16 w-16 rounded-xl text-xs font-medium transition-all duration-200 ${
              isLocked 
                ? 'bg-white/5 border border-red-400/20 text-white/30 cursor-not-allowed'
                : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 text-orange-200 hover:scale-105'
            }`}
            onClick={handleForgotPin}
          >
            {t.auth.forgotPin}
          </Button>
          
          {/* Zero */}
          <Button
            variant="ghost"
            size="lg"
            disabled={isLocked}
            className={`h-16 w-16 rounded-xl text-white text-xl font-semibold transition-all duration-200 ${
              isLocked 
                ? 'bg-white/5 border border-red-400/20 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:scale-105'
            }`}
            onClick={() => handleNumberPress('0')}
          >
            0
          </Button>
          
          {/* Backspace */}
          <Button
            variant="ghost"
            size="lg"
            disabled={isLocked}
            className={`h-16 w-16 rounded-xl text-white text-xl font-semibold transition-all duration-200 ${
              isLocked 
                ? 'bg-white/5 border border-red-400/20 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:scale-105'
            }`}
            onClick={handleBackspace}
          >
            ⌫
          </Button>
        </div>

        {/* Lock Status */}
        {isLocked && (
          <div className="text-center mt-6">
            <div className="text-red-400 text-sm">
              🔒 {t.auth.securityLock}
            </div>
            <div className="text-red-300 text-xs mt-1">
              {t.auth.unlockIn} {formatTime(lockTimer)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}