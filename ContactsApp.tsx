'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { getTranslation } from '@/lib/translations'
import WhatsAppInterface from './WhatsAppInterface'
import PlayStoreInterface from './PlayStoreInterface'
import HomeScreen from './HomeScreen'
import SettingsInterface from './SettingsInterface'
import ContactsApp from './apps/ContactsApp'
import PhoneApp from './apps/PhoneApp'
import BrowserApp from './apps/BrowserApp'
import CameraApp from './apps/CameraApp'
import CalculatorApp from './apps/CalculatorApp'
import WeatherApp from './apps/WeatherApp'
import ClockApp from './apps/ClockApp'
import MessagesApp from './apps/MessagesApp'
import MusicApp from './apps/MusicApp'
import GalleryApp from './apps/GalleryApp'
import MapsApp from './apps/MapsApp'
import CalendarApp from './apps/CalendarApp'
import CallInterface from './CallInterface'
import PinAuthScreen from './PinAuthScreen'
import PinRecoveryScreen from './PinRecoveryScreen'
import AccountSetup from './AccountSetup'
import PinSetup from './PinSetup'
import RobloxGame from './games/RobloxGame'
import GeometryDashGame from './games/GeometryDashGame'
import AmongUsGame from './games/AmongUsGame'
import FlappyBirdGame from './games/FlappyBirdGame'
import TetrisGame from './games/TetrisGame'
import SnakeGame from './games/SnakeGame'
import { useAuthStore } from '@/lib/authStore'

interface PhoneInterfaceProps {
  phoneData: {
    language: string
    pin: string
    connectedNetwork: string | null
    batteryLevel: number
    isBatteryDead: boolean
  }
  onHaptic: (duration?: number) => void
  onNetworkConnect: (networkId: string) => void
  onAuthSuccess: () => void
  onForgotPin: () => void
  onRecoveryComplete: () => void
  onRecoveryBack: () => void
  currentUserEmail: string
  setCurrentUserEmail: (email: string) => void
}

export type AppType = 'home' | 'whatsapp' | 'playstore' | 'settings' | 'contacts' | 'phone' | 'browser' | 'camera' | 'calculator' | 'weather' | 'clock' | 'gallery' | 'music' | 'maps' | 'calendar' | 'messages' | 'roblox' | 'geometrydash' | 'amongus' | 'flappybird' | 'tetris' | 'snake'

type AuthOverlayMode = 'none' | 'account-setup' | 'pin-setup' | 'pin-auth' | 'pin-recovery'

export default function PhoneInterface({ 
  phoneData, 
  onHaptic, 
  onNetworkConnect, 
  onAuthSuccess,
  onForgotPin,
  onRecoveryComplete,
  onRecoveryBack,
  currentUserEmail,
  setCurrentUserEmail
}: PhoneInterfaceProps): JSX.Element {
  const [currentApp, setCurrentApp] = useState<AppType>('home')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [showLongPressMenu, setShowLongPressMenu] = useState<boolean>(false)
  const [isInCall, setIsInCall] = useState<boolean>(false)
  const [callContactName, setCallContactName] = useState<string>('')
  const [callContactAvatar, setCallContactAvatar] = useState<string>('')
  const [authOverlayMode, setAuthOverlayMode] = useState<AuthOverlayMode>('none')
  const [newAccountEmail, setNewAccountEmail] = useState<string>('')
  
  const { currentUser, accounts, isAuthenticated } = useAuthStore()
  const t = getTranslation(phoneData.language)

  useEffect(() => {
    setIsVisible(true)
    animate('.phone-interface', 'fadeIn')

    // Update time every minute
    const updateTime = (): void => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 60000)

    return () => {
      clearInterval(timeInterval)
    }
  }, [])

  // Separate useEffect for authentication checking - CRITICAL FIX
  useEffect(() => {
    // Always show HOME SCREEN first, then check authentication after delay
    console.log('🔐 AUTH CHECK:', { 
      accountsCount: accounts.length, 
      isAuthenticated, 
      currentUser: currentUser?.email,
      authOverlayMode: authOverlayMode
    })

    const authCheckTimer = setTimeout(() => {
      console.log('🔐 TRIGGERING AUTH OVERLAY CHECK')
      
      if (accounts.length === 0) {
        // No accounts exist, show account setup overlay
        console.log('🔐 No accounts found - showing account setup')
        setAuthOverlayMode('account-setup')
      } else if (!isAuthenticated) {
        // Accounts exist but not authenticated, show PIN auth overlay
        const firstAccount = accounts[0]
        console.log('🔐 Account found but not authenticated - showing PIN auth for:', firstAccount.email)
        setCurrentUserEmail(firstAccount.email)
        setAuthOverlayMode('pin-auth')
      } else {
        console.log('🔐 User already authenticated:', currentUser?.email)
        setAuthOverlayMode('none')
      }
    }, 2000) // 2 seconds delay to let users see the HOME SCREEN first

    return () => {
      clearTimeout(authCheckTimer)
    }
  }, [accounts, isAuthenticated, currentUser, setCurrentUserEmail])

  const handleAppSwitch = (app: AppType): void => {
    onHaptic(50)
    setCurrentApp(app)
    animate('.app-content', 'slideInRight')
  }
  
  const handleLongPressStart = (): void => {
    const timer = setTimeout(() => {
      onHaptic(100)
      setShowLongPressMenu(true)
      animate('.long-press-menu', 'zoomIn')
    }, 800) // 800ms long press
    setLongPressTimer(timer)
  }
  
  const handleLongPressEnd = (): void => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }
  
  const handleLongPressMenuClose = (): void => {
    setShowLongPressMenu(false)
    animate('.long-press-menu', 'zoomOut')
  }
  
  const handleSettingsAccess = (): void => {
    onHaptic(50)
    setCurrentApp('settings')
    setShowLongPressMenu(false)
    animate('.app-content', 'slideInRight')
  }

  const handleBackToHome = (): void => {
    onHaptic(30)
    setCurrentApp('home')
    animate('.app-content', 'slideInLeft')
  }

  const handleStartCall = (contactName: string, contactAvatar: string): void => {
    setCallContactName(contactName)
    setCallContactAvatar(contactAvatar)
    setIsInCall(true)
    onHaptic(100)
    animate('.call-interface', 'slideInUp')
  }

  const handleEndCall = (): void => {
    setIsInCall(false)
    setCallContactName('')
    setCallContactAvatar('')
    onHaptic(50)
    animate('.phone-content', 'slideInLeft')
  }

  // Authentication overlay handlers
  const handleAccountSetup = (email: string): void => {
    setNewAccountEmail(email)
    setAuthOverlayMode('pin-setup')
  }

  const handlePinSetup = (pin: string): void => {
    setAuthOverlayMode('none')
    onAuthSuccess()
  }

  const handleAuthSuccess = (): void => {
    setAuthOverlayMode('none')
    onAuthSuccess()
  }

  const handleForgotPin = (): void => {
    setAuthOverlayMode('pin-recovery')
  }

  const handleRecoveryComplete = (): void => {
    setAuthOverlayMode('pin-auth')
  }

  const handleRecoveryBack = (): void => {
    setAuthOverlayMode('pin-auth')
  }

  return (
    <div 
      className={`phone-interface h-full w-full bg-black relative ${isVisible ? 'animate__animated' : ''}`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center text-white text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 border border-white/60 rounded-sm relative">
            <div 
              className={`h-1 rounded-sm m-0.5 transition-all duration-300 ${
                phoneData.batteryLevel > 20 ? 'bg-green-400' : 
                phoneData.batteryLevel > 10 ? 'bg-yellow-400' : 
                'bg-red-500'
              }`}
              style={{ width: `${Math.max((phoneData.batteryLevel / 100) * 12, 2)}px` }}
            ></div>
          </div>
          <span className={`text-xs ${
            phoneData.batteryLevel > 20 ? 'text-white/80' : 
            phoneData.batteryLevel > 10 ? 'text-yellow-400' : 
            'text-red-400 animate-pulse'
          }`}>
            {phoneData.batteryLevel}%
          </span>
        </div>
        <div className="font-semibold">{currentTime}</div>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white/80 rounded-full"></div>
            <div className="w-1 h-3 bg-white/80 rounded-full"></div>
            <div className="w-1 h-3 bg-white/60 rounded-full"></div>
            <div className="w-1 h-3 bg-white/40 rounded-full"></div>
          </div>
          <span className="ml-1">
            {phoneData.connectedNetwork ? '📶' : '📵'}
          </span>
          <span className="text-xs">
            {phoneData.connectedNetwork ? 'Connected' : 'No Network'}
          </span>
        </div>
      </div>

      {/* App Content */}
      <div className="app-content pt-12 h-full">
        {currentApp === 'home' && (
          <HomeScreen 
            phoneData={phoneData}
            onAppSwitch={handleAppSwitch}
            onHaptic={onHaptic}
          />
        )}
        {currentApp === 'whatsapp' && (
          <WhatsAppInterface 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
          />
        )}
        {currentApp === 'playstore' && (
          <PlayStoreInterface 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
          />
        )}
        {currentApp === 'settings' && (
          <SettingsInterface 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            onNetworkConnect={onNetworkConnect}
            connectedNetwork={phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'contacts' && (
          <ContactsApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'phone' && (
          <PhoneApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
            onStartCall={handleStartCall}
          />
        )}
        {currentApp === 'browser' && (
          <BrowserApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'camera' && (
          <CameraApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'calculator' && (
          <CalculatorApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'weather' && (
          <WeatherApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'clock' && (
          <ClockApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'messages' && (
          <MessagesApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'music' && (
          <MusicApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'gallery' && (
          <GalleryApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'maps' && (
          <MapsApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'calendar' && (
          <CalendarApp 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'roblox' && (
          <RobloxGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'geometrydash' && (
          <GeometryDashGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'amongus' && (
          <AmongUsGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'flappybird' && (
          <FlappyBirdGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'tetris' && (
          <TetrisGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
        {currentApp === 'snake' && (
          <SnakeGame 
            language={phoneData.language}
            onBack={handleBackToHome}
            onHaptic={onHaptic}
            isNetworkConnected={!!phoneData.connectedNetwork}
          />
        )}
      </div>
      
      {/* Call Interface Overlay */}
      {isInCall && (
        <div className="absolute inset-0 z-70">
          <CallInterface
            language={phoneData.language}
            contactName={callContactName}
            contactAvatar={callContactAvatar}
            onEnd={handleEndCall}
            onHaptic={onHaptic}
          />
        </div>
      )}
      
      {/* Authentication Overlay */}
      {authOverlayMode !== 'none' && (
        <div className="absolute inset-0 z-80 bg-black/60 backdrop-blur-md">
          <div className="h-full w-full relative">
            {authOverlayMode === 'account-setup' && (
              <AccountSetup
                language={phoneData.language}
                onAccountComplete={handleAccountSetup}
                onHaptic={onHaptic}
              />
            )}
            {authOverlayMode === 'pin-setup' && (
              <PinSetup 
                language={phoneData.language}
                userEmail={newAccountEmail}
                onPinComplete={handlePinSetup}
                onHaptic={onHaptic}
              />
            )}
            {authOverlayMode === 'pin-auth' && (
              <PinAuthScreen
                language={phoneData.language}
                userEmail={currentUserEmail}
                onAuthSuccess={handleAuthSuccess}
                onForgotPin={handleForgotPin}
                onHaptic={onHaptic}
              />
            )}
            {authOverlayMode === 'pin-recovery' && (
              <PinRecoveryScreen
                language={phoneData.language}
                userEmail={currentUserEmail}
                onRecoveryComplete={handleRecoveryComplete}
                onBack={handleRecoveryBack}
                onHaptic={onHaptic}
              />
            )}
          </div>
        </div>
      )}

      {/* Long Press Menu */}
      {showLongPressMenu && (
        <div className="long-press-menu fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={handleLongPressMenuClose}>
          <div className="bg-white rounded-xl p-6 mx-4 min-w-64" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-center">Quick Access</h3>
            <div className="space-y-3">
              <button
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={handleSettingsAccess}
              >
                <span className="text-2xl">⚙️</span>
                <span className="font-medium">{t.settingsTitle}</span>
              </button>
              <button
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setCurrentApp('settings')
                  setShowLongPressMenu(false)
                }}
              >
                <span className="text-2xl">📶</span>
                <span className="font-medium">{t.networkTitle}</span>
              </button>
            </div>
            <button
              className="w-full mt-4 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
              onClick={handleLongPressMenuClose}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}