'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface MapsAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  rating?: number
  hours?: string
  phone?: string
  website?: string
  icon: string
}

interface Route {
  id: string
  origin: string
  destination: string
  distance: string
  duration: string
  traffic: 'light' | 'moderate' | 'heavy'
  waypoints?: string[]
}

export default function MapsApp({ language, onBack, onHaptic, isNetworkConnected }: MapsAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'map' | 'search' | 'directions' | 'nearby'>('map')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 34.0522, lng: -118.2437 }) // LA
  const [mapMode, setMapMode] = useState<'standard' | 'satellite' | 'transit' | 'terrain'>('standard')
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>(['Starbucks', 'Gas Station', 'Restaurant', 'Hospital'])
  const [savedPlaces, setSavedPlaces] = useState<Location[]>([])

  const t = getTranslation(language)

  // Sample locations data
  const [nearbyLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Downtown Coffee',
      address: '123 Main St, Los Angeles, CA',
      latitude: 34.0525,
      longitude: -118.2430,
      category: 'restaurant',
      rating: 4.5,
      hours: '6 AM - 10 PM',
      phone: '(555) 123-4567',
      icon: '☕'
    },
    {
      id: '2',
      name: 'City Hospital',
      address: '456 Health Ave, Los Angeles, CA',
      latitude: 34.0530,
      longitude: -118.2420,
      category: 'hospital',
      rating: 4.2,
      hours: 'Open 24 hours',
      phone: '(555) 911-2345',
      icon: '🏥'
    },
    {
      id: '3',
      name: 'Ocean View Park',
      address: '789 Park Blvd, Santa Monica, CA',
      latitude: 34.0195,
      longitude: -118.4912,
      category: 'park',
      rating: 4.8,
      hours: '5 AM - 10 PM',
      icon: '🌳'
    },
    {
      id: '4',
      name: 'Tech Mall',
      address: '321 Shopping Dr, Beverly Hills, CA',
      latitude: 34.0736,
      longitude: -118.4004,
      category: 'shopping',
      rating: 4.3,
      hours: '10 AM - 9 PM',
      phone: '(555) 456-7890',
      website: 'www.techmall.com',
      icon: '🛍️'
    },
    {
      id: '5',
      name: 'Sunset Gas Station',
      address: '654 Sunset Blvd, Hollywood, CA',
      latitude: 34.0983,
      longitude: -118.3267,
      category: 'gas_station',
      rating: 3.9,
      hours: 'Open 24 hours',
      icon: '⛽'
    },
    {
      id: '6',
      name: 'Marina Restaurant',
      address: '987 Marina Dr, Marina del Rey, CA',
      latitude: 33.9806,
      longitude: -118.4517,
      category: 'restaurant',
      rating: 4.6,
      hours: '11 AM - 11 PM',
      phone: '(555) 789-0123',
      icon: '🍽️'
    },
    {
      id: '7',
      name: 'Griffith Observatory',
      address: '2800 E Observatory Rd, Los Angeles, CA',
      latitude: 34.1184,
      longitude: -118.3004,
      category: 'attraction',
      rating: 4.9,
      hours: '10 AM - 10 PM',
      phone: '(555) 321-6543',
      website: 'www.griffithobservatory.org',
      icon: '🔭'
    },
    {
      id: '8',
      name: 'LAX Airport',
      address: '1 World Way, Los Angeles, CA',
      latitude: 33.9425,
      longitude: -118.4081,
      category: 'airport',
      hours: 'Open 24 hours',
      phone: '(555) 435-9876',
      icon: '✈️'
    }
  ])

  useEffect(() => {
    setIsVisible(true)
    animate('.maps-container', 'slideInRight')
    
    // Simulate getting user location
    if (navigator.geolocation && isNetworkConnected) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback to LA coordinates
          setUserLocation({ lat: 34.0522, lng: -118.2437 })
        }
      )
    }
  }, [isNetworkConnected])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleSearch = (): void => {
    if (!searchQuery.trim()) return
    
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }

    onHaptic(30)
    
    // Simulate search results
    const results = nearbyLocations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setSearchResults(results)
    setActiveView('search')
    animate('.search-results', 'slideInUp')
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)])
    }
  }

  const handleLocationSelect = (location: Location): void => {
    onHaptic(50)
    setSelectedLocation(location)
    setActiveView('map')
    animate('.location-details', 'slideInUp')
  }

  const handleGetDirections = (destination: Location): void => {
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }

    onHaptic(50)
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      destination.latitude,
      destination.longitude
    )
    
    const route: Route = {
      id: `route_${Date.now()}`,
      origin: 'Current Location',
      destination: destination.name,
      distance: `${distance.toFixed(1)} mi`,
      duration: `${Math.max(Math.ceil(distance * 2.5), 5)} min`,
      traffic: distance > 10 ? 'heavy' : distance > 5 ? 'moderate' : 'light'
    }
    
    setCurrentRoute(route)
    setActiveView('directions')
    animate('.directions-view', 'slideInRight')
  }

  const handleSavePlace = (location: Location): void => {
    onHaptic(50)
    setSavedPlaces(prev => {
      const exists = prev.find(p => p.id === location.id)
      if (exists) {
        return prev.filter(p => p.id !== location.id)
      } else {
        return [...prev, location]
      }
    })
    animate('.save-button', 'heartBeat')
  }

  const getNearbyPlaces = (): Location[] => {
    return nearbyLocations
      .map(location => ({
        ...location,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          location.latitude,
          location.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
  }

  const getMapModeIcon = (): string => {
    switch (mapMode) {
      case 'satellite': return '🛰️'
      case 'transit': return '🚇'
      case 'terrain': return '🏔️'
      default: return '🗺️'
    }
  }

  const getTrafficColor = (traffic: string): string => {
    switch (traffic) {
      case 'heavy': return 'text-red-500'
      case 'moderate': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  return (
    <div className={`maps-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {activeView === 'map' && (
        <div className="map-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={onBack}
              >
                ←
              </Button>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="pl-10 pr-4"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex space-x-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setActiveView('nearby')}
              >
                📍
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => {
                  const modes: Array<'standard' | 'satellite' | 'transit' | 'terrain'> = ['standard', 'satellite', 'transit', 'terrain']
                  const currentIndex = modes.indexOf(mapMode)
                  setMapMode(modes[(currentIndex + 1) % modes.length])
                  onHaptic(30)
                }}
              >
                {getMapModeIcon()}
              </Button>
            </div>
          </div>

          {/* Network Warning */}
          {!isNetworkConnected && (
            <div className="network-warning bg-orange-100 border-l-4 border-orange-500 p-3 mx-4 mt-4 rounded">
              <p className="text-orange-700 text-sm">
                📶 {t.networkRequired || 'Network connection required for maps and navigation'}
              </p>
            </div>
          )}

          {/* Map Display */}
          <div className="flex-1 relative bg-gradient-to-b from-green-100 via-yellow-50 to-blue-100">
            {isNetworkConnected ? (
              <>
                {/* Simulated Map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Map Grid Background */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Your Location */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        You are here
                      </div>
                    </div>

                    {/* Nearby Places */}
                    {getNearbyPlaces().slice(0, 5).map((place, index) => (
                      <div
                        key={place.id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                          selectedLocation?.id === place.id ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          top: `${50 + (Math.random() - 0.5) * 60}%`,
                          left: `${50 + (Math.random() - 0.5) * 60}%`
                        }}
                        onClick={() => handleLocationSelect(place)}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-red-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-sm">
                            {place.icon}
                          </div>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Mode Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-gray-700 border border-gray-300">
                    {getMapModeIcon()} {mapMode}
                  </Badge>
                </div>

                {/* Location Services */}
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 bg-white shadow-md rounded-full"
                    onClick={() => {
                      onHaptic(30)
                      animate('.location-center', 'pulse')
                    }}
                  >
                    🎯
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📶</span>
                  <p className="text-lg font-medium">No Internet Connection</p>
                  <p className="text-sm">Connect to view maps</p>
                </div>
              </div>
            )}
          </div>

          {/* Location Details Panel */}
          {selectedLocation && (
            <div className="location-details bg-white border-t border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {selectedLocation.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="save-button"
                      onClick={() => handleSavePlace(selectedLocation)}
                    >
                      {savedPlaces.find(p => p.id === selectedLocation.id) ? '❤️' : '🤍'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{selectedLocation.address}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    {selectedLocation.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">{selectedLocation.rating}</span>
                      </div>
                    )}
                    {selectedLocation.hours && (
                      <span className="text-green-600">{selectedLocation.hours}</span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleGetDirections(selectedLocation)}
                    >
                      🧭 Directions
                    </Button>
                    {selectedLocation.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onHaptic(50)
                          // In a real app, this would open the phone app
                          console.log(`Calling ${selectedLocation.phone}`)
                        }}
                      >
                        📞 Call
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'search' && (
        <div className="search-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 mr-2"
              onClick={() => setActiveView('map')}
            >
              ←
            </Button>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-10 pr-4"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 ml-2"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Recent Searches */}
            {searchQuery === '' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        setSearchQuery(search)
                        handleSearch()
                      }}
                    >
                      <span className="text-gray-400 mr-3">🕒</span>
                      <span className="text-gray-700">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div className="search-results p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Results for "{searchQuery}" ({searchResults.length})
                </h3>
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          {location.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          {location.rating && (
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-500 text-sm">⭐</span>
                              <span className="text-sm text-gray-600 ml-1">{location.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {calculateDistance(userLocation.lat, userLocation.lng, location.latitude, location.longitude).toFixed(1)} mi
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGetDirections(location)
                            }}
                          >
                            🧭
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'nearby' && (
        <div className="nearby-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setActiveView('map')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">Nearby Places</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {getNearbyPlaces().map((location) => (
                <div
                  key={location.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {location.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{location.name}</h3>
                        <span className="text-sm text-gray-500">
                          {location.distance.toFixed(1)} mi
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      <div className="flex items-center mt-1">
                        {location.rating && (
                          <>
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-sm text-gray-600 ml-1 mr-3">{location.rating}</span>
                          </>
                        )}
                        {location.hours && (
                          <span className="text-xs text-green-600">{location.hours}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGetDirections(location)
                      }}
                    >
                      🧭 Directions
                    </Button>
                    {location.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onHaptic(50)
                          console.log(`Calling ${location.phone}`)
                        }}
                      >
                        📞
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSavePlace(location)
                      }}
                    >
                      {savedPlaces.find(p => p.id === location.id) ? '❤️' : '🤍'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'directions' && currentRoute && (
        <div className="directions-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={() => setActiveView('map')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">Directions</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              📍
            </Button>
          </div>

          {/* Route Info */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold">{currentRoute.duration}</h2>
                <p className="text-sm text-gray-600">{currentRoute.distance}</p>
              </div>
              <Badge className={`${getTrafficColor(currentRoute.traffic)} border-current`}>
                🚗 {currentRoute.traffic} traffic
              </Badge>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600">{currentRoute.origin}</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-gray-600">{currentRoute.destination}</span>
              </div>
            </div>
          </div>

          {/* Route Preview */}
          <div className="flex-1 bg-gradient-to-b from-blue-50 to-green-50 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-4xl text-white mb-4">
                  🗺️
                </div>
                <p className="text-lg font-semibold text-gray-700">Route Preview</p>
                <p className="text-sm text-gray-600">{currentRoute.destination}</p>
              </div>
            </div>

            {/* Mock Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 50 80 Q 150 200 250 120 Q 350 40 450 160"
                stroke="#3B82F6"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* Navigation Controls */}
          <div className="bg-white border-t p-4">
            <div className="flex space-x-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  onHaptic(50)
                  console.log('Starting navigation to:', currentRoute.destination)
                  animate('.start-nav', 'pulse')
                }}
                disabled={!isNetworkConnected}
              >
                🧭 Start Navigation
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onHaptic(30)
                  console.log('Adding to calendar:', currentRoute.destination)
                }}
              >
                📅
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onHaptic(30)
                  console.log('Sharing route:', currentRoute.destination)
                }}
                disabled={!isNetworkConnected}
              >
                📤
              </Button>
            </div>
            
            {!isNetworkConnected && (
              <p className="text-center text-orange-600 text-sm mt-2">
                📶 Network required for navigation
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}