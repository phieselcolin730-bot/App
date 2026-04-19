'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/translations'

interface BrowserAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Website {
  id: string
  name: string
  url: string
  favicon: string
  category: string
  description: string
}

interface BookmarkItem {
  id: string
  name: string
  url: string
  favicon: string
  timestamp: Date
}

interface HistoryItem {
  id: string
  url: string
  title: string
  favicon: string
  timestamp: Date
}

const POPULAR_WEBSITES: Website[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com',
    favicon: '🔍',
    category: 'Search',
    description: 'Search the web'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    favicon: '📺',
    category: 'Video',
    description: 'Watch videos online'
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    favicon: '🐙',
    category: 'Development',
    description: 'Code repositories'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    favicon: '📚',
    category: 'Education',
    description: 'Free encyclopedia'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com',
    favicon: '🤖',
    category: 'Social',
    description: 'The front page of the internet'
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    favicon: '💻',
    category: 'Development',
    description: 'Programming Q&A'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    url: 'https://twitter.com',
    favicon: '🐦',
    category: 'Social',
    description: 'Social media platform'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    url: 'https://www.amazon.com',
    favicon: '📦',
    category: 'Shopping',
    description: 'Online shopping'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    url: 'https://www.netflix.com',
    favicon: '🎬',
    category: 'Entertainment',
    description: 'Streaming service'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    url: 'https://www.spotify.com',
    favicon: '🎵',
    category: 'Music',
    description: 'Music streaming'
  }
]

export default function BrowserApp({ language, onBack, onHaptic, isNetworkConnected }: BrowserAppProps): JSX.Element {
  const [currentView, setCurrentView] = useState<'home' | 'browser' | 'bookmarks' | 'history'>('home')
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
    {
      id: '1',
      name: 'OharaAI',
      url: 'https://ohara.ai',
      favicon: '🤖',
      timestamp: new Date()
    },
    {
      id: '2',
      name: 'Google',
      url: 'https://www.google.com',
      favicon: '🔍',
      timestamp: new Date()
    }
  ])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [canGoBack, setCanGoBack] = useState<boolean>(false)
  const [canGoForward, setCanGoForward] = useState<boolean>(false)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.browser-container', 'slideInUp')
  }, [])

  const handleNavigate = (url: string): void => {
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }

    onHaptic(50)
    setIsLoading(true)
    setCurrentUrl(url)
    setCurrentView('browser')
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      url,
      title: getWebsiteTitle(url),
      favicon: getWebsiteFavicon(url),
      timestamp: new Date()
    }
    setHistory(prev => [historyItem, ...prev.slice(0, 49)])
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      animate('.website-content', 'fadeIn')
    }, 1500 + Math.random() * 1000)
  }

  const handleSearch = (): void => {
    if (!searchInput.trim()) return
    
    // Check if it's a URL or search term
    const isUrl = searchInput.includes('.') || searchInput.startsWith('http')
    const finalUrl = isUrl ? 
      (searchInput.startsWith('http') ? searchInput : `https://${searchInput}`) :
      `https://www.google.com/search?q=${encodeURIComponent(searchInput)}`
    
    handleNavigate(finalUrl)
    setSearchInput('')
  }

  const getWebsiteTitle = (url: string): string => {
    const website = POPULAR_WEBSITES.find(site => url.includes(site.url.replace('https://www.', '')))
    return website ? website.name : new URL(url).hostname
  }

  const getWebsiteFavicon = (url: string): string => {
    const website = POPULAR_WEBSITES.find(site => url.includes(site.url.replace('https://www.', '')))
    return website ? website.favicon : '🌐'
  }

  const addBookmark = (url: string): void => {
    onHaptic(50)
    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      name: getWebsiteTitle(url),
      url,
      favicon: getWebsiteFavicon(url),
      timestamp: new Date()
    }
    setBookmarks(prev => [bookmark, ...prev])
    animate('.bookmark-button', 'bounceIn')
  }

  const removeBookmark = (id: string): void => {
    onHaptic(30)
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id))
    animate(`.bookmark-${id}`, 'fadeOut')
  }

  const isBookmarked = (url: string): boolean => {
    return bookmarks.some(bookmark => bookmark.url === url)
  }

  const renderHome = (): JSX.Element => (
    <div className="browser-home h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
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
            <h1 className="text-lg font-semibold">🌐 Browser</h1>
          </div>
          <Badge className={isNetworkConnected ? 'bg-green-500' : 'bg-red-500'}>
            {isNetworkConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex space-x-2">
          <Input
            placeholder="Search or enter URL..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
            disabled={!isNetworkConnected}
          />
          <Button
            onClick={handleSearch}
            disabled={!searchInput.trim() || !isNetworkConnected}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔍
          </Button>
        </div>
        
        {!isNetworkConnected && (
          <div className="network-warning mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-orange-700">
              <span className="mr-2">⚠️</span>
              <p className="text-sm">Connect to network to browse the internet</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Quick Access */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Popular Websites</h2>
            <div className="grid grid-cols-2 gap-3">
              {POPULAR_WEBSITES.slice(0, 6).map((website) => (
                <Button
                  key={website.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center text-center hover:bg-gray-50 disabled:opacity-60"
                  onClick={() => handleNavigate(website.url)}
                  disabled={!isNetworkConnected}
                >
                  <div className="text-2xl mb-2">{website.favicon}</div>
                  <div className="font-medium text-sm">{website.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{website.description}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Bookmarks Preview */}
          {bookmarks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Bookmarks</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('bookmarks')}
                  className="text-blue-600"
                >
                  View All →
                </Button>
              </div>
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleNavigate(bookmark.url)}
                  >
                    <div className="text-lg">{bookmark.favicon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{bookmark.name}</div>
                      <div className="text-xs text-gray-500 truncate">{bookmark.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Search', 'Social', 'Shopping', 'Entertainment', 'Education', 'Development'].map((category) => {
                const categoryWebsites = POPULAR_WEBSITES.filter(site => site.category === category)
                return (
                  <div
                    key={category}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <h3 className="font-medium mb-2">{category}</h3>
                    <div className="space-y-1">
                      {categoryWebsites.slice(0, 2).map((site) => (
                        <Button
                          key={site.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-auto p-2 text-left disabled:opacity-60"
                          onClick={() => handleNavigate(site.url)}
                          disabled={!isNetworkConnected}
                        >
                          <span className="mr-2">{site.favicon}</span>
                          <span className="text-sm">{site.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  const renderBrowser = (): JSX.Element => (
    <div className="browser-view h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-gray-100 p-3 border-b">
        <div className="flex items-center space-x-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="text-blue-600"
          >
            🏠
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoBack}
            className="disabled:opacity-50"
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoForward}
            className="disabled:opacity-50"
          >
            →
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(currentUrl)}
          >
            🔄
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center bg-white rounded border px-3 py-2">
            <span className="text-lg mr-2">{getWebsiteFavicon(currentUrl)}</span>
            <span className="text-sm text-gray-600 flex-1 truncate">{currentUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isBookmarked(currentUrl) ? 
                removeBookmark(bookmarks.find(b => b.url === currentUrl)?.id || '') :
                addBookmark(currentUrl)
              }
              className={`bookmark-button ml-2 ${isBookmarked(currentUrl) ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              {isBookmarked(currentUrl) ? '⭐' : '☆'}
            </Button>
          </div>
        </div>
      </div>

      {/* Website Content */}
      <div className="flex-1 bg-white">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <div className="text-gray-600">Loading website...</div>
              <div className="text-sm text-gray-500 mt-2">{currentUrl}</div>
            </div>
          </div>
        ) : (
          <div className="website-content h-full p-6 animate__animated">
            <WebsiteSimulator url={currentUrl} />
          </div>
        )}
      </div>
    </div>
  )

  const renderBookmarks = (): JSX.Element => (
    <div className="bookmarks h-full flex flex-col">
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={() => setCurrentView('home')}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">⭐ Bookmarks</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
          {bookmarks.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">📑</div>
              <p>No bookmarks yet</p>
              <p className="text-sm mt-2">Bookmark your favorite websites while browsing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`bookmark-${bookmark.id} bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => handleNavigate(bookmark.url)}
                    >
                      <div className="text-2xl">{bookmark.favicon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{bookmark.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{bookmark.url}</p>
                        <p className="text-xs text-gray-400">
                          Added {bookmark.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBookmark(bookmark.id)
                      }}
                      className="text-red-500 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const renderHistory = (): JSX.Element => (
    <div className="history h-full flex flex-col">
      <div className="bg-orange-600 text-white p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={() => setCurrentView('home')}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">🕒 History</h1>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">📜</div>
              <p>No browsing history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleNavigate(item.url)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{item.favicon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{item.url}</p>
                      <p className="text-xs text-gray-400">
                        {item.timestamp.toLocaleString()}
                      </p>
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

  return (
    <div className={`browser-container h-full bg-white ${isVisible ? 'animate__animated' : ''}`}>
      {/* Tab Navigation */}
      {(currentView === 'home' || currentView === 'bookmarks' || currentView === 'history') && (
        <div className="bg-white border-b border-gray-200 flex">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('home')}
          >
            <span className="mr-2">🏠</span>
            Home
          </Button>
          <Button
            variant={currentView === 'bookmarks' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'bookmarks' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('bookmarks')}
          >
            <span className="mr-2">⭐</span>
            Bookmarks
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'ghost'}
            className={`flex-1 py-4 rounded-none ${currentView === 'history' ? 'bg-orange-600 text-white' : 'text-gray-600'}`}
            onClick={() => setCurrentView('history')}
          >
            <span className="mr-2">🕒</span>
            History
          </Button>
        </div>
      )}

      {/* Content */}
      {currentView === 'home' && renderHome()}
      {currentView === 'browser' && renderBrowser()}
      {currentView === 'bookmarks' && renderBookmarks()}
      {currentView === 'history' && renderHistory()}
    </div>
  )
}

// Website content simulator
function WebsiteSimulator({ url }: { url: string }): JSX.Element {
  const getSimulatedContent = (): JSX.Element => {
    if (url.includes('google.com')) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">Google</div>
            <div className="max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Search Google or type a URL"
                className="w-full p-3 border rounded-full text-center bg-gray-50"
                readOnly
              />
              <div className="flex justify-center space-x-4 mt-4">
                <button className="px-4 py-2 bg-gray-100 rounded text-sm">Google Search</button>
                <button className="px-4 py-2 bg-gray-100 rounded text-sm">I'm Feeling Lucky</button>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (url.includes('youtube.com')) {
      return (
        <div className="space-y-4">
          <div className="bg-red-600 text-white p-4 rounded flex items-center">
            <div className="text-2xl mr-3">📺</div>
            <div>
              <h1 className="text-xl font-bold">YouTube</h1>
              <p className="text-sm opacity-90">Broadcast Yourself</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {['🎮 Gaming Videos', '🎵 Music', '📰 News', '🍳 Cooking'].map((category, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded">
                <div className="font-medium">{category}</div>
                <div className="text-sm text-gray-600 mt-1">Popular content in this category</div>
              </div>
            ))}
          </div>
        </div>
      )
    } else if (url.includes('github.com')) {
      return (
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-4 rounded flex items-center">
            <div className="text-2xl mr-3">🐙</div>
            <div>
              <h1 className="text-xl font-bold">GitHub</h1>
              <p className="text-sm opacity-90">Where software is built</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="border rounded p-4">
              <div className="font-medium text-blue-600">📁 awesome-project</div>
              <div className="text-sm text-gray-600">A really cool project</div>
              <div className="text-xs text-gray-500 mt-2">⭐ 1.2k stars • Updated 2 days ago</div>
            </div>
            <div className="border rounded p-4">
              <div className="font-medium text-blue-600">📁 mobile-app</div>
              <div className="text-sm text-gray-600">Cross-platform mobile application</div>
              <div className="text-xs text-gray-500 mt-2">⭐ 856 stars • Updated 1 week ago</div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🌐</div>
              <div>
                <h1 className="text-xl font-bold">{new URL(url).hostname}</h1>
                <p className="text-sm text-gray-600">Website simulation</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium mb-2">Welcome to our website!</div>
              <div className="text-sm text-gray-600">
                This is a simulated view of the website. In a real browser, 
                you would see the actual website content here.
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium mb-2">Features</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsive design</li>
                <li>• Fast loading</li>
                <li>• User-friendly interface</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="website-simulator">
      {getSimulatedContent()}
    </div>
  )
}