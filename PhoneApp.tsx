'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'
import NetworkInterface from './NetworkInterface'

interface SettingsInterfaceProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  onNetworkConnect: (networkId: string) => void
  connectedNetwork: string | null
}

interface SettingItem {
  id: string
  title: string
  subtitle: string
  icon: string
  type: 'toggle' | 'navigation' | 'info'
  value?: boolean
  badge?: string
}

export default function SettingsInterface({ 
  language, 
  onBack, 
  onHaptic, 
  onNetworkConnect, 
  connectedNetwork 
}: SettingsInterfaceProps): JSX.Element {
  const [currentView, setCurrentView] = useState<'main' | 'network'>('main')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [settings, setSettings] = useState<SettingItem[]>([])
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.settings-container', 'slideInRight')
    
    // Initialize settings with translations
    setSettings([
      {
        id: 'network',
        title: t.networkTitle,
        subtitle: connectedNetwork ? `${t.connected} to network` : t.noNetworkAccess,
        icon: '📶',
        type: 'navigation',
        badge: connectedNetwork ? t.connected : t.disconnected
      },
      {
        id: 'wifi',
        title: 'Wi-Fi',
        subtitle: 'Manage wireless connections',
        icon: '📡',
        type: 'toggle',
        value: !!connectedNetwork
      },
      {
        id: 'bluetooth',
        title: 'Bluetooth',
        subtitle: 'Connect to nearby devices',
        icon: '📘',
        type: 'toggle',
        value: false
      },
      {
        id: 'display',
        title: 'Display & Brightness',
        subtitle: 'Screen settings and appearance',
        icon: '🌞',
        type: 'navigation'
      },
      {
        id: 'sound',
        title: 'Sound & Haptics',
        subtitle: 'Ringtones, alerts, and vibration',
        icon: '🔊',
        type: 'navigation'
      },
      {
        id: 'battery',
        title: 'Battery',
        subtitle: 'Battery usage and optimization',
        icon: '🔋',
        type: 'navigation',
        badge: '100%'
      },
      {
        id: 'storage',
        title: 'Storage',
        subtitle: 'Manage device storage',
        icon: '💾',
        type: 'navigation',
        badge: '64GB'
      },
      {
        id: 'security',
        title: 'Security & Privacy',
        subtitle: 'PIN, fingerprint, and permissions',
        icon: '🔐',
        type: 'navigation'
      },
      {
        id: 'language',
        title: 'Language & Region',
        subtitle: `Current: ${language}`,
        icon: '🌐',
        type: 'navigation'
      },
      {
        id: 'apps',
        title: 'App Management',
        subtitle: 'Installed apps and permissions',
        icon: '📱',
        type: 'navigation'
      },
      {
        id: 'updates',
        title: 'System Updates',
        subtitle: 'AIdroid OS updates',
        icon: '⬇️',
        type: 'navigation',
        badge: 'Up to date'
      },
      {
        id: 'about',
        title: 'About AIdroid',
        subtitle: 'System information and version',
        icon: 'ℹ️',
        type: 'info'
      }
    ])
  }, [language, connectedNetwork, t])

  const handleSettingClick = (setting: SettingItem): void => {
    onHaptic(50)
    
    if (setting.id === 'network') {
      setCurrentView('network')
      animate('.network-view', 'slideInRight')
    } else if (setting.type === 'toggle') {
      toggleSetting(setting.id)
    } else {
      // For other settings, just provide haptic feedback
      animate(`.setting-${setting.id}`, 'pulse')
    }
  }

  const toggleSetting = (settingId: string): void => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, value: !setting.value }
        : setting
    ))
    animate(`.setting-${settingId}`, 'pulse')
  }

  const handleBackToSettings = (): void => {
    onHaptic(30)
    setCurrentView('main')
    animate('.settings-main', 'slideInLeft')
  }

  const getBadgeColor = (badge: string): string => {
    if (badge === t.connected || badge === 'Up to date') return 'bg-green-500'
    if (badge === t.disconnected) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const renderMainSettings = (): JSX.Element => (
    <div className="settings-main h-full">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={onBack}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">{t.settingsTitle}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            🔍
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            ⋮
          </Button>
        </div>
      </div>

      {/* Settings List */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="divide-y divide-gray-100">
          {settings.map((setting, index) => (
            <div
              key={setting.id}
              className={`setting-${setting.id} p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200`}
              onClick={() => handleSettingClick(setting)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{setting.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{setting.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{setting.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {setting.badge && (
                    <Badge className={`${getBadgeColor(setting.badge)} text-white text-xs`}>
                      {setting.badge}
                    </Badge>
                  )}
                  
                  {setting.type === 'toggle' ? (
                    <Switch
                      checked={setting.value || false}
                      onCheckedChange={() => toggleSetting(setting.id)}
                    />
                  ) : setting.type === 'navigation' ? (
                    <span className="text-gray-400 text-lg">→</span>
                  ) : (
                    <span className="text-blue-500 text-lg">ℹ️</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="bg-white border-t p-4">
        <p className="text-xs text-gray-500 text-center">
          AIdroid OS • Version 1.0 • Powered by OharaAI
        </p>
      </div>
    </div>
  )

  const renderNetworkView = (): JSX.Element => (
    <div className="network-view h-full">
      <NetworkInterface
        language={language}
        onBack={handleBackToSettings}
        onHaptic={onHaptic}
        onNetworkConnect={onNetworkConnect}
        connectedNetwork={connectedNetwork}
      />
    </div>
  )

  return (
    <div className={`settings-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {currentView === 'main' ? renderMainSettings() : renderNetworkView()}
    </div>
  )
}