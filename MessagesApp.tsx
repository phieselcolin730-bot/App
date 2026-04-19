'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/authStore'

interface PinSetupProps {
  language: string
  userEmail?: string
  onPinComplete: (pin: string) => void
  onHaptic: (duration?: number) => void
}

export default function PinSetup({ language, userEmail, onPinComplete, onHaptic }: PinSetupProps): JSX.Element {
  const { createAccount, accounts } = useAuthStore()
  const [pin, setPin] = useState<string>('')
  const [confirmPin, setConfirmPin] = useState<string>('')
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [error, setError] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    setIsVisible(true)
    animate('.pin-container', 'fadeInUp')
  }, [])

  const handleNumberPress = (number: string): void => {
    onHaptic(30)
    
    if (step === 'create') {
      if (pin.length < 4) {
        const newPin = pin + number
        setPin(newPin)
        animate('.pin-display', 'pulse')
        
        if (newPin.length === 4) {
          setTimeout(() => {
            setStep('confirm')
            animate('.pin-container', 'slideInRight')
          }, 500)
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirmPin = confirmPin + number
        setConfirmPin(newConfirmPin)
        animate('.pin-display', 'pulse')
        
        if (newConfirmPin.length === 4) {
          if (newConfirmPin === pin) {
            // If userEmail is provided, create account
            if (userEmail) {
              try {
                createAccount(userEmail, pin, language)
                onHaptic(100)
                animate('.pin-success', 'bounceIn').then(() => {
                  setTimeout(() => onPinComplete(pin), 1000)
                })
              } catch (error) {
                setError('Failed to create account')
                animate('.pin-display', 'shakeX')
                onHaptic(200)
                setTimeout(() => {
                  setConfirmPin('')
                  setError('')
                }, 1500)
              }
            } else {
              // Fallback for older flow - just complete PIN
              onHaptic(100)
              animate('.pin-success', 'bounceIn').then(() => {
                setTimeout(() => onPinComplete(pin), 1000)
              })
            }
          } else {
            setError('PINs do not match')
            animate('.pin-display', 'shakeX')
            onHaptic(200)
            setTimeout(() => {
              setConfirmPin('')
              setError('')
            }, 1500)
          }
        }
      }
    }
  }

  const handleBackspace = (): void => {
    onHaptic(30)
    
    if (step === 'create') {
      setPin(prev => prev.slice(0, -1))
    } else {
      setConfirmPin(prev => prev.slice(0, -1))
      setError('')
    }
    animate('.pin-display', 'pulse')
  }

  const currentPin = step === 'create' ? pin : confirmPin
  const pinDots = Array(4).fill(0).map((_, index) => (
    <div
      key={index}
      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
        index < currentPin.length
          ? 'bg-blue-400 border-blue-400 scale-110'
          : 'border-white/40'
      }`}
    />
  ))

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          {step === 'create' ? 'Create PIN' : 'Confirm PIN'}
        </h1>
        <p className="text-blue-200 text-sm">
          {step === 'create' 
            ? 'Enter a 4-digit PIN to secure your AIdroid' 
            : 'Re-enter your PIN to confirm'
          }
        </p>
        <p className="text-cyan-300 text-xs mt-1">Language: {language}</p>
      </div>

      {/* PIN Display */}
      <div className={`pin-container flex flex-col items-center mb-8 ${isVisible ? 'animate__animated' : ''}`}>
        <div className="pin-display flex space-x-4 mb-4">
          {pinDots}
        </div>
        
        {error && (
          <div className="text-red-400 text-sm font-medium animate__animated animate__shakeX">
            {error}
          </div>
        )}

        {step === 'confirm' && confirmPin.length === 4 && !error && (
          <div className="pin-success text-green-400 text-sm font-medium">
            ✓ PIN Created Successfully!
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
              className="h-16 w-16 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xl font-semibold transition-all duration-200 hover:scale-105"
              onClick={() => handleNumberPress(number.toString())}
            >
              {number}
            </Button>
          ))}
          
          {/* Empty space */}
          <div></div>
          
          {/* Zero */}
          <Button
            variant="ghost"
            size="lg"
            className="h-16 w-16 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xl font-semibold transition-all duration-200 hover:scale-105"
            onClick={() => handleNumberPress('0')}
          >
            0
          </Button>
          
          {/* Backspace */}
          <Button
            variant="ghost"
            size="lg"
            className="h-16 w-16 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xl font-semibold transition-all duration-200 hover:scale-105"
            onClick={handleBackspace}
          >
            ⌫
          </Button>
        </div>
      </div>
    </div>
  )
}