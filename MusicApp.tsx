'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { usePhoneStore, type InstalledApp } from '@/lib/phoneStore'

interface App {
  id: string
  name: string
  icon: string
  developer: string
  rating: number
  downloads: string
  size: string
  category: string
  price: string
  description: string
  screenshots: string[]
  installed: boolean
}

interface PlayStoreInterfaceProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
}

const FEATURED_APPS: App[] = [
  // GAMES
  {
    id: 'roblox',
    name: 'RoboBlox',
    icon: '🏗️',
    developer: 'OharaAI Studios',
    rating: 4.8,
    downloads: '2B+',
    size: '45 MB',
    category: 'Games',
    price: 'Free',
    description: 'Build and explore in a 3D block world! Create amazing structures and unleash your creativity.',
    screenshots: ['🧱', '🏗️', '🌍'],
    installed: false
  },
  {
    id: 'geometrydash',
    name: 'Geometry Dash',
    icon: '⚡',
    developer: 'RobTop Games',
    rating: 4.6,
    downloads: '500M+',
    size: '28 MB',
    category: 'Games',
    price: 'Free',
    description: 'Jump and fly through danger in this rhythm-based action platformer!',
    screenshots: ['⚡', '🟦', '🎵'],
    installed: false
  },
  {
    id: 'amongus',
    name: 'Among Us',
    icon: '👽',
    developer: 'InnerSloth LLC',
    rating: 4.4,
    downloads: '500M+',
    size: '67 MB',
    category: 'Games',
    price: 'Free',
    description: 'Play with 4-10 players online! Complete tasks and find the impostor among the crew.',
    screenshots: ['🚀', '🔧', '🗳️'],
    installed: false
  },
  {
    id: 'flappybird',
    name: 'Flappy Bird',
    icon: '🐦',
    developer: '.GEARS Studios',
    rating: 4.2,
    downloads: '100M+',
    size: '15 MB',
    category: 'Games',
    price: 'Free',
    description: 'The classic arcade game! Tap to fly and avoid the green pipes.',
    screenshots: ['🐦', '🌿', '⭐'],
    installed: false
  },
  {
    id: 'tetris',
    name: 'Tetris',
    icon: '🟦',
    developer: 'Tetris Holding',
    rating: 4.7,
    downloads: '200M+',
    size: '22 MB',
    category: 'Games',
    price: 'Free',
    description: 'The legendary puzzle game! Fit falling blocks and clear lines to score.',
    screenshots: ['🟦', '📱', '🏆'],
    installed: false
  },
  {
    id: 'snake',
    name: 'Snake Game',
    icon: '🐍',
    developer: 'Classic Games Co.',
    rating: 4.3,
    downloads: '150M+',
    size: '8 MB',
    category: 'Games',
    price: 'Free',
    description: 'The classic Snake game! Eat food, grow longer, and avoid hitting yourself.',
    screenshots: ['🐍', '🍎', '🏅'],
    installed: false
  },
  // APPS
  {
    id: '1',
    name: 'Instagram',
    icon: '📷',
    developer: 'Meta Platforms, Inc.',
    rating: 4.2,
    downloads: '5B+',
    size: '32 MB',
    category: 'Social',
    price: 'Free',
    description: 'Share photos and videos with friends and followers.',
    screenshots: ['📱', '📸', '🎥'],
    installed: false
  },
  {
    id: '2',
    name: 'TikTok',
    icon: '🎵',
    developer: 'TikTok Ltd.',
    rating: 4.4,
    downloads: '1B+',
    size: '89 MB',
    category: 'Entertainment',
    price: 'Free',
    description: 'Create and discover short videos with music.',
    screenshots: ['🎬', '🎭', '🎪'],
    installed: true
  },
  {
    id: '3',
    name: 'Spotify',
    icon: '🎧',
    developer: 'Spotify AB',
    rating: 4.3,
    downloads: '1B+',
    size: '52 MB',
    category: 'Music',
    price: 'Free',
    description: 'Music streaming with millions of songs.',
    screenshots: ['🎼', '🎤', '🎶'],
    installed: false
  },
  {
    id: '4',
    name: 'Uber',
    icon: '🚗',
    developer: 'Uber Technologies, Inc.',
    rating: 4.1,
    downloads: '500M+',
    size: '64 MB',
    category: 'Travel',
    price: 'Free',
    description: 'Request rides with the tap of a button.',
    screenshots: ['🗺️', '🚕', '📍'],
    installed: false
  },
  {
    id: '5',
    name: 'Discord',
    icon: '🎮',
    developer: 'Discord Inc.',
    rating: 4.0,
    downloads: '500M+',
    size: '45 MB',
    category: 'Communication',
    price: 'Free',
    description: 'Chat, voice, and video for gamers and communities.',
    screenshots: ['💬', '🎧', '🎮'],
    installed: false
  },
  {
    id: '6',
    name: 'Netflix',
    icon: '🎬',
    developer: 'Netflix, Inc.',
    rating: 4.5,
    downloads: '1B+',
    size: '78 MB',
    category: 'Entertainment',
    price: 'Free',
    description: 'Stream movies and TV shows anywhere.',
    screenshots: ['📺', '🍿', '🎭'],
    installed: true
  },
  {
    id: '7',
    name: 'Duolingo',
    icon: '🦜',
    developer: 'Duolingo',
    rating: 4.6,
    downloads: '500M+',
    size: '28 MB',
    category: 'Education',
    price: 'Free',
    description: 'Learn languages with fun, bite-sized lessons.',
    screenshots: ['📚', '🗣️', '🏆'],
    installed: false
  },
  {
    id: '8',
    name: 'Adobe Photoshop',
    icon: '🎨',
    developer: 'Adobe Inc.',
    rating: 4.2,
    downloads: '100M+',
    size: '156 MB',
    category: 'Creativity',
    price: '$9.99',
    description: 'Professional photo editing on your phone.',
    screenshots: ['🖼️', '🎨', '✨'],
    installed: false
  }
]

const CATEGORIES = [
  'All', 'Social', 'Entertainment', 'Music', 'Travel', 'Communication', 'Education', 'Creativity', 'Games', 'Productivity'
]

export default function PlayStoreInterface({ language, onBack, onHaptic }: PlayStoreInterfaceProps): JSX.Element {
  const [currentView, setCurrentView] = useState<'home' | 'app'>('home')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const { installedApps, installApp, uninstallApp, isAppInstalled } = usePhoneStore()
  
  // Update apps list to reflect installation status from store
  const apps = FEATURED_APPS.map(app => ({
    ...app,
    installed: isAppInstalled(app.id)
  }))
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    setIsVisible(true)
    animate('.playstore-container', 'slideInRight')
    
    // Listen for games filter event
    const handleFilterGames = () => {
      setSelectedCategory('Games')
    }
    
    document.addEventListener('filterGames', handleFilterGames)
    return () => document.removeEventListener('filterGames', handleFilterGames)
  }, [])

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.developer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAppSelect = (app: App): void => {
    onHaptic(50)
    setSelectedApp(app)
    setCurrentView('app')
    animate('.app-detail-container', 'slideInRight')
  }

  const handleBackToHome = (): void => {
    onHaptic(30)
    setCurrentView('home')
    setSelectedApp(null)
    animate('.playstore-home', 'slideInLeft')
  }

  const handleInstallApp = (app: App): void => {
    onHaptic(100)
    animate('.install-button', 'pulse')
    
    if (!app.installed) {
      // Install the app
      const newInstalledApp: InstalledApp = {
        id: app.id,
        name: app.name,
        icon: app.icon,
        developer: app.developer,
        category: app.category,
        type: app.category === 'Games' ? 'game' : 'app',
        launchType: app.id
      }
      
      installApp(newInstalledApp)
      
      // Simulate installation process
      setTimeout(() => {
        animate('.install-success', 'bounceIn')
        
        // If it's a game, launch it after installation
        if (['roblox', 'geometrydash', 'amongus', 'flappybird', 'tetris', 'snake'].includes(app.id)) {
          setTimeout(() => {
            // Trigger app launch through a custom event or callback
            window.dispatchEvent(new CustomEvent('launchApp', { detail: { appId: app.id } }))
          }, 1500)
        }
      }, 1000)
    } else {
      // Uninstall the app
      uninstallApp(app.id)
    }
  }

  const renderPlayStoreHome = (): JSX.Element => (
    <div className={`playstore-home h-full ${isVisible ? 'animate__animated' : ''}`}>
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 mr-2"
              onClick={onBack}
            >
              ←
            </Button>
            <h1 className="text-lg font-semibold">Play Store</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              👤
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              ⋮
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <Input
          placeholder="Search apps & games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder-white/70"
        />
      </div>

      {/* Categories */}
      <div className="bg-white border-b p-3">
        <ScrollArea className="w-full">
          <div className="flex space-x-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap ${selectedCategory === category ? 'bg-green-500 text-white' : ''}`}
                onClick={() => {
                  onHaptic(30)
                  setSelectedCategory(category)
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Apps Grid */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCategory === 'All' ? 'Featured Apps' : `${selectedCategory} Apps`}
          </h2>
          
          <div className="space-y-4">
            {filteredApps.map((app, index) => (
              <div
                key={app.id}
                className={`app-card-${index} bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200`}
                onClick={() => handleAppSelect(app)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{app.developer}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-yellow-500">★ {app.rating}</span>
                      <Badge variant="outline" className="text-xs">{app.category}</Badge>
                      <span className="text-xs text-gray-500">{app.price}</span>
                    </div>
                  </div>
                  {app.installed ? (
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                      Installed
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Install
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  const renderAppDetail = (): JSX.Element => (
    <div className="app-detail-container h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-3"
          onClick={handleBackToHome}
        >
          ←
        </Button>
        <h1 className="text-lg font-semibold">App Details</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* App Info */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-4xl">
              {selectedApp?.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedApp?.name}</h2>
              <p className="text-green-600 font-medium">{selectedApp?.developer}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-yellow-500">★ {selectedApp?.rating}</span>
                <span className="text-sm text-gray-600">{selectedApp?.downloads} downloads</span>
                <Badge>{selectedApp?.category}</Badge>
              </div>
            </div>
          </div>

          {/* Install Button */}
          <div className="mb-6">
            <Button
              className={`install-button w-full h-12 text-lg font-semibold ${
                selectedApp?.installed
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
              onClick={() => selectedApp && handleInstallApp(selectedApp)}
            >
              {selectedApp?.price === 'Free' || selectedApp?.installed
                ? selectedApp.installed ? 'Uninstall' : 'Install'
                : `Buy ${selectedApp?.price}`
              }
            </Button>
            
            {selectedApp?.installed && (
              <div className="install-success text-center mt-2 text-green-600 font-medium">
                ✓ App Installed Successfully!
              </div>
            )}
          </div>

          {/* App Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About this app</h3>
              <p className="text-gray-700">{selectedApp?.description}</p>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Size</p>
                <p className="font-medium">{selectedApp?.size}</p>
              </div>
              <div>
                <p className="text-gray-500">Downloads</p>
                <p className="font-medium">{selectedApp?.downloads}</p>
              </div>
              <div>
                <p className="text-gray-500">Price</p>
                <p className="font-medium">{selectedApp?.price}</p>
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Screenshots</h3>
              <div className="flex space-x-3">
                {selectedApp?.screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    className="w-20 h-36 bg-gray-100 rounded-lg flex items-center justify-center text-2xl"
                  >
                    {screenshot}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className={`playstore-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {currentView === 'home' ? renderPlayStoreHome() : renderAppDetail()}
    </div>
  )
}