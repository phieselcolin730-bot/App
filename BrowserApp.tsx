'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'
import { usePhoneStore } from '@/lib/phoneStore'
import type { AppType } from './PhoneInterface'

interface HomeScreenProps {
  phoneData: {
    language: string
    pin: string
    connectedNetwork: string | null
    weatherClockDisabled?: boolean
  }
  onAppSwitch: (app: AppType) => void
  onHaptic: (duration?: number) => void
}

const getSystemApps = (t: any) => [
  {
    id: 'whatsapp',
    name: t.appNames.whatsapp,
    icon: '💬',
    color: 'bg-green-500',
    type: 'whatsapp' as AppType,
    requiresNetwork: false
  },
  {
    id: 'playstore',
    name: t.appNames.playstore,
    icon: '🛍️',
    color: 'bg-blue-500',
    type: 'playstore' as AppType,
    requiresNetwork: true
  },
  {
    id: 'camera',
    name: t.appNames.camera,
    icon: '📷',
    color: 'bg-gray-700',
    type: 'camera' as AppType,
    requiresNetwork: false
  },
  {
    id: 'gallery',
    name: t.appNames.gallery,
    icon: '🖼️',
    color: 'bg-purple-500',
    type: 'gallery' as AppType,
    requiresNetwork: false
  },
  {
    id: 'settings',
    name: t.appNames.settings,
    icon: '⚙️',
    color: 'bg-gray-600',
    type: 'settings' as AppType,
    requiresNetwork: false
  },
  {
    id: 'calendar',
    name: t.appNames.calendar,
    icon: '📅',
    color: 'bg-red-500',
    type: 'calendar' as AppType,
    requiresNetwork: true
  },
  {
    id: 'music',
    name: t.appNames.music,
    icon: '🎵',
    color: 'bg-orange-500',
    type: 'music' as AppType,
    requiresNetwork: true
  },
  {
    id: 'maps',
    name: t.appNames.maps,
    icon: '🗺️',
    color: 'bg-green-600',
    type: 'maps' as AppType,
    requiresNetwork: true
  },
  {
    id: 'weather',
    name: t.appNames.weather,
    icon: '🌤️',
    color: 'bg-cyan-500',
    type: 'weather' as AppType,
    requiresNetwork: true
  },
  {
    id: 'calculator',
    name: t.appNames.calculator,
    icon: '🧮',
    color: 'bg-indigo-500',
    type: 'calculator' as AppType,
    requiresNetwork: false
  },
  {
    id: 'contacts',
    name: t.appNames.contacts,
    icon: '👥',
    color: 'bg-blue-600',
    type: 'contacts' as AppType,
    requiresNetwork: false
  },
  {
    id: 'phone',
    name: t.appNames.phone,
    icon: '📞',
    color: 'bg-green-600',
    type: 'phone' as AppType,
    requiresNetwork: false
  },
  {
    id: 'browser',
    name: t.appNames.browser,
    icon: '🌐',
    color: 'bg-purple-600',
    type: 'browser' as AppType,
    requiresNetwork: true
  },
  {
    id: 'clock',
    name: t.appNames.clock,
    icon: '⏰',
    color: 'bg-yellow-500',
    type: 'clock' as AppType,
    requiresNetwork: false
  }
]

// Map app IDs to AppType values
const getAppTypeFromId = (id: string): AppType => {
  const appMapping: Record<string, AppType> = {
    // Games
    'roblox': 'roblox' as AppType,
    'geometrydash': 'geometrydash' as AppType,
    'amongus': 'amongus' as AppType,
    'flappybird': 'flappybird' as AppType,
    'tetris': 'tetris' as AppType,
    'snake': 'snake' as AppType,
    // Apps
    'phone': 'phone' as AppType,
    'browser': 'browser' as AppType,
    'tiktok': 'home' as AppType, // TikTok doesn't have a specific app type yet
    'netflix': 'home' as AppType // Netflix doesn't have a specific app type yet
  }
  return appMapping[id] || 'home' as AppType
}

export default function HomeScreen({ phoneData, onAppSwitch, onHaptic }: HomeScreenProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [selectedApp, setSelectedApp] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [touchStartX, setTouchStartX] = useState<number>(0)
  const [touchCurrentX, setTouchCurrentX] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  
  const { installedApps } = usePhoneStore()
  const t = getTranslation(phoneData.language)
  let systemApps = getSystemApps(t)
  
  // Filter out weather and clock apps if disabled
  if (phoneData.weatherClockDisabled) {
    systemApps = systemApps.filter(app => app.id !== 'weather' && app.id !== 'clock')
  }

  // Put INSTALLED APPS FIRST (page 1), then system apps (page 2)
  const installedAppsList = installedApps.map(app => ({
    id: app.id,
    name: app.name,
    icon: app.icon,
    color: app.type === 'game' ? 'bg-purple-600' : 'bg-indigo-600',
    type: getAppTypeFromId(app.id),
    requiresNetwork: app.type === 'game' ? true : false
  }))
  
  const allApps = [
    ...installedAppsList,  // INSTALLED APPS FIRST!
    ...systemApps         // System apps second
  ]

  // Split apps into pages (12 apps per page)
  const appsPerPage = 12
  const totalPages = Math.ceil(allApps.length / appsPerPage)
  const page1Apps = allApps.slice(0, appsPerPage)
  const page2Apps = allApps.slice(appsPerPage, appsPerPage * 2)
  const currentApps = currentPage === 0 ? page1Apps : page2Apps

  useEffect(() => {
    setIsVisible(true)
    animate('.home-container', 'fadeInUp')
    
    // Stagger app icon animations
    currentApps.forEach((_, index) => {
      setTimeout(() => {
        animate(`.app-icon-${index}`, 'zoomIn')
      }, index * 100)
    })
    
    // Handle WhatsApp to Contacts redirection
    const handleOpenContacts = (): void => {
      console.log('Opening Contacts from WhatsApp maintenance redirect')
      const contactsApp = allApps.find(app => app.type === 'contacts')
      if (contactsApp) {
        onHaptic(100) // Strong haptic for important redirect
        setSelectedApp(contactsApp.id)
        animate('.contacts-redirect', 'pulse')
        setTimeout(() => {
          onAppSwitch('contacts')
          setSelectedApp('')
        }, 300)
      }
    }
    
    // Listen for contacts redirect event
    document.addEventListener('openContacts', handleOpenContacts)
    
    // Cleanup
    return () => {
      document.removeEventListener('openContacts', handleOpenContacts)
    }
  }, [currentPage, allApps, onAppSwitch, onHaptic])

  const handleAppClick = (app: typeof allApps[0]): void => {
    console.log(`APP CLICKED: ${app.name} (${app.type})`)
    onHaptic(50)
    setSelectedApp(app.id)
    
    // Check network requirement
    if (app.requiresNetwork && !phoneData.connectedNetwork && app.type !== 'contacts') {
      animate(`.app-icon-${currentApps.indexOf(app)}`, 'shake')
      setTimeout(() => setSelectedApp(''), 1000)
      return
    }
    
    // OPTIMIZED: Immediate single-click app opening
    if (app.type !== 'home') {
      // Launch app immediately with single click
      animate(`.app-icon-${currentApps.indexOf(app)}`, 'pulse')
      onAppSwitch(app.type) // Immediate launch, no delay
      setTimeout(() => setSelectedApp(''), 200) // Quick visual feedback reset
    } else {
      animate(`.app-icon-${currentApps.indexOf(app)}`, 'rubberBand')
      setTimeout(() => setSelectedApp(''), 500)
    }
  }

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent): void => {
    setTouchStartX(e.touches[0].clientX)
    setTouchCurrentX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!isDragging) return
    setTouchCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = (): void => {
    if (!isDragging) return
    
    const deltaX = touchCurrentX - touchStartX
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      onHaptic(30)
      
      if (deltaX > 0 && currentPage > 0) {
        // Swipe right - previous page
        setCurrentPage(currentPage - 1)
        animate('.app-grid', 'slideInLeft')
      } else if (deltaX < 0 && currentPage < totalPages - 1) {
        // Swipe left - next page
        setCurrentPage(currentPage + 1)
        animate('.app-grid', 'slideInRight')
      }
    }
    
    setIsDragging(false)
    setTouchStartX(0)
    setTouchCurrentX(0)
  }

  // FIXED button handlers - Both buttons work exactly the same way
  const handlePrevious = (): void => {
    console.log('PREVIOUS BUTTON CLICKED!')
    onHaptic(50)
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      animate('.app-grid', 'slideInLeft')
    }
  }

  const handleNext = (): void => {
    console.log('NEXT BUTTON CLICKED!')
    onHaptic(50)
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      animate('.app-grid', 'slideInRight')
    }
  }

  const handleNavigationClick = (direction: 'prev' | 'next' | number): void => {
    if (direction === 'prev') {
      handlePrevious()
    } else if (direction === 'next') {
      handleNext()  
    } else if (typeof direction === 'number') {
      // Jump to specific page
      onHaptic(50)
      setCurrentPage(direction)
      animate('.app-grid', direction > currentPage ? 'slideInRight' : 'slideInLeft')
    }
  }

  // SIMPLIFIED mouse handlers - NO CONFLICTS with buttons
  const handleAppGridMouseDown = (e: React.MouseEvent): void => {
    // ONLY allow dragging on the app grid area itself, not buttons
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return
    }
    setTouchStartX(e.clientX)
    setTouchCurrentX(e.clientX) 
    setIsDragging(true)
  }

  const handleAppGridMouseMove = (e: React.MouseEvent): void => {
    if (!isDragging) return
    setTouchCurrentX(e.clientX)
  }

  const handleAppGridMouseUp = (): void => {
    if (!isDragging) return
    
    const deltaX = touchCurrentX - touchStartX
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentPage > 0) {
        handlePrevious()
      } else if (deltaX < 0 && currentPage < totalPages - 1) {
        handleNext()
      }
    }
    
    setIsDragging(false)
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background wallpaper effect */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400/5 rounded-full animate-pulse"></div>
      </div>

      {/* Welcome message */}
      <div className={`home-container pt-8 pb-4 px-6 text-center ${isVisible ? 'animate__animated' : ''}`}>
        <h1 className="text-xl font-bold text-white mb-1">{t.welcomeTitle}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <p className="text-blue-200">{t.languageLabel}: {phoneData.language}</p>
          <Badge className={phoneData.connectedNetwork ? 'bg-green-500' : 'bg-red-500'}>
            {phoneData.connectedNetwork ? t.connected : t.disconnected}
          </Badge>
        </div>
        
        {/* SUPER OBVIOUS NAVIGATION BUTTONS */}
        {totalPages > 1 && (
          <div className="nav-button-area flex items-center justify-center mt-4 space-x-6">
            {/* HUGE PREVIOUS PAGE BUTTON */}
            <button
              type="button"
              className={`w-16 h-16 bg-red-600 hover:bg-red-500 text-white font-bold text-2xl rounded-full transition-all duration-200 shadow-2xl ${
                currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('BIG PREV BUTTON CLICKED!')
                handlePrevious()
              }}
              disabled={currentPage === 0}
            >
              ‹
            </button>

            {/* PAGE INDICATOR */}
            <div className="bg-black/30 px-4 py-2 rounded-full">
              <span className="text-white font-semibold text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>

            {/* HUGE NEXT PAGE BUTTON */}
            <button
              type="button"
              className={`w-16 h-16 bg-red-600 hover:bg-red-500 text-white font-bold text-2xl rounded-full transition-all duration-200 shadow-2xl ${
                currentPage >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('BIG NEXT BUTTON CLICKED!')
                handleNext()
              }}
              disabled={currentPage >= totalPages - 1}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* App Grid with Swipe Support */}
      <div 
        className="flex-1 px-6 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleAppGridMouseDown}
        onMouseMove={handleAppGridMouseMove}
        onMouseUp={handleAppGridMouseUp}
        style={{ userSelect: 'none' }}
      >
        <div className="app-grid grid grid-cols-3 gap-6 max-w-xs mx-auto">
          {currentApps.map((app, index) => (
            <Button
              key={`${app.id}-${currentPage}`}
              variant="ghost"
              className={`app-icon-${index} h-20 w-20 p-0 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-150 hover:scale-105 ${
                selectedApp === app.id ? 'scale-95' : ''
              } ${
                app.requiresNetwork && !phoneData.connectedNetwork && app.type !== 'contacts' 
                  ? 'opacity-60' : ''
              } ${
                app.type === 'contacts' ? 'contacts-redirect' : ''
              }`}
              onClick={(e) => {
                e.preventDefault() // Prevent any default behavior
                e.stopPropagation() // Stop event bubbling
                handleAppClick(app) // SINGLE CLICK = IMMEDIATE LAUNCH
              }}
              onTouchEnd={(e) => {
                e.preventDefault() // Prevent double-tap zoom on mobile
              }}
            >
              <div className="flex flex-col items-center relative">
                <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center mb-1 shadow-lg`}>
                  <span className="text-2xl">{app.icon}</span>
                  {app.requiresNetwork && !phoneData.connectedNetwork && app.type !== 'contacts' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">!</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-white font-medium text-center leading-tight">{app.name}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {/* ADDITIONAL BIG NAVIGATION BUTTONS */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-8">
            <button
              type="button"
              className={`px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-200 ${
                currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('TEXT PREV BUTTON CLICKED!')
                handlePrevious()
              }}
              disabled={currentPage === 0}
            >
              ← PREVIOUS
            </button>
            
            <button
              type="button"
              className={`px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-200 ${
                currentPage >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('TEXT NEXT BUTTON CLICKED!')
                handleNext()
              }}
              disabled={currentPage >= totalPages - 1}
            >
              NEXT →
            </button>
          </div>
        )}
      </div>

      {/* Bottom dock - Quick Access Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="flex justify-center items-center py-4 space-x-8">
          {/* Phone App */}
          <Button
            variant="ghost"
            size="lg"
            className="w-14 h-14 bg-green-600/20 hover:bg-green-600/40 border border-green-400/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              onHaptic(50)
              console.log('Quick Phone app launch!')
              animate('.dock-phone', 'pulse')
              onAppSwitch('phone')
            }}
          >
            <span className="text-2xl dock-phone">📞</span>
          </Button>
          
          {/* Contacts App */}
          <Button
            variant="ghost"
            size="lg"
            className="w-14 h-14 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              onHaptic(50)
              console.log('Quick Contacts app launch!')
              animate('.dock-contacts', 'pulse')
              onAppSwitch('contacts')
            }}
          >
            <span className="text-2xl dock-contacts">👥</span>
          </Button>
          
          {/* Browser App */}
          <Button
            variant="ghost"
            size="lg"
            className="w-14 h-14 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              onHaptic(50)
              console.log('Quick Browser app launch!')
              animate('.dock-browser', 'pulse')
              
              // Check network requirement for browser
              if (!phoneData.connectedNetwork) {
                animate('.dock-browser', 'shake')
                return
              }
              
              onAppSwitch('browser')
            }}
          >
            <span className="text-2xl dock-browser">🌐</span>
          </Button>
          
          {/* Games (Play Store) */}
          <Button
            variant="ghost"
            size="lg"
            className="w-14 h-14 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-400/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => {
              onHaptic(50)
              console.log('Quick Games launch!')
              animate('.dock-games', 'pulse')
              
              // Check network requirement for Play Store
              if (!phoneData.connectedNetwork) {
                animate('.dock-games', 'shake')
                return
              }
              
              onAppSwitch('playstore')
              // Auto-filter to games category
              setTimeout(() => {
                document.dispatchEvent(new CustomEvent('filterGames'))
              }, 500)
            }}
          >
            <span className="text-2xl dock-games">🎮</span>
          </Button>
        </div>
      </div>
    </div>
  )
}