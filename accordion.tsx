'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface GalleryAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  title: string
  thumbnail: string
  timestamp: number
  size: number
  dimensions: { width: number; height: number }
  location?: string
  filters?: string
  duration?: number // for videos
  favorite: boolean
}

interface Album {
  id: string
  name: string
  cover: string
  itemCount: number
  items: string[]
  type: 'auto' | 'manual'
}

export default function GalleryApp({ language, onBack, onHaptic, isNetworkConnected }: GalleryAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'grid' | 'albums' | 'viewer' | 'slideshow'>('grid')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showInfo, setShowInfo] = useState<boolean>(false)
  
  const t = getTranslation(language)

  // Sample gallery data
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'photo',
      title: 'Sunset Beach',
      thumbnail: '🌅',
      timestamp: Date.now() - 86400000, // 1 day ago
      size: 2048000, // 2MB
      dimensions: { width: 1920, height: 1080 },
      location: 'Santa Monica, CA',
      filters: 'vivid',
      favorite: true
    },
    {
      id: '2',
      type: 'video',
      title: 'City Night Drive',
      thumbnail: '🌆',
      timestamp: Date.now() - 172800000, // 2 days ago
      size: 15728640, // 15MB
      dimensions: { width: 1920, height: 1080 },
      location: 'Downtown LA',
      duration: 45,
      favorite: false
    },
    {
      id: '3',
      type: 'photo',
      title: 'Mountain Hike',
      thumbnail: '⛰️',
      timestamp: Date.now() - 259200000, // 3 days ago
      size: 3145728, // 3MB
      dimensions: { width: 2560, height: 1440 },
      location: 'Yosemite National Park',
      filters: 'landscape',
      favorite: true
    },
    {
      id: '4',
      type: 'photo',
      title: 'Coffee Shop',
      thumbnail: '☕',
      timestamp: Date.now() - 345600000, // 4 days ago
      size: 1572864, // 1.5MB
      dimensions: { width: 1080, height: 1080 },
      filters: 'warm',
      favorite: false
    },
    {
      id: '5',
      type: 'video',
      title: 'Ocean Waves',
      thumbnail: '🌊',
      timestamp: Date.now() - 432000000, // 5 days ago
      size: 22020096, // 21MB
      dimensions: { width: 3840, height: 2160 },
      location: 'Malibu Beach',
      duration: 62,
      favorite: true
    },
    {
      id: '6',
      type: 'photo',
      title: 'City Lights',
      thumbnail: '🏙️',
      timestamp: Date.now() - 518400000, // 6 days ago
      size: 2621440, // 2.5MB
      dimensions: { width: 1920, height: 1280 },
      location: 'New York City',
      filters: 'night',
      favorite: false
    },
    {
      id: '7',
      type: 'photo',
      title: 'Forest Path',
      thumbnail: '🌲',
      timestamp: Date.now() - 604800000, // 7 days ago
      size: 1843200, // 1.8MB
      dimensions: { width: 1440, height: 1080 },
      location: 'Redwood Forest',
      filters: 'nature',
      favorite: true
    },
    {
      id: '8',
      type: 'video',
      title: 'Street Performance',
      thumbnail: '🎭',
      timestamp: Date.now() - 691200000, // 8 days ago
      size: 8388608, // 8MB
      dimensions: { width: 1280, height: 720 },
      location: 'Times Square',
      duration: 28,
      favorite: false
    }
  ])

  const [albums] = useState<Album[]>([
    {
      id: 'recent',
      name: 'Recent',
      cover: '🕒',
      itemCount: mediaItems.length,
      items: mediaItems.map(item => item.id),
      type: 'auto'
    },
    {
      id: 'favorites',
      name: 'Favorites',
      cover: '❤️',
      itemCount: mediaItems.filter(item => item.favorite).length,
      items: mediaItems.filter(item => item.favorite).map(item => item.id),
      type: 'auto'
    },
    {
      id: 'photos',
      name: 'Photos',
      cover: '📷',
      itemCount: mediaItems.filter(item => item.type === 'photo').length,
      items: mediaItems.filter(item => item.type === 'photo').map(item => item.id),
      type: 'auto'
    },
    {
      id: 'videos',
      name: 'Videos',
      cover: '🎥',
      itemCount: mediaItems.filter(item => item.type === 'video').length,
      items: mediaItems.filter(item => item.type === 'video').map(item => item.id),
      type: 'auto'
    },
    {
      id: 'locations',
      name: 'Places',
      cover: '📍',
      itemCount: mediaItems.filter(item => item.location).length,
      items: mediaItems.filter(item => item.location).map(item => item.id),
      type: 'auto'
    },
    {
      id: 'vacation',
      name: 'Vacation 2023',
      cover: '🏖️',
      itemCount: 3,
      items: ['1', '3', '5'], // Beach, Mountain, Ocean
      type: 'manual'
    }
  ])

  useEffect(() => {
    setIsVisible(true)
    animate('.gallery-container', 'slideInRight')
  }, [])

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleItemClick = (item: MediaItem): void => {
    if (selectionMode) {
      const newSelected = new Set(selectedItems)
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id)
      } else {
        newSelected.add(item.id)
      }
      setSelectedItems(newSelected)
      onHaptic(30)
    } else {
      onHaptic(50)
      setSelectedItem(item)
      setActiveView('viewer')
      animate('.media-viewer', 'zoomIn')
    }
  }

  const handleItemLongPress = (item: MediaItem): void => {
    onHaptic(100)
    setSelectionMode(true)
    const newSelected = new Set(selectedItems)
    newSelected.add(item.id)
    setSelectedItems(newSelected)
    animate('.selection-toolbar', 'slideInDown')
  }

  const exitSelectionMode = (): void => {
    setSelectionMode(false)
    setSelectedItems(new Set())
    animate('.selection-toolbar', 'slideOutUp')
  }

  const handleDeleteSelected = (): void => {
    onHaptic(100)
    // In a real app, this would delete the files
    console.log(`Deleting ${selectedItems.size} items:`, Array.from(selectedItems))
    exitSelectionMode()
    animate('.delete-success', 'bounceIn')
  }

  const handleFavoriteSelected = (): void => {
    onHaptic(50)
    // In a real app, this would toggle favorite status
    console.log(`Toggling favorite for ${selectedItems.size} items:`, Array.from(selectedItems))
    exitSelectionMode()
    animate('.favorite-success', 'bounceIn')
  }

  const handleShareSelected = (): void => {
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }
    
    onHaptic(50)
    console.log(`Sharing ${selectedItems.size} items:`, Array.from(selectedItems))
    exitSelectionMode()
    animate('.share-success', 'bounceIn')
  }

  const handleAlbumSelect = (album: Album): void => {
    onHaptic(30)
    setSelectedAlbum(album)
    setActiveView('grid')
    animate('.album-view', 'slideInRight')
  }

  const getSortedItems = (): MediaItem[] => {
    let items = selectedAlbum 
      ? mediaItems.filter(item => selectedAlbum.items.includes(item.id))
      : mediaItems

    if (searchQuery) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'size':
          return b.size - a.size
        case 'date':
        default:
          return b.timestamp - a.timestamp
      }
    })
  }

  const sortedItems = getSortedItems()

  return (
    <div className={`gallery-container h-full bg-gray-50 ${isVisible ? 'animate__animated' : ''}`}>
      {activeView === 'grid' && (
        <div className="gallery-grid h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={selectedAlbum ? () => {
                  setSelectedAlbum(null)
                  setActiveView('albums')
                } : onBack}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">
                {selectedAlbum ? selectedAlbum.name : (t.appNames?.gallery || 'Gallery')}
              </h1>
            </div>
            <div className="flex space-x-2">
              {!selectedAlbum && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-gray-100"
                  onClick={() => setActiveView('albums')}
                >
                  📁
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? '☰' : '▦'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
              >
                ⋯
              </Button>
            </div>
          </div>

          {/* Selection Toolbar */}
          {selectionMode && (
            <div className="selection-toolbar bg-blue-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 mr-2"
                  onClick={exitSelectionMode}
                >
                  ✕
                </Button>
                <span className="text-sm font-medium">{selectedItems.size} selected</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleFavoriteSelected}
                >
                  ❤️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleShareSelected}
                >
                  📤
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleDeleteSelected}
                >
                  🗑️
                </Button>
              </div>
            </div>
          )}

          {/* Search and Sort */}
          <div className="bg-white border-b p-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search photos and videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {['date', 'name', 'size'].map((sort) => (
                  <Button
                    key={sort}
                    variant={sortBy === sort ? 'default' : 'ghost'}
                    size="sm"
                    className={`text-xs ${sortBy === sort ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSortBy(sort as typeof sortBy)}
                  >
                    {sort === 'date' ? '📅' : sort === 'name' ? '🔤' : '📊'} {sort}
                  </Button>
                ))}
              </div>
              
              <span className="text-sm text-gray-500">
                {sortedItems.length} items
              </span>
            </div>
          </div>

          {/* Media Grid/List */}
          <div className="flex-1 overflow-y-auto p-4">
            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-6xl mb-4">📷</span>
                <p className="text-lg font-medium">No media found</p>
                <p className="text-sm">Take some photos or videos to get started!</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-2">
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                      selectedItems.has(item.id) ? 'ring-2 ring-blue-500 scale-95' : 'hover:scale-105'
                    }`}
                    onClick={() => handleItemClick(item)}
                    onTouchStart={() => {
                      // Long press detection for mobile
                      const timeout = setTimeout(() => {
                        handleItemLongPress(item)
                      }, 500)
                      
                      const cleanup = () => {
                        clearTimeout(timeout)
                        document.removeEventListener('touchend', cleanup)
                      }
                      document.addEventListener('touchend', cleanup)
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {item.thumbnail}
                    </div>
                    
                    {/* Media Type Badge */}
                    {item.type === 'video' && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/70 text-white text-xs">
                          🎥 {formatDuration(item.duration || 0)}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Favorite Badge */}
                    {item.favorite && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-500 text-white text-xs">❤️</Badge>
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {selectionMode && (
                      <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 ${
                        selectedItems.has(item.id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-white border-gray-400'
                      } flex items-center justify-center`}>
                        {selectedItems.has(item.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition-all ${
                      selectedItems.has(item.id) ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                      {item.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatDate(item.timestamp)}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span>{item.dimensions.width}×{item.dimensions.height}</span>
                      </div>
                      {item.location && (
                        <p className="text-xs text-gray-400 truncate mt-1">📍 {item.location}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.favorite && <span className="text-red-500">❤️</span>}
                      {item.type === 'video' && <span className="text-blue-500">🎥</span>}
                      {selectionMode && (
                        <div className={`w-5 h-5 rounded-full border ${
                          selectedItems.has(item.id) 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-400'
                        } flex items-center justify-center`}>
                          {selectedItems.has(item.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'albums' && (
        <div className="albums-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setActiveView('grid')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">Albums</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
            >
              ✏️
            </Button>
          </div>

          {/* Albums Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleAlbumSelect(album)}
                >
                  <div className="aspect-square bg-gray-200 flex items-center justify-center text-4xl">
                    {album.cover}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">{album.name}</h3>
                    <p className="text-xs text-gray-500">{album.itemCount} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'viewer' && selectedItem && (
        <div className="media-viewer h-full bg-black flex flex-col">
          {/* Header */}
          <div className="bg-black/70 backdrop-blur-sm p-4 flex items-center justify-between text-white">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setActiveView('grid')}
            >
              ←
            </Button>
            <h2 className="text-lg font-semibold truncate flex-1 mx-4">
              {selectedItem.title}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowInfo(!showInfo)}
              >
                ℹ️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                📤
              </Button>
            </div>
          </div>

          {/* Media Content */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="w-full h-full max-w-4xl max-h-full flex items-center justify-center">
              {selectedItem.type === 'photo' ? (
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center text-8xl shadow-2xl">
                    {selectedItem.thumbnail}
                  </div>
                  {selectedItem.favorite && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white">❤️</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="w-80 h-60 bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg flex flex-col items-center justify-center text-6xl shadow-2xl">
                    {selectedItem.thumbnail}
                    <div className="text-lg text-white mt-4">
                      {formatDuration(selectedItem.duration || 0)}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-16 h-16 bg-black/50 text-white hover:bg-black/70 rounded-full"
                      disabled={!isNetworkConnected}
                    >
                      ▶️
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Network Warning for Videos */}
            {selectedItem.type === 'video' && !isNetworkConnected && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-orange-500/90 text-white p-4 rounded-lg">
                <p className="text-center">
                  📶 Network required to play videos
                </p>
              </div>
            )}
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="bg-black/90 text-white p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Date</p>
                  <p>{formatDate(selectedItem.timestamp)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Size</p>
                  <p>{formatFileSize(selectedItem.size)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Dimensions</p>
                  <p>{selectedItem.dimensions.width} × {selectedItem.dimensions.height}</p>
                </div>
                {selectedItem.location && (
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p>{selectedItem.location}</p>
                  </div>
                )}
                {selectedItem.duration && (
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p>{formatDuration(selectedItem.duration)}</p>
                  </div>
                )}
                {selectedItem.filters && (
                  <div>
                    <p className="text-gray-400">Filter</p>
                    <p className="capitalize">{selectedItem.filters}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center space-x-6 text-white">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
              onClick={() => {
                selectedItem.favorite = !selectedItem.favorite
                onHaptic(50)
                animate('.favorite-toggle', 'heartBeat')
              }}
            >
              {selectedItem.favorite ? '❤️' : '🤍'}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
            >
              📤
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
            >
              🗑️
            </Button>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {!isNetworkConnected && (
        <div className="network-warning fixed bottom-4 left-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm text-center">
            📶 Some features require network connection
          </p>
        </div>
      )}
    </div>
  )
}