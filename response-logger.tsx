'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getTranslation } from '@/lib/translations'

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  avatar: string
  favorite: boolean
}

interface ContactsAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

const CONTACTS: Contact[] = [
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

export default function ContactsApp({ language, onBack, onHaptic, isNetworkConnected }: ContactsAppProps): JSX.Element {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.contacts-container', 'slideInRight')
  }, [])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  )

  const favoriteContacts = filteredContacts.filter(contact => contact.favorite)
  const otherContacts = filteredContacts.filter(contact => !contact.favorite)

  const handleContactSelect = (contact: Contact): void => {
    onHaptic(50)
    setSelectedContact(contact)
    setCurrentView('detail')
    animate('.contact-detail', 'slideInRight')
  }

  const handleBackToList = (): void => {
    onHaptic(30)
    setCurrentView('list')
    setSelectedContact(null)
    animate('.contacts-list', 'slideInLeft')
  }

  const handleCall = (contact: Contact): void => {
    onHaptic(100)
    animate('.call-button', 'pulse')
    // Simulate call - always works regardless of network
  }

  const handleMessage = (contact: Contact): void => {
    onHaptic(50)
    if (!isNetworkConnected) {
      animate('.network-required', 'shake')
      return
    }
    animate('.message-button', 'pulse')
  }

  const handleEmail = (contact: Contact): void => {
    onHaptic(50)
    if (!isNetworkConnected) {
      animate('.network-required', 'shake')
      return
    }
    animate('.email-button', 'pulse')
  }

  const toggleFavorite = (contactId: string): void => {
    onHaptic(30)
    setContacts(prev => prev.map(contact =>
      contact.id === contactId ? { ...contact, favorite: !contact.favorite } : contact
    ))
    animate('.favorite-toggle', 'bounce')
  }

  const renderContactsList = (): JSX.Element => (
    <div className="contacts-list h-full">
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
            <h1 className="text-lg font-semibold">{t.appNames.contacts}</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              ➕
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              ⋮
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <Input
          placeholder={`${t.search} ${t.appNames.contacts.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder-white/70"
        />
      </div>

      {/* Network Status */}
      {!isNetworkConnected && (
        <div className="network-required bg-orange-50 border-l-4 border-orange-400 p-3">
          <div className="flex items-center">
            <span className="text-orange-600 mr-2">⚠️</span>
            <p className="text-sm text-orange-700">
              {t.connectFirst} - Only calling is available offline
            </p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
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

  const renderContactDetail = (): JSX.Element => (
    <div className="contact-detail h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mr-3"
          onClick={handleBackToList}
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
                  <h2 className="text-xl font-bold text-gray-900">{selectedContact.name}</h2>
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
              <div className="grid grid-cols-3 gap-3">
                <Button
                  className="call-button flex flex-col items-center py-4 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleCall(selectedContact)}
                >
                  <span className="text-2xl mb-1">📞</span>
                  <span className="text-sm">Call</span>
                </Button>
                
                <Button
                  variant={isNetworkConnected ? "default" : "outline"}
                  className={`message-button flex flex-col items-center py-4 ${
                    isNetworkConnected 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => handleMessage(selectedContact)}
                  disabled={!isNetworkConnected}
                >
                  <span className="text-2xl mb-1">💬</span>
                  <span className="text-sm">Message</span>
                </Button>
                
                <Button
                  variant={isNetworkConnected ? "default" : "outline"}
                  className={`email-button flex flex-col items-center py-4 ${
                    isNetworkConnected 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => handleEmail(selectedContact)}
                  disabled={!isNetworkConnected}
                >
                  <span className="text-2xl mb-1">✉️</span>
                  <span className="text-sm">Email</span>
                </Button>
              </div>

              {!isNetworkConnected && (
                <div className="network-required mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 text-center">
                    🌐 {t.connectFirst} to send messages and emails
                  </p>
                </div>
              )}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`contacts-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {currentView === 'list' ? renderContactsList() : renderContactDetail()}
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
      className={`contact-card-${index} bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200`}
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
          </div>
          <p className="text-sm text-gray-600 truncate">{contact.phone}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-50"
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