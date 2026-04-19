'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface WhatsAppInterfaceProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
}

export default function WhatsAppInterface({ language, onBack, onHaptic }: WhatsAppInterfaceProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.whatsapp-maintenance', 'zoomIn')
  }, [])

  const handleUseContacts = (): void => {
    onHaptic(50)
    // Redirect to contacts - navigate to contacts through the back mechanism
    // This will go back to home, then user can click on contacts
    onBack()
    
    // After a short delay, trigger contacts app
    setTimeout(() => {
      // Dispatch a custom event to open contacts
      document.dispatchEvent(new CustomEvent('openContacts'))
    }, 500)
  }

  return (
    <div className={`whatsapp-maintenance h-full bg-white relative overflow-hidden ${isVisible ? 'animate__animated' : ''}`}>
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-red-200/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-yellow-200/20 rounded-full animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={onBack}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">WhatsApp</h1>
        </div>
        <div className="flex items-center">
          <span className="text-2xl mr-2">💬</span>
        </div>
      </div>

      {/* Maintenance Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          {/* Maintenance Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t.whatsappMaintenance.title}
            </h2>
          </div>

          {/* Maintenance Message */}
          <div className="mb-8">
            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
              {t.whatsappMaintenance.message}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-semibold text-base">
                {t.whatsappMaintenance.useContacts}
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-sm">
                {t.whatsappMaintenance.returnDate}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUseContacts}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <span className="mr-2">📞</span>
              {t.whatsappMaintenance.okButton}
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 py-3 px-6 text-base rounded-xl transition-all duration-200"
            >
              <span className="mr-2">🏠</span>
              {t.back}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 text-center">
        <p className="text-gray-500 text-sm">
          🔄 AIdroid Version 2.0.0 - {t.whatsappMaintenance.returnDate}
        </p>
      </div>
    </div>
  )
}