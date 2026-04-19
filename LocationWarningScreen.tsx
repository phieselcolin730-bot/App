'use client'

import React, { useState, useEffect } from 'react'
import CriticalErrorScreen from '@/components/phone/CriticalErrorScreen'
import BootScreen from '@/components/phone/BootScreen'
import LocationWarningScreen from '@/components/phone/LocationWarningScreen'
import LanguageSelection from '@/components/phone/LanguageSelection'
import AccountSetup from '@/components/phone/AccountSetup'
import PinSetup from '@/components/phone/PinSetup'
import PinAuthScreen from '@/components/phone/PinAuthScreen'
import PinRecoveryScreen from '@/components/phone/PinRecoveryScreen'
import LoadingScreen from '@/components/phone/LoadingScreen'
import PhoneInterface from '@/components/phone/PhoneInterface'
import BatteryDeadScreen from '@/components/phone/BatteryDeadScreen'
import ServerStatus from '@/components/ServerStatus'
import { useAuthStore } from '@/lib/authStore'

import { sdk } from '@farcaster/miniapp-sdk'
type PhoneState = 'critical-error' | 'boot' | 'location-check' | 'language' | 'account-setup' | 'pin-setup' | 'pin-auth' | 'pin-recovery' | 'loading' | 'interface' | 'battery-dead'

interface PhoneData {
  language: string
  pin: string
  connectedNetwork: string | null
  batteryLevel: number
  isBatteryDead: boolean
  weatherClockDisabled: boolean
}

export default function AIdroidPhone(): JSX.Element {
  const { currentUser, accounts, isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') return
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0)
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true })
            }
          })
        }
        
        // Only initialize if SDK is available
        if (typeof sdk !== 'undefined' && sdk.actions) {
          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully')
        }
      } catch (error) {
        console.warn('Farcaster SDK not available or failed to initialize:', error)
        // Gracefully continue without SDK - app should still work
      }
    }

    initializeFarcaster()
  }, [])
  
  // Randomly determine if we should show critical error (5% chance)
  const [currentState, setCurrentState] = useState<PhoneState>(() => {
    const showCriticalError = Math.random() < 0.05 // 5% chance
    return showCriticalError ? 'critical-error' : 'boot'
  })
  
  const [phoneData, setPhoneData] = useState<PhoneData>({
    language: '',
    pin: '',
    connectedNetwork: null,
    batteryLevel: 100,
    isBatteryDead: false,
    weatherClockDisabled: false
  })

  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [newAccountEmail, setNewAccountEmail] = useState<string>('')

  useEffect(() => {
    // Add mobile viewport meta tag for better mobile experience
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      document.head.appendChild(meta)
    }
  }, [])

  const handleStateChange = (newState: PhoneState, data?: Partial<PhoneData>): void => {
    if (data) {
      setPhoneData(prev => ({ ...prev, ...data }))
    }
    setCurrentState(newState)
  }

  const handleNetworkConnect = (networkId: string): void => {
    setPhoneData(prev => ({ ...prev, connectedNetwork: networkId || null }))
  }

  // Handle language selection and go directly to interface
  const handleLanguageSelect = (language: string): void => {
    setPhoneData(prev => ({ ...prev, language }))
    
    // Always go directly to interface (home screen) after loading
    // Authentication will happen as overlay on the home screen in PhoneInterface
    setCurrentState('loading')
  }

  // Handle account setup completion
  const handleAccountSetup = (email: string): void => {
    setCurrentUserEmail(email)
    setCurrentState('pin-setup')
  }

  // Handle PIN setup completion (for new accounts)
  const handlePinSetup = (pin: string): void => {
    setPhoneData(prev => ({ ...prev, pin }))
    setCurrentState('loading')
  }

  // Handle PIN authentication success
  const handleAuthSuccess = (): void => {
    if (currentUser) {
      setPhoneData(prev => ({
        ...prev,
        language: currentUser.language,
        pin: currentUser.pin
      }))
    }
    setCurrentState('loading')
  }

  // Handle forgot PIN
  const handleForgotPin = (): void => {
    setCurrentState('pin-recovery')
  }

  // Handle PIN recovery completion
  const handleRecoveryComplete = (): void => {
    setCurrentState('pin-auth')
  }

  // Handle back from recovery
  const handleRecoveryBack = (): void => {
    setCurrentState('pin-auth')
  }

  // Battery drain system - 1% per minute
  useEffect(() => {
    if (currentState === 'interface' && !phoneData.isBatteryDead) {
      const batteryInterval = setInterval(() => {
        setPhoneData(prev => {
          const newBatteryLevel = Math.max(prev.batteryLevel - 1, 0)
          
          // Battery dead at 0%
          if (newBatteryLevel === 0 && !prev.isBatteryDead) {
            setCurrentState('battery-dead')
            return {
              ...prev,
              batteryLevel: 0,
              isBatteryDead: true
            }
          }
          
          return {
            ...prev,
            batteryLevel: newBatteryLevel
          }
        })
      }, 60000) // 60 seconds = 1 minute

      return () => clearInterval(batteryInterval)
    }
  }, [currentState, phoneData.isBatteryDead])

  const triggerHapticFeedback = (duration: number = 100): void => {
    if (navigator.vibrate) {
      navigator.vibrate(duration)
    }
  }

  const renderCurrentScreen = (): JSX.Element => {
    switch (currentState) {
      case 'critical-error':
        return (
          <CriticalErrorScreen 
            onComplete={() => handleStateChange('boot')}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'boot':
        return (
          <BootScreen 
            onComplete={() => handleStateChange('location-check')}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'location-check':
        return (
          <LocationWarningScreen 
            onAccept={() => handleStateChange('language')}
            onReject={() => {
              setPhoneData(prev => ({ ...prev, weatherClockDisabled: true }))
              handleStateChange('language')
            }}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'language':
        return (
          <LanguageSelection 
            onLanguageSelect={handleLanguageSelect}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'account-setup':
        return (
          <AccountSetup
            language={phoneData.language}
            onAccountComplete={handleAccountSetup}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'pin-setup':
        return (
          <PinSetup 
            language={phoneData.language}
            userEmail={currentUserEmail}
            onPinComplete={handlePinSetup}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'pin-auth':
        return (
          <PinAuthScreen
            language={phoneData.language}
            userEmail={currentUserEmail}
            onAuthSuccess={handleAuthSuccess}
            onForgotPin={handleForgotPin}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'pin-recovery':
        return (
          <PinRecoveryScreen
            language={phoneData.language}
            userEmail={currentUserEmail}
            onRecoveryComplete={handleRecoveryComplete}
            onBack={handleRecoveryBack}
            onHaptic={triggerHapticFeedback}
          />
        )
      case 'loading':
        return (
          <LoadingScreen 
            language={phoneData.language}
            onComplete={() => handleStateChange('interface')}
          />
        )
      case 'interface':
        return (
          <PhoneInterface 
            phoneData={phoneData}
            onHaptic={triggerHapticFeedback}
            onNetworkConnect={handleNetworkConnect}
            onAuthSuccess={handleAuthSuccess}
            onForgotPin={handleForgotPin}
            onRecoveryComplete={handleRecoveryComplete}
            onRecoveryBack={handleRecoveryBack}
            currentUserEmail={currentUserEmail}
            setCurrentUserEmail={setCurrentUserEmail}
          />
        )
      case 'battery-dead':
        return (
          <BatteryDeadScreen 
            language={phoneData.language}
            onHaptic={triggerHapticFeedback}
          />
        )
      default:
        return <BootScreen onComplete={() => handleStateChange('location-check')} onHaptic={triggerHapticFeedback} />
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-0 m-0 overflow-hidden">
      <ServerStatus />
      <div className="w-full max-w-sm mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 relative">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full z-50"></div>
        <div className="w-full h-screen max-h-screen overflow-hidden relative">
          {renderCurrentScreen()}
        </div>
      </div>
    </div>
  )
}