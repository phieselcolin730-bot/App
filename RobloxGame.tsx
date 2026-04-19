'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface CalendarAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  category: 'work' | 'personal' | 'appointment' | 'reminder' | 'birthday' | 'holiday'
  reminder?: number // minutes before
  attendees?: string[]
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  color: string
}

export default function CalendarApp({ language, onBack, onHaptic, isNetworkConnected }: CalendarAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day' | 'agenda' | 'add'>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false)
  const [newEventTitle, setNewEventTitle] = useState<string>('')
  const [newEventDate, setNewEventDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [newEventTime, setNewEventTime] = useState<string>('09:00')
  
  const t = getTranslation(language)

  // Sample events data
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly sync with the development team',
      startDate: new Date(2023, 11, 15, 9, 0), // Dec 15, 2023 at 9:00 AM
      endDate: new Date(2023, 11, 15, 10, 0),
      location: 'Conference Room A',
      category: 'work',
      reminder: 15,
      attendees: ['john@company.com', 'sarah@company.com'],
      recurring: 'weekly',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Doctor Appointment',
      description: 'Annual checkup',
      startDate: new Date(2023, 11, 18, 14, 30),
      endDate: new Date(2023, 11, 18, 15, 30),
      location: 'City Medical Center',
      category: 'appointment',
      reminder: 60,
      color: 'bg-red-500'
    },
    {
      id: '3',
      title: 'Sarah\'s Birthday',
      description: 'Don\'t forget to call!',
      startDate: new Date(2023, 11, 20, 0, 0),
      endDate: new Date(2023, 11, 20, 23, 59),
      category: 'birthday',
      recurring: 'yearly',
      color: 'bg-pink-500'
    },
    {
      id: '4',
      title: 'Project Deadline',
      description: 'Mobile app project final submission',
      startDate: new Date(2023, 11, 22, 17, 0),
      endDate: new Date(2023, 11, 22, 17, 0),
      category: 'work',
      reminder: 1440, // 24 hours
      color: 'bg-orange-500'
    },
    {
      id: '5',
      title: 'Christmas Day',
      description: 'Spend time with family',
      startDate: new Date(2023, 11, 25, 0, 0),
      endDate: new Date(2023, 11, 25, 23, 59),
      category: 'holiday',
      color: 'bg-green-500'
    },
    {
      id: '6',
      title: 'Gym Session',
      description: 'Leg day workout',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 86400000 + 3600000), // +1 hour
      location: 'PowerFit Gym',
      category: 'personal',
      reminder: 30,
      recurring: 'daily',
      color: 'bg-purple-500'
    },
    {
      id: '7',
      title: 'Coffee with Mike',
      description: 'Catch up over coffee',
      startDate: new Date(Date.now() + 172800000), // Day after tomorrow
      endDate: new Date(Date.now() + 172800000 + 1800000), // +30 minutes
      location: 'Starbucks Downtown',
      category: 'personal',
      reminder: 15,
      color: 'bg-yellow-500'
    }
  ])

  useEffect(() => {
    setIsVisible(true)
    animate('.calendar-container', 'slideInRight')
  }, [])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForMonth = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date()
    return events
      .filter(event => event.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5)
  }

  const handleDateClick = (day: number): void => {
    onHaptic(30)
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    setActiveView('day')
    animate('.day-view', 'slideInRight')
  }

  const handleEventClick = (event: CalendarEvent): void => {
    onHaptic(50)
    setSelectedEvent(event)
    setShowEventDetails(true)
    animate('.event-details', 'slideInUp')
  }

  const handlePreviousMonth = (): void => {
    onHaptic(30)
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    animate('.calendar-grid', 'slideInLeft')
  }

  const handleNextMonth = (): void => {
    onHaptic(30)
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    animate('.calendar-grid', 'slideInRight')
  }

  const handleAddEvent = (): void => {
    if (!newEventTitle.trim()) return
    
    onHaptic(50)
    console.log('Adding event:', {
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime
    })
    
    setNewEventTitle('')
    setNewEventDate(new Date().toISOString().split('T')[0])
    setNewEventTime('09:00')
    setActiveView('month')
    animate('.add-success', 'bounceIn')
  }

  const getCategoryIcon = (category: CalendarEvent['category']): string => {
    switch (category) {
      case 'work': return '💼'
      case 'personal': return '👤'
      case 'appointment': return '🏥'
      case 'reminder': return '⏰'
      case 'birthday': return '🎂'
      case 'holiday': return '🎄'
      default: return '📅'
    }
  }

  const getRecurringIcon = (recurring: CalendarEvent['recurring']): string => {
    switch (recurring) {
      case 'daily': return '📅'
      case 'weekly': return '📆'
      case 'monthly': return '🗓️'
      case 'yearly': return '📅'
      default: return ''
    }
  }

  const renderCalendarGrid = (): JSX.Element => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      )
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      
      days.push(
        <div
          key={day}
          className={`aspect-square border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${
            isSelected ? 'bg-blue-100 border-blue-300' : ''
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className={`${event.color} h-1 rounded-full`}
              ></div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="calendar-grid grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  return (
    <div className={`calendar-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {activeView === 'month' && (
        <div className="month-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={onBack}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">{t.appNames?.calendar || 'Calendar'}</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setActiveView('agenda')}
              >
                📋
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setActiveView('add')}
              >
                ➕
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
              onClick={handlePreviousMonth}
            >
              ←
            </Button>
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleDateString(language === 'en' ? 'en-US' : language, {
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
              onClick={handleNextMonth}
            >
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 p-4">
            {renderCalendarGrid()}
          </div>

          {/* Today's Events */}
          <div className="bg-gray-50 border-t p-4 max-h-32 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Today's Events</h3>
            {getEventsForDate(new Date()).length === 0 ? (
              <p className="text-sm text-gray-500">No events today</p>
            ) : (
              <div className="space-y-2">
                {getEventsForDate(new Date()).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className={`w-3 h-3 ${event.color} rounded-full`}></div>
                    <span className="text-sm font-medium flex-1">{event.title}</span>
                    <span className="text-xs text-gray-500">{formatTime(event.startDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'day' && (
        <div className="day-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setActiveView('month')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">{formatDate(selectedDate)}</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
              onClick={() => setActiveView('add')}
            >
              ➕
            </Button>
          </div>

          {/* Day Events */}
          <div className="flex-1 p-4 overflow-y-auto">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-6xl mb-4">📅</span>
                <p className="text-lg font-medium">No events</p>
                <p className="text-sm">Tap + to add an event</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate)
                  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 ${event.color} rounded-full mt-1`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <span className="text-sm text-gray-500">
                              {getCategoryIcon(event.category)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span>🕐 {formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                            {event.recurring !== 'none' && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{getRecurringIcon(event.recurring)} Recurring {event.recurring}</span>
                              </>
                            )}
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-800 mt-2">{event.description}</p>
                          )}
                          {event.reminder && (
                            <div className="flex items-center mt-2">
                              <Badge className="bg-yellow-100 text-yellow-800">
                                🔔 {event.reminder < 60 ? `${event.reminder}m` : `${Math.floor(event.reminder / 60)}h`} reminder
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'agenda' && (
        <div className="agenda-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setActiveView('month')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">Agenda</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100"
              onClick={() => setActiveView('add')}
            >
              ➕
            </Button>
          </div>

          {/* Upcoming Events */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
            {getUpcomingEvents().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <span className="text-6xl mb-4">🗓️</span>
                <p className="text-lg font-medium">No upcoming events</p>
                <p className="text-sm">Your schedule is clear!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-center min-w-16">
                        <div className="text-2xl font-bold text-gray-900">
                          {event.startDate.getDate()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {event.startDate.toLocaleDateString([], { month: 'short' })}
                        </div>
                      </div>
                      <div className={`w-1 ${event.color} rounded-full self-stretch`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <span className="text-lg">
                            {getCategoryIcon(event.category)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>🕐 {formatTime(event.startDate)}</span>
                          {event.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span>📍 {event.location}</span>
                            </>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-800 mt-2">{event.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            {event.recurring !== 'none' && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {getRecurringIcon(event.recurring)} {event.recurring}
                              </Badge>
                            )}
                            {event.reminder && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                🔔 {event.reminder < 60 ? `${event.reminder}m` : `${Math.floor(event.reminder / 60)}h`}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(event.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'add' && (
        <div className="add-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setActiveView('month')}
              >
                ✕
              </Button>
              <h1 className="text-lg font-semibold">New Event</h1>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddEvent}
              disabled={!newEventTitle.trim()}
            >
              Save
            </Button>
          </div>

          {/* Event Form */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  type="text"
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'work', icon: '💼', label: 'Work' },
                    { id: 'personal', icon: '👤', label: 'Personal' },
                    { id: 'appointment', icon: '🏥', label: 'Appointment' },
                    { id: 'reminder', icon: '⏰', label: 'Reminder' },
                    { id: 'birthday', icon: '🎂', label: 'Birthday' },
                    { id: 'holiday', icon: '🎄', label: 'Holiday' }
                  ].map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <span className="text-2xl mb-1">{category.icon}</span>
                      <span className="text-xs">{category.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (optional)</label>
                <Input
                  type="text"
                  placeholder="Add location"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  placeholder="Add description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="0">None</option>
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              {!isNetworkConnected && (
                <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded">
                  <p className="text-orange-700 text-sm">
                    📶 Network required to sync events across devices
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="event-details w-full bg-white rounded-t-2xl max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600"
                onClick={() => {
                  setShowEventDetails(false)
                  setSelectedEvent(null)
                }}
              >
                ✕
              </Button>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(selectedEvent.category)}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedEvent.startDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📍</span>
                  <p className="text-gray-700">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📝</span>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.recurring !== 'none' && (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getRecurringIcon(selectedEvent.recurring)}</span>
                  <p className="text-gray-700">Repeats {selectedEvent.recurring}</p>
                </div>
              )}

              {selectedEvent.reminder && (
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🔔</span>
                  <p className="text-gray-700">
                    Reminder {selectedEvent.reminder < 60 ? `${selectedEvent.reminder} minutes` : `${Math.floor(selectedEvent.reminder / 60)} hours`} before
                  </p>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start space-x-3">
                  <span className="text-xl">👥</span>
                  <div>
                    <p className="text-gray-700 font-medium">Attendees</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <p key={index}>{attendee}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onHaptic(50)
                    console.log('Editing event:', selectedEvent.id)
                  }}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onHaptic(50)
                    console.log('Sharing event:', selectedEvent.id)
                  }}
                  disabled={!isNetworkConnected}
                >
                  📤 Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onHaptic(100)
                    console.log('Deleting event:', selectedEvent.id)
                  }}
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}