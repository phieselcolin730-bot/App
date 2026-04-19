'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface MessagesAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: number
  isOutgoing: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  contactName: string
  contactNumber: string
  lastMessage: string
  timestamp: number
  unreadCount: number
  messages: Message[]
  avatar: string
}

export default function MessagesApp({ language, onBack, onHaptic, isNetworkConnected }: MessagesAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'conversations' | 'chat'>('conversations')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const t = getTranslation(language)

  // Sample conversations data
  useEffect(() => {
    const sampleConversations: Conversation[] = [
      {
        id: '1',
        contactName: 'Emma Wilson',
        contactNumber: '+1-555-0123',
        lastMessage: 'Hey! Are we still meeting tomorrow?',
        timestamp: Date.now() - 300000, // 5 minutes ago
        unreadCount: 2,
        avatar: '👩‍💼',
        messages: [
          {
            id: '1',
            sender: 'Emma Wilson',
            content: 'Hi! How are you doing?',
            timestamp: Date.now() - 3600000,
            isOutgoing: false,
            status: 'read'
          },
          {
            id: '2',
            sender: 'You',
            content: 'I\'m good, thanks! Just working on some projects.',
            timestamp: Date.now() - 3500000,
            isOutgoing: true,
            status: 'read'
          },
          {
            id: '3',
            sender: 'Emma Wilson',
            content: 'That sounds great! What kind of projects?',
            timestamp: Date.now() - 3400000,
            isOutgoing: false,
            status: 'read'
          },
          {
            id: '4',
            sender: 'Emma Wilson',
            content: 'Hey! Are we still meeting tomorrow?',
            timestamp: Date.now() - 300000,
            isOutgoing: false,
            status: 'delivered'
          }
        ]
      },
      {
        id: '2',
        contactName: 'James Rodriguez',
        contactNumber: '+1-555-0456',
        lastMessage: 'Perfect! See you then 👍',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        unreadCount: 0,
        avatar: '👨‍💻',
        messages: [
          {
            id: '5',
            sender: 'You',
            content: 'Want to grab lunch later?',
            timestamp: Date.now() - 2100000,
            isOutgoing: true,
            status: 'read'
          },
          {
            id: '6',
            sender: 'James Rodriguez',
            content: 'Perfect! See you then 👍',
            timestamp: Date.now() - 1800000,
            isOutgoing: false,
            status: 'read'
          }
        ]
      },
      {
        id: '3',
        contactName: 'Sarah Chen',
        contactNumber: '+1-555-0789',
        lastMessage: 'Thanks for your help! 🙏',
        timestamp: Date.now() - 7200000, // 2 hours ago
        unreadCount: 0,
        avatar: '👩‍🎨',
        messages: [
          {
            id: '7',
            sender: 'Sarah Chen',
            content: 'Could you help me with the design?',
            timestamp: Date.now() - 7500000,
            isOutgoing: false,
            status: 'read'
          },
          {
            id: '8',
            sender: 'You',
            content: 'Of course! I\'ll send you some ideas.',
            timestamp: Date.now() - 7300000,
            isOutgoing: true,
            status: 'read'
          },
          {
            id: '9',
            sender: 'Sarah Chen',
            content: 'Thanks for your help! 🙏',
            timestamp: Date.now() - 7200000,
            isOutgoing: false,
            status: 'read'
          }
        ]
      },
      {
        id: '4',
        contactName: 'AIdroid System',
        contactNumber: '+1-800-AIDROID',
        lastMessage: 'Welcome to AIdroid! Your device is ready to use.',
        timestamp: Date.now() - 86400000, // 1 day ago
        unreadCount: 0,
        avatar: '🤖',
        messages: [
          {
            id: '10',
            sender: 'AIdroid System',
            content: 'Welcome to AIdroid! Your device is ready to use.',
            timestamp: Date.now() - 86400000,
            isOutgoing: false,
            status: 'read'
          }
        ]
      }
    ]
    
    setConversations(sampleConversations)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    animate('.messages-container', 'slideInRight')
  }, [])

  useEffect(() => {
    if (activeView === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.messages, activeView])

  const formatTime = (timestamp: number): string => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diff = now.getTime() - messageTime.getTime()
    
    if (diff < 60000) { // Less than 1 minute
      return 'now'
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m`
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h`
    } else {
      return messageTime.toLocaleDateString()
    }
  }

  const handleConversationClick = (conversation: Conversation): void => {
    onHaptic(30)
    setSelectedConversation(conversation)
    setActiveView('chat')
    animate('.chat-view', 'slideInRight')
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ))
  }

  const handleSendMessage = (): void => {
    if (!newMessage.trim() || !selectedConversation) return
    
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }
    
    onHaptic(50)
    const messageId = Date.now().toString()
    
    const newMsg: Message = {
      id: messageId,
      sender: 'You',
      content: newMessage.trim(),
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'sending'
    }
    
    // Add message to conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        const updatedConv = {
          ...conv,
          lastMessage: newMessage.trim(),
          timestamp: Date.now(),
          messages: [...conv.messages, newMsg]
        }
        setSelectedConversation(updatedConv)
        return updatedConv
      }
      return conv
    }))
    
    setNewMessage('')
    animate('.send-button', 'pulse')
    
    // Simulate message status updates
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          const updatedConv = {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
            )
          }
          setSelectedConversation(updatedConv)
          return updatedConv
        }
        return conv
      }))
    }, 1000)
    
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          const updatedConv = {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'delivered' as const } : msg
            )
          }
          setSelectedConversation(updatedConv)
          return updatedConv
        }
        return conv
      }))
    }, 2000)
    
    // Simulate auto-reply after 3 seconds
    setTimeout(() => {
      if (selectedConversation.contactName !== 'AIdroid System') {
        handleAutoReply()
      }
    }, 3000)
  }

  const handleAutoReply = (): void => {
    if (!selectedConversation) return
    
    const replies = [
      'Thanks for your message!',
      'Got it! 👍',
      'I\'ll get back to you soon.',
      'Sounds good!',
      'Perfect!',
      'That works for me 😊',
      'Great idea!',
      'I agree completely.',
      'Let me think about it.',
      'Absolutely!'
    ]
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    
    const replyMsg: Message = {
      id: `reply_${Date.now()}`,
      sender: selectedConversation.contactName,
      content: randomReply,
      timestamp: Date.now(),
      isOutgoing: false,
      status: 'delivered'
    }
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        const updatedConv = {
          ...conv,
          lastMessage: randomReply,
          timestamp: Date.now(),
          unreadCount: conv.unreadCount + 1,
          messages: [...conv.messages, replyMsg]
        }
        setSelectedConversation(updatedConv)
        return updatedConv
      }
      return conv
    }))
    
    onHaptic(30)
    animate('.chat-messages', 'pulse')
  }

  const handleBackToConversations = (): void => {
    onHaptic(30)
    setActiveView('conversations')
    setSelectedConversation(null)
    animate('.conversations-list', 'slideInLeft')
  }

  const getMessageStatusIcon = (status: Message['status']): string => {
    switch (status) {
      case 'sending': return '🕐'
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'read': return '✓✓'
      default: return ''
    }
  }

  return (
    <div className={`messages-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {activeView === 'conversations' ? (
        // Conversations List View
        <div className="conversations-list h-full flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={onBack}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">{t.appNames?.messages || 'Messages'}</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                🔍
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                ✏️
              </Button>
            </div>
          </div>

          {/* Network Warning */}
          {!isNetworkConnected && (
            <div className="network-warning bg-orange-100 border-l-4 border-orange-500 p-3">
              <p className="text-orange-700 text-sm">
                📶 {t.networkRequired || 'Network connection required for messaging'}
              </p>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-6xl mb-4">💬</span>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation to get started!</p>
              </div>
            ) : (
              conversations
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="p-4 flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                        {conversation.avatar}
                      </div>
                      
                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.contactName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      
                      {/* Unread Badge */}
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white min-w-6 h-6 rounded-full text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="chat-view h-full flex flex-col">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={handleBackToConversations}
              >
                ←
              </Button>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg mr-3">
                {selectedConversation?.avatar}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedConversation?.contactName}</h2>
                <p className="text-xs text-green-100">{selectedConversation?.contactNumber}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                📞
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                ℹ️
              </Button>
            </div>
          </div>

          {/* Network Warning */}
          {!isNetworkConnected && (
            <div className="network-warning bg-orange-100 border-l-4 border-orange-500 p-2">
              <p className="text-orange-700 text-xs">
                📶 Connect to network to send messages
              </p>
            </div>
          )}

          {/* Chat Messages */}
          <div className="chat-messages flex-1 overflow-y-auto p-4 bg-gray-50">
            {selectedConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.isOutgoing
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    message.isOutgoing ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.isOutgoing && (
                      <span className={message.status === 'read' ? 'text-blue-200' : ''}>
                        {getMessageStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                📎
              </Button>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                  className="pr-20"
                  disabled={!isNetworkConnected}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    😊
                  </Button>
                </div>
              </div>
              <Button
                className="send-button bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 p-0"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isNetworkConnected}
              >
                📤
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}