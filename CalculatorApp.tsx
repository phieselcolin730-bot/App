'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
]

interface LanguageSelectionProps {
  onLanguageSelect: (language: string) => void
  onHaptic: (duration?: number) => void
}

export default function LanguageSelection({ onLanguageSelect, onHaptic }: LanguageSelectionProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    setIsVisible(true)
    animate('.language-container', 'fadeInUp')
  }, [])

  const handleLanguageSelect = (language: typeof LANGUAGES[0]): void => {
    onHaptic(50)
    setSelectedLanguage(language.code)
    animate('.language-item-selected', 'pulse').then(() => {
      setTimeout(() => onLanguageSelect(language.name), 300)
    })
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Select Language</h1>
        <p className="text-blue-200 text-sm">Choose your preferred language</p>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <Input
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
        />
      </div>

      {/* Language List */}
      <div className={`language-container flex-1 px-6 pb-6 ${isVisible ? 'animate__animated' : ''}`}>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {filteredLanguages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className={`w-full justify-start p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-200 ${
                  selectedLanguage === language.code ? 'language-item-selected bg-blue-500/30 border-blue-400' : ''
                }`}
                onClick={() => handleLanguageSelect(language)}
              >
                <span className="text-2xl mr-3">{language.flag}</span>
                <div>
                  <div className="text-white font-medium">{language.name}</div>
                  <div className="text-white/60 text-sm">{language.code.toUpperCase()}</div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}