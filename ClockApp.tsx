'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface Network {
  id: string
  name: string
  strength: number
  secured: boolean
  connected: boolean
  type: 'wifi' | '5g' | '4g'
}

interface NetworkInterfaceProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  onNetworkConnect: (networkId: string) => void
  connectedNetwork: string | null
}

const AVAILABLE_NETWORKS: Network[] = [
  {
    id: 'freewifi',
    name: 'FreeWifi',
    strength: 4,
    secured: false,
    connected: false,
    type: 'wifi'
  },
  {
    id: 'home_wifi',
    name: 'Home_WiFi_5G',
    strength: 3,
    secured: true,
    connected: false,
    type: 'wifi'
  },
  {
    id: 'office_network',
    name: 'Office_Network',
    strength: 2,
    secured: true,
    connected: false,
    type: 'wifi'
  },
  {
    id: 'mobile_5g',
    name: 'Carrier 5G',
    strength: 4,
    secured: false,
    connected: false,
    type: '5g'
  },
  {
    id: 'mobile_4g',
    name: 'Carrier 4G',
    strength: 3,
    secured: false,
    connected: false,
    type: '4g'
  },
  {
    id: 'neighbor_wifi',
    name: 'NeighborWiFi',
    strength: 1,
    secured: true,
    connected: false,
    type: 'wifi'
  },
  {
    id: 'public_wifi',
    name: 'Public_Library',
    strength: 2,
    secured: false,
    connected: false,
    type: 'wifi'
  },
  {
    id: 'cafe_wifi',
    name: 'CoffeeShop_Guest',
    strength: 3,
    secured: true,
    connected: false,
    type: 'wifi'
  }
]

export default function NetworkInterface({ 
  language, 
  onBack, 
  onHaptic, 
  onNetworkConnect, 
  connectedNetwork 
}: NetworkInterfaceProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [networks, setNetworks] = useState<Network[]>(AVAILABLE_NETWORKS)
  const [connecting, setConnecting] = useState<string | null>(null)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.network-container', 'slideInRight')
  }, [])

  useEffect(() => {
    // Update network connection status
    setNetworks(prev => prev.map(network => ({
      ...network,
      connected: network.id === connectedNetwork
    })))
  }, [connectedNetwork])

  const getStrengthBars = (strength: number): string => {
    return '📶'.repeat(strength) + '📶'.repeat(4 - strength).replace(/📶/g, '📵')
  }

  const getNetworkIcon = (network: Network): string => {
    switch (network.type) {
      case 'wifi':
        return network.secured ? '🔒📶' : '📶'
      case '5g':
        return '📡'
      case '4g':
        return '📱'
      default:
        return '📶'
    }
  }

  const handleNetworkConnect = (network: Network): void => {
    if (network.connected) return
    
    onHaptic(50)
    setConnecting(network.id)
    
    // Simulate connection process
    setTimeout(() => {
      onNetworkConnect(network.id)
      setConnecting(null)
      animate('.network-connected', 'bounceIn')
    }, 2000)
  }

  const handleDisconnect = (): void => {
    onHaptic(50)
    onNetworkConnect('')
  }

  return (
    <div className={`network-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={onBack}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">{t.networkTitle}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            🔄
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            ⋮
          </Button>
        </div>
      </div>

      {/* Current Connection Status */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{t.connectToNetwork}</h3>
            <p className="text-sm text-gray-600">{t.networkSubtitle}</p>
          </div>
          {connectedNetwork && (
            <Badge className="network-connected bg-green-500 text-white">
              {t.connected}
            </Badge>
          )}
        </div>
        
        {connectedNetwork && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getNetworkIcon(networks.find(n => n.id === connectedNetwork) || networks[0])}
                </span>
                <div>
                  <p className="font-medium text-green-800">
                    {networks.find(n => n.id === connectedNetwork)?.name}
                  </p>
                  <p className="text-xs text-green-600">{t.connected}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Available Networks */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">{t.selectNetwork}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-2">
          {networks.map((network, index) => (
            <div
              key={network.id}
              className={`network-item-${index} p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                network.connected ? 'border-green-400 bg-green-50' : ''
              }`}
              onClick={() => handleNetworkConnect(network)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getNetworkIcon(network)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{network.name}</h4>
                      {network.secured && <span className="text-yellow-500 text-xs">🔒</span>}
                      {network.connected && <span className="text-green-500 text-xs">✓</span>}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{getStrengthBars(network.strength)}</span>
                      <Badge 
                        variant={network.type === '5g' ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {network.type.toUpperCase()}
                      </Badge>
                      {network.connected && (
                        <Badge className="bg-green-500 text-white text-xs">
                          {t.connected}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {connecting === network.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600">Connecting...</span>
                  </div>
                ) : network.connected ? (
                  <span className="text-green-500 text-lg">✓</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer Info */}
      <div className="bg-gray-50 p-4 border-t">
        <p className="text-xs text-gray-500 text-center">
          {!connectedNetwork ? t.noNetworkAccess : `${t.connected} to ${networks.find(n => n.connected)?.name}`}
        </p>
      </div>
    </div>
  )
}