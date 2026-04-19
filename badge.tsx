'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTranslation } from '@/lib/translations'

interface WeatherAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface WeatherData {
  location: string
  current: {
    temp: number
    condition: string
    emoji: string
    humidity: number
    windSpeed: number
    pressure: number
    visibility: number
  }
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    emoji: string
    precipitation: number
  }>
  hourly: Array<{
    time: string
    temp: number
    emoji: string
  }>
}

const MOCK_WEATHER_DATA: WeatherData = {
  location: 'San Francisco, CA',
  current: {
    temp: 22,
    condition: 'Partly Cloudy',
    emoji: '⛅',
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10
  },
  forecast: [
    { day: 'Today', high: 24, low: 16, condition: 'Sunny', emoji: '☀️', precipitation: 0 },
    { day: 'Tomorrow', high: 26, low: 18, condition: 'Partly Cloudy', emoji: '⛅', precipitation: 10 },
    { day: 'Friday', high: 20, low: 14, condition: 'Rainy', emoji: '🌧️', precipitation: 80 },
    { day: 'Saturday', high: 18, low: 12, condition: 'Stormy', emoji: '⛈️', precipitation: 90 },
    { day: 'Sunday', high: 23, low: 15, condition: 'Cloudy', emoji: '☁️', precipitation: 20 },
    { day: 'Monday', high: 25, low: 17, condition: 'Sunny', emoji: '☀️', precipitation: 0 },
    { day: 'Tuesday', high: 27, low: 19, condition: 'Hot', emoji: '🌡️', precipitation: 0 }
  ],
  hourly: [
    { time: '12 PM', temp: 22, emoji: '⛅' },
    { time: '1 PM', temp: 23, emoji: '☀️' },
    { time: '2 PM', temp: 24, emoji: '☀️' },
    { time: '3 PM', temp: 25, emoji: '☀️' },
    { time: '4 PM', temp: 24, emoji: '⛅' },
    { time: '5 PM', temp: 23, emoji: '⛅' },
    { time: '6 PM', temp: 21, emoji: '🌤️' },
    { time: '7 PM', temp: 20, emoji: '🌤️' }
  ]
}

export default function WeatherApp({ language, onBack, onHaptic, isNetworkConnected }: WeatherAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<'current' | 'forecast' | 'hourly'>('current')
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.weather-container', 'slideInRight')
    
    if (isNetworkConnected) {
      loadWeatherData()
    }
  }, [isNetworkConnected])

  const loadWeatherData = (): void => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setWeatherData(MOCK_WEATHER_DATA)
      setLoading(false)
      animate('.weather-data', 'fadeInUp')
    }, 1500)
  }

  const convertTemp = (temp: number): number => {
    return unit === 'F' ? Math.round((temp * 9/5) + 32) : temp
  }

  const handleRefresh = (): void => {
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-required', 'shake')
      return
    }
    
    onHaptic(50)
    animate('.refresh-button', 'spin')
    loadWeatherData()
  }

  const handleViewSwitch = (view: 'current' | 'forecast' | 'hourly'): void => {
    onHaptic(30)
    setSelectedView(view)
    animate('.view-content', 'slideInRight')
  }

  const toggleUnit = (): void => {
    onHaptic(30)
    setUnit(prev => prev === 'C' ? 'F' : 'C')
    animate('.unit-toggle', 'pulse')
  }

  const renderCurrentWeather = (): JSX.Element => (
    <div className="weather-data space-y-6">
      {/* Current Temperature */}
      <div className="text-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-lg font-medium mb-2">{weatherData?.location}</h2>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <span className="text-6xl">{weatherData?.current.emoji}</span>
          <div>
            <div className="text-5xl font-light">
              {convertTemp(weatherData?.current.temp || 0)}°{unit}
            </div>
            <div className="text-lg opacity-90">{weatherData?.current.condition}</div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">💧</span>
            <span className="text-sm text-gray-600">Humidity</span>
          </div>
          <div className="text-2xl font-semibold">{weatherData?.current.humidity}%</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🌬️</span>
            <span className="text-sm text-gray-600">Wind</span>
          </div>
          <div className="text-2xl font-semibold">{weatherData?.current.windSpeed} km/h</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm text-gray-600">Pressure</span>
          </div>
          <div className="text-2xl font-semibold">{weatherData?.current.pressure} mb</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">👁️</span>
            <span className="text-sm text-gray-600">Visibility</span>
          </div>
          <div className="text-2xl font-semibold">{weatherData?.current.visibility} km</div>
        </div>
      </div>
    </div>
  )

  const renderForecast = (): JSX.Element => (
    <div className="weather-data space-y-3">
      {weatherData?.forecast.map((day, index) => (
        <div key={day.day} className={`forecast-${index} bg-white rounded-xl p-4 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{day.emoji}</span>
              <div>
                <div className="font-semibold">{day.day}</div>
                <div className="text-sm text-gray-600">{day.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">
                  {convertTemp(day.high)}°
                </span>
                <span className="text-gray-500">
                  {convertTemp(day.low)}°
                </span>
              </div>
              <div className="text-xs text-blue-500">
                {day.precipitation}% rain
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderHourly = (): JSX.Element => (
    <div className="weather-data">
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {weatherData?.hourly.map((hour, index) => (
            <div key={hour.time} className={`hourly-${index} flex-shrink-0 bg-white rounded-xl p-4 border border-gray-200 text-center min-w-20`}>
              <div className="text-sm text-gray-600 mb-2">{hour.time}</div>
              <div className="text-2xl mb-2">{hour.emoji}</div>
              <div className="font-semibold">{convertTemp(hour.temp)}°</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className={`weather-container h-full bg-gray-50 ${isVisible ? 'animate__animated' : ''}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
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
            <h1 className="text-lg font-semibold">{t.appNames.weather}</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="unit-toggle text-white hover:bg-white/20"
              onClick={toggleUnit}
            >
              °{unit}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="refresh-button text-white hover:bg-white/20"
              onClick={handleRefresh}
            >
              🔄
            </Button>
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {(['current', 'forecast', 'hourly'] as const).map((view) => (
            <Button
              key={view}
              variant="ghost"
              size="sm"
              className={`flex-1 text-xs ${
                selectedView === view 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={() => handleViewSwitch(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!isNetworkConnected ? (
          <div className="network-required flex flex-col items-center justify-center h-full p-6 text-center">
            <span className="text-6xl mb-4">📶</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.networkRequired}</h3>
            <p className="text-gray-600 mb-4">{t.connectFirst} to get weather updates</p>
            <Button
              onClick={handleRefresh}
              disabled={!isNetworkConnected}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        ) : weatherData ? (
          <div className="view-content p-4">
            {selectedView === 'current' && renderCurrentWeather()}
            {selectedView === 'forecast' && renderForecast()}
            {selectedView === 'hourly' && renderHourly()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <span className="text-6xl mb-4">🌤️</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Weather Unavailable</h3>
            <p className="text-gray-600 mb-4">Unable to load weather data</p>
            <Button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}