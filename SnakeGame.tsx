'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface CameraAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Photo {
  id: string
  timestamp: number
  mode: 'photo' | 'video'
  filters?: string
}

export default function CameraApp({ language, onBack, onHaptic, isNetworkConnected }: CameraAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>('photo')
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('normal')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back')
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [lastPhoto, setLastPhoto] = useState<Photo | null>(null)
  
  const t = getTranslation(language)
  const videoRef = useRef<HTMLVideoElement>(null)

  const filters = [
    { id: 'normal', name: 'Normal', emoji: '📷' },
    { id: 'vintage', name: 'Vintage', emoji: '📸' },
    { id: 'bw', name: 'B&W', emoji: '⚫' },
    { id: 'sepia', name: 'Sepia', emoji: '🟫' },
    { id: 'vivid', name: 'Vivid', emoji: '🌈' },
    { id: 'cool', name: 'Cool', emoji: '❄️' }
  ]

  useEffect(() => {
    setIsVisible(true)
    animate('.camera-container', 'slideInRight')
    
    // Simulate camera preview
    if (videoRef.current) {
      // In a real app, this would be navigator.mediaDevices.getUserMedia()
      videoRef.current.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
    }
  }, [])

  const handleCapture = (): void => {
    onHaptic(100)
    animate('.capture-button', 'pulse')
    
    const photo: Photo = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: currentMode,
      filters: selectedFilter
    }
    
    setPhotos(prev => [photo, ...prev])
    setLastPhoto(photo)
    
    // Flash effect
    const flashElement = document.querySelector('.camera-flash')
    if (flashElement) {
      animate('.camera-flash', 'flash')
    }
    
    // Show preview briefly
    setShowPreview(true)
    setTimeout(() => setShowPreview(false), 2000)
  }

  const handleModeSwitch = (mode: 'photo' | 'video'): void => {
    onHaptic(30)
    setCurrentMode(mode)
    animate('.mode-switch', 'slideInUp')
  }

  const handleFlashToggle = (): void => {
    onHaptic(30)
    setIsFlashOn(!isFlashOn)
    animate('.flash-toggle', 'bounce')
  }

  const handleFilterSelect = (filter: string): void => {
    onHaptic(30)
    setSelectedFilter(filter)
    animate('.filter-selector', 'pulse')
  }

  const handleZoom = (direction: 'in' | 'out'): void => {
    onHaptic(20)
    if (direction === 'in' && zoomLevel < 5) {
      setZoomLevel(prev => Math.min(prev + 0.5, 5))
    } else if (direction === 'out' && zoomLevel > 1) {
      setZoomLevel(prev => Math.max(prev - 0.5, 1))
    }
    animate('.zoom-controls', 'pulse')
  }

  const handleCameraFlip = (): void => {
    onHaptic(50)
    setCameraFacing(prev => prev === 'front' ? 'back' : 'front')
    animate('.camera-flip', 'rotateY')
  }

  const handleRecording = (): void => {
    if (!isNetworkConnected && currentMode === 'video') {
      onHaptic(100)
      animate('.network-required', 'shake')
      return
    }
    
    onHaptic(80)
    setIsRecording(!isRecording)
    animate('.recording-indicator', 'pulse')
  }

  return (
    <div className={`camera-container h-full bg-black relative overflow-hidden ${isVisible ? 'animate__animated' : ''}`}>
      {/* Camera Flash Effect */}
      <div className="camera-flash absolute inset-0 bg-white opacity-0 pointer-events-none z-50"></div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={onBack}
        >
          ←
        </Button>
        
        <div className="flex items-center space-x-4">
          {/* Flash Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`flash-toggle text-white hover:bg-white/20 ${isFlashOn ? 'bg-yellow-500/20' : ''}`}
            onClick={handleFlashToggle}
          >
            {isFlashOn ? '⚡' : '⚡'}
          </Button>
          
          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            ⚙️
          </Button>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="relative h-full flex flex-col">
        <div className="flex-1 relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
          {/* Simulated camera preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 rounded-lg flex items-center justify-center">
              <span className="text-white/50 text-6xl">📷</span>
            </div>
          </div>
          
          {/* Camera facing indicator */}
          <div className="absolute top-20 right-4">
            <Badge className={`camera-flip ${cameraFacing === 'front' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
              {cameraFacing === 'front' ? '🤳' : '📷'} {cameraFacing}
            </Badge>
          </div>
          
          {/* Zoom Level */}
          <div className="absolute top-20 left-4">
            <Badge className="bg-black/50 text-white">
              {zoomLevel}x
            </Badge>
          </div>
          
          {/* Recording Indicator */}
          {isRecording && (
            <div className="recording-indicator absolute top-32 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-red-500 text-white animate-pulse">
                🔴 REC
              </Badge>
            </div>
          )}
          
          {/* Network Required Warning */}
          {!isNetworkConnected && currentMode === 'video' && (
            <div className="network-required absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500/90 text-white p-4 rounded-lg">
              <p className="text-center">
                📶 {t.networkRequired}<br />
                <span className="text-sm">{t.connectFirst} for video recording</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Filter Selector */}
        <div className="filter-selector bg-black/70 backdrop-blur-sm p-2">
          <div className="flex space-x-3 overflow-x-auto">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center min-w-12 text-white hover:bg-white/20 ${
                  selectedFilter === filter.id ? 'bg-white/20 border border-white/30' : ''
                }`}
                onClick={() => handleFilterSelect(filter.id)}
              >
                <span className="text-lg mb-1">{filter.emoji}</span>
                <span className="text-xs">{filter.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Camera Controls */}
        <div className="bg-black p-6 flex items-center justify-between">
          {/* Last Photo Preview */}
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            {lastPhoto ? (
              <span className="text-xs text-white">{photos.length}</span>
            ) : (
              <span className="text-gray-400">📷</span>
            )}
          </div>
          
          {/* Capture Button */}
          <div className="flex flex-col items-center">
            <Button
              className={`capture-button w-20 h-20 rounded-full ${
                currentMode === 'video' && isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white hover:bg-gray-100'
              } border-4 border-gray-300 shadow-lg transition-all duration-200`}
              onClick={currentMode === 'video' ? handleRecording : handleCapture}
            >
              {currentMode === 'video' && isRecording ? (
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              ) : (
                <span className={currentMode === 'video' ? 'text-red-500 text-2xl' : 'text-gray-800 text-2xl'}>
                  {currentMode === 'video' ? '🔴' : '📷'}
                </span>
              )}
            </Button>
            
            {/* Mode Switch */}
            <div className="mode-switch flex mt-3 bg-gray-700 rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs px-3 py-1 rounded-full ${
                  currentMode === 'photo' ? 'bg-white text-black' : 'text-white'
                }`}
                onClick={() => handleModeSwitch('photo')}
              >
                PHOTO
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs px-3 py-1 rounded-full ${
                  currentMode === 'video' ? 'bg-white text-black' : 'text-white'
                }`}
                onClick={() => handleModeSwitch('video')}
              >
                VIDEO
              </Button>
            </div>
          </div>
          
          {/* Camera Flip */}
          <Button
            variant="ghost"
            size="sm"
            className="camera-flip w-12 h-12 text-white hover:bg-white/20 rounded-lg"
            onClick={handleCameraFlip}
          >
            🔄
          </Button>
        </div>
        
        {/* Zoom Controls */}
        <div className="zoom-controls absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 bg-black/50 text-white hover:bg-white/20 rounded-full"
            onClick={() => handleZoom('in')}
            disabled={zoomLevel >= 5}
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 bg-black/50 text-white hover:bg-white/20 rounded-full"
            onClick={() => handleZoom('out')}
            disabled={zoomLevel <= 1}
          >
            -
          </Button>
        </div>
      </div>
      
      {/* Photo Preview Overlay */}
      {showPreview && lastPhoto && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-4xl">📷</span>
            </div>
            <p className="text-sm text-gray-600">
              {currentMode === 'photo' ? 'Photo' : 'Video'} saved!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(lastPhoto.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}