'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { getTranslation } from '@/lib/translations'

interface MusicAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  cover: string
  genre: string
  year: number
  liked: boolean
}

interface Playlist {
  id: string
  name: string
  songs: string[]
  cover: string
  description: string
}

export default function MusicApp({ language, onBack, onHaptic, isNetworkConnected }: MusicAppProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'library' | 'playlists' | 'player' | 'search'>('library')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [volume, setVolume] = useState<number[]>([75])
  const [shuffle, setShuffle] = useState<boolean>(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [queue, setQueue] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const t = getTranslation(language)

  // Sample music library
  const [songs] = useState<Song[]>([
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Rodriguez',
      album: 'Neon Nights',
      duration: 215,
      cover: '🌙',
      genre: 'Electronic',
      year: 2023,
      liked: true
    },
    {
      id: '2',
      title: 'Ocean Waves',
      artist: 'The Coastal Band',
      album: 'Seaside Stories',
      duration: 198,
      cover: '🌊',
      genre: 'Indie Rock',
      year: 2022,
      liked: false
    },
    {
      id: '3',
      title: 'City Lights',
      artist: 'Metro Sound',
      album: 'Urban Pulse',
      duration: 203,
      cover: '🌆',
      genre: 'Pop',
      year: 2023,
      liked: true
    },
    {
      id: '4',
      title: 'Forest Path',
      artist: 'Nature\'s Echo',
      album: 'Wilderness',
      duration: 187,
      cover: '🌲',
      genre: 'Ambient',
      year: 2021,
      liked: false
    },
    {
      id: '5',
      title: 'Electric Storm',
      artist: 'Thunderbolt',
      album: 'Power Surge',
      duration: 225,
      cover: '⚡',
      genre: 'Rock',
      year: 2022,
      liked: true
    },
    {
      id: '6',
      title: 'Cherry Blossom',
      artist: 'Tokyo Drift',
      album: 'Spring Collection',
      duration: 176,
      cover: '🌸',
      genre: 'Lo-fi',
      year: 2023,
      liked: false
    },
    {
      id: '7',
      title: 'Space Odyssey',
      artist: 'Cosmic Voyager',
      album: 'Beyond Stars',
      duration: 312,
      cover: '🚀',
      genre: 'Synthwave',
      year: 2023,
      liked: true
    },
    {
      id: '8',
      title: 'Golden Hour',
      artist: 'Sunset Collective',
      album: 'Warm Vibes',
      duration: 194,
      cover: '🌅',
      genre: 'Chill',
      year: 2022,
      liked: true
    }
  ])

  const [playlists] = useState<Playlist[]>([
    {
      id: 'favorites',
      name: 'Liked Songs',
      songs: songs.filter(s => s.liked).map(s => s.id),
      cover: '❤️',
      description: 'Your favorite tracks'
    },
    {
      id: 'recent',
      name: 'Recently Played',
      songs: ['1', '3', '5', '8', '2'],
      cover: '🕒',
      description: 'Songs you played recently'
    },
    {
      id: 'chill',
      name: 'Chill Vibes',
      songs: ['4', '6', '8', '1'],
      cover: '😌',
      description: 'Relaxing tunes for any time'
    },
    {
      id: 'workout',
      name: 'Workout Mix',
      songs: ['5', '7', '3', '2'],
      cover: '💪',
      description: 'High-energy tracks to power your workout'
    },
    {
      id: 'discover',
      name: 'Discover Weekly',
      songs: ['6', '4', '7', '1', '8'],
      cover: '🔍',
      description: 'New music picked just for you'
    }
  ])

  useEffect(() => {
    setIsVisible(true)
    animate('.music-container', 'slideInRight')
  }, [])

  // Music player simulation
  useEffect(() => {
    if (isPlaying && currentSong) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentSong.duration - 1) {
            handleNextSong()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentSong])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSongSelect = (song: Song): void => {
    onHaptic(50)
    setCurrentSong(song)
    setCurrentTime(0)
    setActiveView('player')
    animate('.player-view', 'slideInUp')
    
    if (isNetworkConnected) {
      setIsPlaying(true)
      animate('.play-button', 'pulse')
    } else {
      animate('.network-warning', 'shake')
    }
  }

  const handlePlayPause = (): void => {
    if (!isNetworkConnected) {
      onHaptic(100)
      animate('.network-warning', 'shake')
      return
    }
    
    onHaptic(30)
    setIsPlaying(!isPlaying)
    animate('.play-button', 'pulse')
  }

  const handleNextSong = (): void => {
    if (queue.length === 0) return
    
    onHaptic(30)
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id)
    let nextIndex = 0
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }
    
    setCurrentSong(queue[nextIndex])
    setCurrentTime(0)
    animate('.next-button', 'pulse')
  }

  const handlePrevSong = (): void => {
    if (queue.length === 0) return
    
    onHaptic(30)
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id)
    let prevIndex = queue.length - 1
    
    if (!shuffle) {
      prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    } else {
      prevIndex = Math.floor(Math.random() * queue.length)
    }
    
    setCurrentSong(queue[prevIndex])
    setCurrentTime(0)
    animate('.prev-button', 'pulse')
  }

  const handleSeek = (value: number[]): void => {
    if (currentSong) {
      setCurrentTime(Math.floor((value[0] / 100) * currentSong.duration))
      onHaptic(10)
    }
  }

  const handleVolumeChange = (value: number[]): void => {
    setVolume(value)
    onHaptic(10)
  }

  const toggleShuffle = (): void => {
    onHaptic(30)
    setShuffle(!shuffle)
    animate('.shuffle-button', 'rotateY')
  }

  const toggleRepeat = (): void => {
    onHaptic(30)
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeat)
    setRepeat(modes[(currentIndex + 1) % modes.length])
    animate('.repeat-button', 'rotateY')
  }

  const handleLikeSong = (song: Song): void => {
    onHaptic(50)
    // In a real app, this would update the backend
    song.liked = !song.liked
    animate('.like-button', song.liked ? 'heartBeat' : 'pulse')
  }

  const handlePlaylistSelect = (playlist: Playlist): void => {
    onHaptic(30)
    setSelectedPlaylist(playlist)
    const playlistSongs = songs.filter(song => playlist.songs.includes(song.id))
    setQueue(playlistSongs)
    
    if (playlistSongs.length > 0) {
      handleSongSelect(playlistSongs[0])
    }
  }

  const getRepeatIcon = (): string => {
    switch (repeat) {
      case 'all': return '🔁'
      case 'one': return '🔂'
      default: return '🔁'
    }
  }

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`music-container h-full bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white ${isVisible ? 'animate__animated' : ''}`}>
      {activeView === 'library' && (
        <div className="library-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={onBack}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">{t.appNames?.music || 'Music'}</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setActiveView('search')}
              >
                🔍
              </Button>
            </div>
          </div>

          {/* Network Warning */}
          {!isNetworkConnected && (
            <div className="network-warning bg-orange-500/20 border-l-4 border-orange-500 p-3 mx-4 mt-4 rounded">
              <p className="text-orange-200 text-sm">
                📶 {t.networkRequired || 'Network connection required for music streaming'}
              </p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex bg-black/20 mx-4 mt-4 rounded-lg p-1">
            <Button
              variant={activeView === 'library' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 text-white"
              onClick={() => setActiveView('library')}
            >
              Songs
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-white"
              onClick={() => setActiveView('playlists')}
            >
              Playlists
            </Button>
          </div>

          {/* Now Playing Bar */}
          {currentSong && (
            <div 
              className="bg-black/40 mx-4 mt-4 rounded-lg p-3 flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveView('player')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-lg">
                {currentSong.cover}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentSong.title}</p>
                <p className="text-xs text-gray-300 truncate">{currentSong.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayPause()
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>
            </div>
          )}

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="bg-black/20 rounded-lg p-3 flex items-center space-x-3 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  setQueue(songs)
                  handleSongSelect(song)
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-lg">
                  {song.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-gray-300 truncate">{song.artist} • {song.album}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{formatTime(song.duration)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeSong(song)
                    }}
                  >
                    {song.liked ? '❤️' : '🤍'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'playlists' && (
        <div className="playlists-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={() => setActiveView('library')}
              >
                ←
              </Button>
              <h1 className="text-lg font-semibold">Playlists</h1>
            </div>
          </div>

          {/* Playlists Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-black/20 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handlePlaylistSelect(playlist)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                      {playlist.cover}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{playlist.name}</h3>
                      <p className="text-sm text-gray-300">{playlist.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{playlist.songs.length} songs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'search' && (
        <div className="search-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={() => setActiveView('library')}
              >
                ←
              </Button>
              <input
                type="text"
                placeholder="Search songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-black/20 text-white placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery === '' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-6xl mb-4">🔍</span>
                <p className="text-lg">Search for music</p>
                <p className="text-sm">Find songs, artists, and albums</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-3">Results for "{searchQuery}"</h3>
                {filteredSongs.length === 0 ? (
                  <p className="text-gray-400">No results found</p>
                ) : (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-black/20 rounded-lg p-3 flex items-center space-x-3 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setQueue(filteredSongs)
                        handleSongSelect(song)
                      }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-lg">
                        {song.cover}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{song.title}</p>
                        <p className="text-xs text-gray-300 truncate">{song.artist} • {song.album}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(song.duration)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'player' && currentSong && (
        <div className="player-view h-full flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setActiveView('library')}
            >
              ⌄
            </Button>
            <h2 className="text-lg font-semibold">Now Playing</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              ⋯
            </Button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-64 h-64 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center text-8xl mb-6 shadow-2xl">
              {currentSong.cover}
            </div>

            {/* Song Info */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{currentSong.title}</h1>
              <p className="text-lg text-gray-300 mb-1">{currentSong.artist}</p>
              <p className="text-sm text-gray-400">{currentSong.album} • {currentSong.year}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm mb-6">
              <Slider
                value={[currentSong.duration ? (currentTime / currentSong.duration) * 100 : 0]}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!isNetworkConnected}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSong.duration)}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-6 mb-8">
              <Button
                variant="ghost"
                size="lg"
                className={`shuffle-button text-white hover:bg-white/20 ${shuffle ? 'text-purple-400' : ''}`}
                onClick={toggleShuffle}
              >
                🔀
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="prev-button text-white hover:bg-white/20 text-2xl"
                onClick={handlePrevSong}
                disabled={!isNetworkConnected}
              >
                ⏮️
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="play-button w-16 h-16 bg-white text-black hover:bg-gray-100 rounded-full text-2xl"
                onClick={handlePlayPause}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="next-button text-white hover:bg-white/20 text-2xl"
                onClick={handleNextSong}
                disabled={!isNetworkConnected}
              >
                ⏭️
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className={`repeat-button text-white hover:bg-white/20 ${repeat !== 'off' ? 'text-purple-400' : ''}`}
                onClick={toggleRepeat}
              >
                {getRepeatIcon()}
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center space-x-4 w-full max-w-sm">
              <Button
                variant="ghost"
                size="sm"
                className="like-button text-white hover:bg-white/20"
                onClick={() => handleLikeSong(currentSong)}
              >
                {currentSong.liked ? '❤️' : '🤍'}
              </Button>

              <div className="flex-1 flex items-center space-x-2">
                <span className="text-sm">🔊</span>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{volume[0]}%</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                📱
              </Button>
            </div>

            {/* Network Warning */}
            {!isNetworkConnected && (
              <div className="network-warning bg-orange-500/20 border border-orange-500 rounded-lg p-3 mt-4">
                <p className="text-orange-200 text-sm text-center">
                  📶 Connect to network to control playback
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}