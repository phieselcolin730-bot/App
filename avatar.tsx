'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  avatar: string
  favorite: boolean
  isEmergency?: boolean
}

interface PhoneAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
  onStartCall: (contactName: string, contactAvatar: string) => void
}

const CONTACTS: Contact[] = [
  {
    id: 'police',
    name: 'Police Emergency',
    phone: '991',
    email: 'emergency@police.gov',
    avatar: '🚔',
    favorite: true,
    isEmergency: true
  },
  {
    id: '1',
    name: 'Mom',
    phone: '+1 (555) 123-4567',
    email: 'mom@family.com',
    avatar: '👩‍💼',
    favorite: true
  },
  {
    id: '2',
    name: 'Dad',
    phone: '+1 (555) 234-5678',
    email: 'dad@family.com',
    avatar: '👨‍💻',
    favorite: true
  },
  {
    id: '3',
    name: 'Alex Johnson',
    phone: '+1 (555) 345-6789',
    email: 'alex.johnson@email.com',
    avatar: '🎮',
    favorite: false
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    phone: '+1 (555) 456-7890',
    email: 'sarah.wilson@email.com',
    avatar: '📚',
    favorite: true
  },
  {
    id: '5',
    name: 'Emma Davis',
    phone: '+1 (555) 567-8901',
    email: 'emma.davis@email.com',
    avatar: '🎵',
    favorite: false
  },
  {
    id: '6',
    name: 'Mike Brown',
    phone: '+1 (555) 678-9012',
    email: 'mike.brown@email.com',
    avatar: '🏃‍♂️',
    favorite: false
  },
  {
    id: '7',
    name: 'Lisa Martinez',
    phone: '+1 (555) 789-0123',
    email: 'lisa.martinez@email.com',
    avatar: '🍕',
    favorite: false
  },
  {
    id: '8',
    name: 'Work Emergency',
    phone: '+1 (555) 911-2345',
    email: 'emergency@work.com',
    avatar: '🚨',
    favorite: true
  },
  {
    id: '9',
    name: 'Dr. Smith',
    phone: '+1 (555) 234-9876',
    email: 'dr.smith@medical.com',
    avatar: '👩‍⚕️',
    favorite: false
  },
  {
    id: '10',
    name: 'John Tech Support',
    phone: '+1 (555) 987-6543',
    email: 'john@techsupport.com',
    avatar: '👨‍💻',
    favorite: false
  }
]

export default function PhoneApp({ language, onBack, onHaptic, isNetworkConnected, onStartCall }: PhoneAppProps): JSX.Element {
  const [currentView, setCurrentView] = useState<'dialer' | 'contacts' | 'recents' | 'detail'>('dialer')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dialNumber, setDialNumber] = useState<string>('')
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [recentCalls, setRecentCalls] = useState<Array<{
    id: string
    contact: Contact
    timestamp: Date
    type: 'incoming' | 'outgoing' | 'missed'
    duration?: number
  }>>([])
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.phone-container', 'slideInUp')
  }, [])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  )

  const favoriteContacts = filteredContacts.filter(contact => contact.favorite)
  const emergencyContacts = filteredContacts.filter(contact => contact.isEmergency)
  const otherContacts = filteredContacts.filter(contact => !contact.favorite && !contact.isEmergency)

  const handleContactSelect = (contact: Contact): void => {
    onHaptic(50)
    setSelectedContact(contact)
    setCurrentView('detail')
    animate('.contact-detail', 'slideInRight')
  }

  const handleBackToView = (view: 'dialer' | 'contacts' | 'recents'): void => {
    onHaptic(30)
    setCurrentView(view)
    setSelectedContact(null)
    animate('.phone-content', 'slideInLeft')
  }

  const handleCall = (contact: Contact): void => {
    onHaptic(150)
    
    // Special handling for emergency 991
    if (contact.phone === '991' || contact.isEmergency) {
      animate('.emergency-call', 'flash')
      // Add to recent calls
      setRecentCalls(prev => [{
        id: Date.now().toString(),
        contact,
        timestamp: new Date(),
        type: 'outgoing'
      }, ...prev.slice(0, 19)])
    } else {
      // Add to recent calls
      setRecentCalls(prev => [{
        id: Date.now().toString(),
        contact,
        timestamp: new Date(),
        type: 'outgoing'
      }, ...prev.slice(0, 19)])
    }
    
    // Start the call interface
    onStartCall(contact.name, contact.avatar)
    animate('.call-button', 'pulse')
  }

  const handleDialpadInput = (digit: string): void => {
    onHaptic(30)
    setDialNumber(prev => prev + digit)
    animate(`.dialpad-${digit}`, 'bounceIn')
  }

  const handleDialpadCall = (): void => {
    if (!dialNumber) return
    
    onHaptic(150)
    
    // Check if it's emergency number
    const isEmergency = dialNumber === '991' || dialNumber === '999' || dialNumber === '911'
    
    const tempContact: Contact = {
      id: 'dialed-' + Date.now(),
      name: isEmergency ? 'Emergency Services' : dialNumber,
      phone: dialNumber,
      email: isEmergency ? 'emergency@services.com' : '',
      avatar: isEmergency ? '🚨' : '☎️',
      favorite: false,
      isEmergency
    }
    
    // Add to recent calls
    setRecentCalls(prev => [{
      id: Date.now().toString(),
      contact: tempContact,
      timestamp: new Date(),
      type: 'outgoing'
    }, ...prev.slice(0, 19)])
    
    onStartCall(tempContact.name, tempContact.avatar)
    setDialNumber('')
  }

  const handleDialpadDelete = (): void => {
    onHaptic(40)
    setDialNumber(prev => prev.slice(0, -1))
    animate('.delete-button', 'pulse')
  }

  const toggleFavorite = (contactId: string): void => {
    onHaptic(30)
    setContacts(prev => prev.map(contact =>
      contact.id === contactId ? { ...contact, favorite: !contact.favorite } : contact
    ))
    animate('.favorite-toggle', 'bounce')
  }

  const renderDialer = (): JSX.Element => (
    <div className="dialer h-full flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 mr-2"
              onClick={onBack}
            >
              ←
            </Button>
            <h1 className="text-lg font-semibold">📞 Phone</h1>
          </div>
        </div>
      </div>

      {/* Number Display */}
      <div className="bg-gray-50 p-6 text-center">
        <div className="text-2xl font-mono mb-2 min-h-[32px] text-gray-800">
          {dialNumber || 'Enter number'}
        </div>
        {dialNumber === '991' && (
          <Badge className="emergency-call bg-red-600 text-white animate-pulse">
            🚨 EMERGENCY CALL
          </Badge>
        )}
      </div>

      {/* Dialpad */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
            <Button
              key={digit}
              className={`dialpad-${digit} w-16 h-16 text-2xl font-bold bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}
              onClick={() => handleDialpadInput(digit)}
            >
              {digit}
            </Button>
          ))}
        </div>
      </div>

      {/* Call Actions */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleDialpadCall}
            disabled={!dialNumber}
            className={`call-button w-16 h-16 rounded-full text-3xl ${
              dialNumber === '991' 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white shadow-lg disabled:opacity-50`}
          >
            📞
          </Button>
          <Button
            onClick={handleDialpadDelete}
            disabled={!dialNumber}
            className="delete-button w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 text-white text-2xl shadow-lg disabled:opacity-50"
          >
            ⌫
          </Button>
        </div>
      </div>
    </div>
  )

  const renderContacts = (): JSX.Element => (
    <div className="contacts h-full flex flex-col">
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
            <h1 className="text-lg font-semibold">👥 Contacts</h1>
          </div>
        </div>
        
        {/* Search */}
        <Input
          placeholder={`${t.search} contacts...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder-white/70"
        />
      </div>

      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                <span className="mr-2">🚨</span>
                Emergency
              </h3>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    index={index}
                    onSelect={handleContactSelect}
                    onCall={handleCall}
                    onToggleFavorite={toggleFavorite}
                    isNetworkConnected={isNetworkConnected}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favoriteContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">⭐</span>
                Favorites
              </h3>
              <div className="space-y-2">
                {favoriteContacts.map((contact, index) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    index={index}
                    onSelect={handleContactSelect}
                    onCall={handleCall}
                    onToggleFavorite={toggleFavorite}
                    isNetworkConnected={isNetworkConnected}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Contacts */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              All Contacts ({otherContacts.length})
            </h3>
            <div className="space-y-2">
              {otherContacts.map((contact, index) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  index={index}
                  onSelect={handleContactSelect}
                  onCall={handleCall}
                  onToggleFavorite={toggleFavorite}
                  isNetworkConnected={isNetworkConnected}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  const renderRecents = (): JSX.Element => (
    <div className="recents h-full flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={onBack}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">🕒 Recent Calls</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
          {recentCalls.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">📞</div>
              <p>No recent calls</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleCall(call.contact)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 bg-gray-200">
                        <AvatarFallback className="text-lg">{call.contact.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          {call.contact.name}
                          {call.contact.isEmergency && (
                            <Badge className="ml-2 bg-red-500 text-white text-xs">EMERGENCY</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{call.contact.phone}</p>
                        <p className="text-xs text-gray-400">
                          {call.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${
                        call.type === 'outgoing' ? 'text-green-600' : 
                        call.type === 'incoming' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {call.type === 'outgoing' ? '📞' : call.type === 'incoming' ? '📱' : '📵'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCall(call.contact)
                        }}
                      >
                        📞
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const renderContactDetail = (): JSX.Element => (
    <div className="contact-detail h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mr-3"
          onClick={() => handleBackToView('contacts')}
        >
          ←
        </Button>
        <h1 className="text-lg font-semibold">Contact Details</h1>
      </div>

      <div className="flex-1 bg-gray-50">
        {selectedContact && (
          <div className="p-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16 bg-gray-200">
                  <AvatarFallback className="text-2xl">{selectedContact.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedContact.name}</h2>
                    {selectedContact.isEmergency && (
                      <Badge className="bg-red-500 text-white">EMERGENCY</Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedContact.phone}</p>
                  <p className="text-gray-600">{selectedContact.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="favorite-toggle"
                  onClick={() => toggleFavorite(selectedContact.id)}
                >
                  {selectedContact.favorite ? '⭐' : '☆'}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  className={`call-button flex items-center justify-center py-4 text-white ${
                    selectedContact.isEmergency 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={() => handleCall(selectedContact)}
                >
                  <span className="text-2xl mr-3">📞</span>
                  <span className="text-lg">
                    {selectedContact.isEmergency ? 'Emergency Call' : 'Call'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{selectedContact.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{selectedContact.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorite</span>
                  <span className="font-medium">{selectedContact.favorite ? 'Yes' : 'No'}</span>
                </div>
                {selectedContact.isEmergency && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <Badge className="bg-red-500 text-white">Emergency Contact</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`phone-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {/* Tab Navigation */}
      {(currentView === 'dialer' || currentView === 'contacts' || currentView === 'recents') && (
        <div className="bg-white border-b border-gray-200 flex">
          <Button
            variant={currentView === 'dialer' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'dialer' ? 'bg-green-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('dialer')}
          >
            <span className="mr-2">⌨️</span>
            Keypad
          </Button>
          <Button
            variant={currentView === 'contacts' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'contacts' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('contacts')}
          >
            <span className="mr-2">👥</span>
            Contacts
          </Button>
          <Button
            variant={currentView === 'recents' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'recents' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('recents')}
          >
            <span className="mr-2">🕒</span>
            Recent
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="phone-content flex-1">
        {currentView === 'dialer' && renderDialer()}
        {currentView === 'contacts' && renderContacts()}
        {currentView === 'recents' && renderRecents()}
        {currentView === 'detail' && renderContactDetail()}
      </div>
    </div>
  )
}

interface ContactCardProps {
  contact: Contact
  index: number
  onSelect: (contact: Contact) => void
  onCall: (contact: Contact) => void
  onToggleFavorite: (contactId: string) => void
  isNetworkConnected: boolean
}

function ContactCard({ contact, index, onSelect, onCall, onToggleFavorite, isNetworkConnected }: ContactCardProps): JSX.Element {
  return (
    <div
      className={`contact-card-${index} bg-white rounded-lg p-4 shadow-sm border ${
        contact.isEmergency ? 'border-red-200 bg-red-50' : 'border-gray-100'
      } cursor-pointer hover:shadow-md transition-shadow duration-200`}
      onClick={() => onSelect(contact)}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12 bg-gray-200">
          <AvatarFallback className="text-lg">{contact.avatar}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
            {contact.favorite && <span className="text-yellow-500 text-sm">⭐</span>}
            {contact.isEmergency && <Badge className="bg-red-500 text-white text-xs">EMERGENCY</Badge>}
          </div>
          <p className="text-sm text-gray-600 truncate">{contact.phone}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`${contact.isEmergency ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
          onClick={(e) => {
            e.stopPropagation()
            onCall(contact)
          }}
        >
          📞
        </Button>
      </div>
    </div>
  )
}