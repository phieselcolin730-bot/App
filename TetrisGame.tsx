'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTranslation } from '@/lib/translations'

interface ClockAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Timer {
  id: string
  duration: number
  remaining: number
  isRunning: boolean
  label: string
}

interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
  days: string[]
}

export default function ClockApp({ language, onBack, onHaptic, isNetworkConnected }: ClockAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState<'clock' | 'timer' | 'stopwatch' | 'alarm'>('clock')
  const [timers, setTimers] = useState<Timer[]>([])
  const [stopwatchTime, setStopwatchTime] = useState<number>(0)
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false)
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24')
  
  const t = getTranslation(language)

  // World time zones
  const timeZones = [
    { name: 'New York', tz: 'America/New_York', emoji: '🗽' },
    { name: 'London', tz: 'Europe/London', emoji: '🇬🇧' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', emoji: '🗾' },
    { name: 'Paris', tz: 'Europe/Paris', emoji: '🗼' },
    { name: 'Sydney', tz: 'Australia/Sydney', emoji: '🦘' },
    { name: 'Dubai', tz: 'Asia/Dubai', emoji: '🏜️' }
  ]

  useEffect(() => {
    setIsVisible(true)
    animate('.clock-container', 'slideInRight')
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    // Update stopwatch
    const stopwatchInterval = setInterval(() => {
      if (stopwatchRunning) {
        setStopwatchTime(prev => prev + 1)
      }
    }, 10)
    
    // Update timers
    const timerInterval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isRunning && timer.remaining > 0) {
          const newRemaining = timer.remaining - 1
          if (newRemaining === 0) {
            onHaptic(200)
            animate('.timer-alert', 'bounce')
          }
          return { ...timer, remaining: newRemaining }
        }
        return timer
      }))
    }, 1000)
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(stopwatchInterval)
      clearInterval(timerInterval)
    }
  }, [stopwatchRunning, onHaptic])

  const formatTime = (date: Date, is24Hour: boolean = timeFormat === '24'): string => {
    if (is24Hour) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } else {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatStopwatch = (centiseconds: number): string => {
    const totalSeconds = Math.floor(centiseconds / 100)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const cs = centiseconds % 100
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
  }

  const handleViewSwitch = (view: 'clock' | 'timer' | 'stopwatch' | 'alarm'): void => {
    onHaptic(30)
    setSelectedView(view)
    animate('.view-content', 'slideInRight')
  }

  const addTimer = (minutes: number, label: string = 'Timer'): void => {
    onHaptic(50)
    const timer: Timer = {
      id: Date.now().toString(),
      duration: minutes * 60,
      remaining: minutes * 60,
      isRunning: false,
      label
    }
    setTimers(prev => [...prev, timer])
    animate('.timer-added', 'bounceIn')
  }

  const toggleTimer = (id: string): void => {
    onHaptic(30)
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
    ))
  }

  const resetTimer = (id: string): void => {
    onHaptic(30)
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, remaining: timer.duration, isRunning: false } : timer
    ))
  }

  const deleteTimer = (id: string): void => {
    onHaptic(50)
    setTimers(prev => prev.filter(timer => timer.id !== id))
  }

  const toggleStopwatch = (): void => {
    onHaptic(50)
    setStopwatchRunning(!stopwatchRunning)
    animate('.stopwatch-toggle', 'pulse')
  }

  const resetStopwatch = (): void => {
    onHaptic(30)
    setStopwatchTime(0)
    setStopwatchRunning(false)
    animate('.stopwatch-reset', 'shake')
  }

  const getTimeInZone = (timezone: string): string => {
    const time = new Date().toLocaleString('en-US', { 
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12'
    })
    return time
  }

  const renderClock = (): JSX.Element => (
    <div className="clock-data space-y-6 text-center">
      {/* Main Clock */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-6xl font-light mb-2 font-mono">
          {formatTime(currentTime)}
        </div>
        <div className="text-lg opacity-90">
          {currentTime.toLocaleDateString([], { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-white hover:bg-white/20"
          onClick={() => {
            onHaptic(30)
            setTimeFormat(prev => prev === '12' ? '24' : '12')
            animate('.time-format', 'pulse')
          }}
        >
          {timeFormat}H Format
        </Button>
      </div>

      {/* World Clocks */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-left">World Clocks</h3>
        <div className="space-y-3">
          {timeZones.map((zone, index) => (
            <div key={zone.tz} className={`world-clock-${index} bg-white rounded-xl p-4 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{zone.emoji}</span>
                  <div className="text-left">
                    <div className="font-semibold">{zone.name}</div>
                    <div className="text-sm text-gray-600">{zone.tz}</div>
                  </div>
                </div>
                <div className="text-xl font-mono font-semibold">
                  {getTimeInZone(zone.tz)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTimer = (): JSX.Element => (
    <div className="timer-data space-y-6">
      {/* Quick Timer Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 3, 5, 10, 15, 30].map((minutes) => (
          <Button
            key={minutes}
            variant="outline"
            onClick={() => addTimer(minutes, `${minutes}min timer`)}
            className="timer-quick h-16 flex flex-col"
          >
            <span className="text-lg">⏲️</span>
            <span className="text-sm">{minutes}m</span>
          </Button>
        ))}
      </div>

      {/* Active Timers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Timers</h3>
        {timers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">⏲️</span>
            <p>No timers set</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timers.map((timer, index) => (
              <div key={timer.id} className={`timer-${index} bg-white rounded-xl p-4 border border-gray-200`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{timer.label}</span>
                  <Badge className={timer.remaining === 0 ? 'bg-red-500' : timer.isRunning ? 'bg-green-500' : 'bg-gray-500'}>
                    {timer.remaining === 0 ? 'FINISHED' : timer.isRunning ? 'RUNNING' : 'PAUSED'}
                  </Badge>
                </div>
                
                <div className="text-3xl font-mono font-bold text-center mb-4">
                  {formatDuration(timer.remaining)}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={timer.isRunning ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => toggleTimer(timer.id)}
                    disabled={timer.remaining === 0}
                  >
                    {timer.isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => resetTimer(timer.id)}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteTimer(timer.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStopwatch = (): JSX.Element => (
    <div className="stopwatch-data space-y-8 text-center">
      {/* Stopwatch Display */}
      <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl p-8 text-white">
        <div className="text-6xl font-mono font-light mb-4">
          {formatStopwatch(stopwatchTime)}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            className={`stopwatch-toggle w-20 h-20 rounded-full text-xl ${
              stopwatchRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={toggleStopwatch}
          >
            {stopwatchRunning ? '⏸️' : '▶️'}
          </Button>
          
          <Button
            variant="outline"
            className="stopwatch-reset w-20 h-20 rounded-full text-xl bg-white text-gray-800 hover:bg-gray-100"
            onClick={resetStopwatch}
          >
            🔄
          </Button>
        </div>
      </div>

      {/* Lap Times - Future Enhancement */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Lap Times</h3>
        <p className="text-gray-500">Lap timing coming soon...</p>
      </div>
    </div>
  )

  return (
    <div className={`clock-container h-full bg-gray-50 ${isVisible ? 'animate__animated' : ''}`}>
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
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
            <h1 className="text-lg font-semibold">{t.appNames.clock}</h1>
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {(['clock', 'timer', 'stopwatch'] as const).map((view) => (
            <Button
              key={view}
              variant="ghost"
              size="sm"
              className={`flex-1 text-xs ${
                selectedView === view 
                  ? 'bg-white text-gray-900' 
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
      <ScrollArea className="flex-1">
        <div className="view-content p-4">
          {selectedView === 'clock' && renderClock()}
          {selectedView === 'timer' && renderTimer()}
          {selectedView === 'stopwatch' && renderStopwatch()}
        </div>
      </ScrollArea>
    </div>
  )
}