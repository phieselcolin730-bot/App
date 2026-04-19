'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTranslation } from '@/lib/translations'

interface AccountSetupProps {
  language: string
  onAccountComplete: (email: string) => void
  onHaptic: (duration?: number) => void
}

export default function AccountSetup({ language, onAccountComplete, onHaptic }: AccountSetupProps): JSX.Element {
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.account-container', 'fadeInUp')
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailSubmit = (): void => {
    onHaptic(50)
    
    if (!email.trim()) {
      setError(t.auth.emailRequired)
      animate('.error-message', 'shakeX')
      onHaptic(200)
      return
    }

    if (!validateEmail(email.trim())) {
      setError(t.auth.emailInvalid)
      animate('.error-message', 'shakeX')
      onHaptic(200)
      return
    }

    // Success animation
    animate('.account-success', 'bounceIn').then(() => {
      setTimeout(() => onAccountComplete(email.trim().toLowerCase()), 1000)
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
    setError('') // Clear error when user starts typing
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleEmailSubmit()
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t.auth.createAccountTitle}
        </h1>
        <p className="text-blue-200 text-sm mb-4">
          {t.auth.createAccountSubtitle}
        </p>
        <div className="text-4xl mb-4">📧</div>
        <p className="text-cyan-300 text-xs">
          {t.languageLabel}: {language}
        </p>
      </div>

      {/* Account Form */}
      <div className={`account-container flex-1 flex flex-col items-center justify-center px-6 ${isVisible ? 'animate__animated' : ''}`}>
        <div className="w-full max-w-sm space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium block">
              {t.auth.emailLabel}
            </label>
            <Input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              placeholder={t.auth.emailPlaceholder}
              className="w-full h-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:bg-white/20 focus:border-blue-400 transition-all duration-200"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message text-red-400 text-sm text-center font-medium animate__animated animate__shakeX">
              {error}
            </div>
          )}

          {/* Success Message */}
          {!error && email && validateEmail(email) && (
            <div className="account-success text-green-400 text-sm text-center font-medium">
              ✓ {t.auth.emailValid}
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleEmailSubmit}
            disabled={!email.trim() || !validateEmail(email.trim())}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {t.auth.continueButton}
          </Button>

          {/* Info Text */}
          <p className="text-white/70 text-xs text-center">
            {t.auth.accountInfo}
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-6 text-center">
        <p className="text-white/50 text-xs">
          {t.auth.termsInfo}
        </p>
      </div>
    </div>
  )
}