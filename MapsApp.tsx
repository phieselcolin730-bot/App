'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTranslation } from '@/lib/translations'
import { useAuthStore } from '@/lib/authStore'

interface PinRecoveryScreenProps {
  language: string
  userEmail: string
  onRecoveryComplete: () => void
  onBack: () => void
  onHaptic: (duration?: number) => void
}

type RecoveryStep = 'request' | 'waiting' | 'verify' | 'reset' | 'success'

export default function PinRecoveryScreen({ 
  language, 
  userEmail, 
  onRecoveryComplete, 
  onBack, 
  onHaptic 
}: PinRecoveryScreenProps): JSX.Element {
  const [step, setStep] = useState<RecoveryStep>('request')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [newPin, setNewPin] = useState<string>('')
  const [confirmPin, setConfirmPin] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [waitTime, setWaitTime] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  
  const { initiateRecovery, verifyRecoveryCode, resetPin } = useAuthStore()
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.recovery-container', 'fadeInUp')
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (waitTime > 0) {
      interval = setInterval(() => {
        setWaitTime((prev) => {
          if (prev <= 1) {
            setStep('verify')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [waitTime])

  const handleRequestCode = async (): Promise<void> => {
    setIsLoading(true)
    onHaptic(50)

    try {
      const success = await initiateRecovery(userEmail)
      if (success) {
        setStep('waiting')
        setWaitTime(30) // 30 second wait simulation
        animate('.recovery-success', 'bounceIn')
      } else {
        setError(t.auth.recoveryFailed)
        animate('.error-message', 'shakeX')
        onHaptic(200)
      }
    } catch (err) {
      setError(t.auth.recoveryError)
      animate('.error-message', 'shakeX')
      onHaptic(200)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = (): void => {
    onHaptic(50)
    
    if (verificationCode.length !== 6) {
      setError(t.auth.codeInvalid)
      animate('.error-message', 'shakeX')
      onHaptic(200)
      return
    }

    const isValid = verifyRecoveryCode(userEmail, verificationCode)
    if (isValid) {
      setStep('reset')
      setError('')
      animate('.recovery-container', 'slideInRight')
    } else {
      setError(t.auth.codeIncorrect)
      animate('.error-message', 'shakeX')
      onHaptic(200)
    }
  }

  const handlePinReset = (): void => {
    onHaptic(50)
    
    if (newPin.length !== 4) {
      setError(t.auth.pinTooShort)
      animate('.error-message', 'shakeX')
      onHaptic(200)
      return
    }

    if (newPin !== confirmPin) {
      setError(t.auth.pinMismatch)
      animate('.error-message', 'shakeX')
      onHaptic(200)
      return
    }

    const success = resetPin(userEmail, newPin)
    if (success) {
      setStep('success')
      onHaptic(100)
      animate('.success-animation', 'bounceIn').then(() => {
        setTimeout(() => onRecoveryComplete(), 2000)
      })
    } else {
      setError(t.auth.resetFailed)
      animate('.error-message', 'shakeX')
      onHaptic(200)
    }
  }

  const handleNumberPress = (number: string): void => {
    onHaptic(30)
    
    if (step === 'reset') {
      if (newPin.length < 4 && confirmPin.length === 0) {
        setNewPin(prev => prev + number)
      } else if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + number)
      }
    }
    animate('.pin-display', 'pulse')
  }

  const handleBackspace = (): void => {
    onHaptic(30)
    
    if (step === 'reset') {
      if (confirmPin.length > 0) {
        setConfirmPin(prev => prev.slice(0, -1))
      } else if (newPin.length > 0) {
        setNewPin(prev => prev.slice(0, -1))
      }
    }
    animate('.pin-display', 'pulse')
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderStepContent = (): JSX.Element => {
    switch (step) {
      case 'request':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-xl font-semibold text-white">
              {t.auth.recoveryTitle}
            </h2>
            <p className="text-blue-200 text-sm">
              {t.auth.recoverySubtitle.replace('{email}', userEmail)}
            </p>
            <Button
              onClick={handleRequestCode}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? t.auth.sending : t.auth.sendCode}
            </Button>
          </div>
        )

      case 'waiting':
        return (
          <div className="text-center space-y-6">
            <div className="recovery-success text-6xl mb-6">⏱️</div>
            <h2 className="text-xl font-semibold text-white">
              {t.auth.codeSent}
            </h2>
            <p className="text-green-200 text-sm">
              {t.auth.checkEmail.replace('{email}', userEmail)}
            </p>
            <div className="bg-blue-500/20 border border-blue-400/40 rounded-xl p-4">
              <p className="text-blue-200 text-sm">
                {t.auth.waitingForCode} {formatTime(waitTime)}
              </p>
              <div className="w-full bg-blue-900/50 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((30 - waitTime) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )

      case 'verify':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-xl font-semibold text-white">
              {t.auth.enterCode}
            </h2>
            <p className="text-blue-200 text-sm">
              {t.auth.codeInstructions}
            </p>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              placeholder="000000"
              className="w-full h-12 text-center text-2xl tracking-widest bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:bg-white/20 focus:border-blue-400"
              maxLength={6}
            />
            <Button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {t.auth.verifyCode}
            </Button>
          </div>
        )

      case 'reset':
        const currentPin = newPin.length < 4 ? newPin : confirmPin
        const isConfirming = newPin.length === 4
        const pinDots = Array(4).fill(0).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              index < currentPin.length
                ? 'bg-green-400 border-green-400 scale-110'
                : 'border-white/40'
            }`}
          />
        ))

        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🔄</div>
            <h2 className="text-xl font-semibold text-white">
              {isConfirming ? t.auth.confirmNewPin : t.auth.createNewPin}
            </h2>
            
            {/* PIN Display */}
            <div className="pin-display flex justify-center space-x-4 mb-6">
              {pinDots}
            </div>

            {/* PIN Status */}
            {newPin.length === 4 && confirmPin.length === 4 && newPin === confirmPin && (
              <div className="text-green-400 text-sm font-medium">
                ✓ {t.auth.pinMatched}
              </div>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <Button
                  key={number}
                  variant="ghost"
                  className="h-12 w-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-lg font-semibold transition-all duration-200 hover:scale-105"
                  onClick={() => handleNumberPress(number.toString())}
                >
                  {number}
                </Button>
              ))}
              <div></div>
              <Button
                variant="ghost"
                className="h-12 w-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-lg font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => handleNumberPress('0')}
              >
                0
              </Button>
              <Button
                variant="ghost"
                className="h-12 w-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-lg font-semibold transition-all duration-200 hover:scale-105"
                onClick={handleBackspace}
              >
                ⌫
              </Button>
            </div>

            {newPin.length === 4 && confirmPin.length === 4 && (
              <Button
                onClick={handlePinReset}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                {t.auth.resetPin}
              </Button>
            )}
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="success-animation text-6xl mb-6">✅</div>
            <h2 className="text-xl font-semibold text-white">
              {t.auth.resetSuccess}
            </h2>
            <p className="text-green-200 text-sm">
              {t.auth.resetComplete}
            </p>
            <div className="text-green-400 text-sm">
              {t.auth.redirecting}
            </div>
          </div>
        )

      default:
        return <div></div>
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 flex items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 rounded-full p-2"
        >
          ← {t.back}
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-white">
            {t.auth.forgotPin}
          </h1>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Content */}
      <div className={`recovery-container flex-1 flex flex-col items-center justify-center px-6 ${isVisible ? 'animate__animated' : ''}`}>
        {renderStepContent()}

        {/* Error Message */}
        {error && (
          <div className="error-message mt-6 text-red-400 text-sm text-center font-medium animate__animated animate__shakeX">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}