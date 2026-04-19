'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getTranslation } from '@/lib/translations'

interface AmongUsGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Player {
  id: string
  name: string
  color: string
  isImpostor: boolean
  isAlive: boolean
  position: string
}

interface Task {
  id: string
  name: string
  location: string
  completed: boolean
  type: 'short' | 'medium' | 'long'
  progress: number
}

interface GameState {
  phase: 'lobby' | 'playing' | 'meeting' | 'voting' | 'results'
  playersAlive: number
  tasksCompleted: number
  totalTasks: number
  emergencyMeetings: number
}

export default function AmongUsGame({ language, onBack, onHaptic, isNetworkConnected }: AmongUsGameProps): JSX.Element {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [gameState, setGameState] = useState<GameState>({
    phase: 'lobby',
    playersAlive: 8,
    tasksCompleted: 0,
    totalTasks: 12,
    emergencyMeetings: 1
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [votingTarget, setVotingTarget] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<'crewmates' | 'impostors' | null>(null)
  
  const t = getTranslation(language)

  const playerColors = ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '🟤', '⚫', '⚪', '🔺']
  
  const locations = [
    'Cafeteria', 'Weapons', 'O2', 'Navigation', 'Shields', 'Communications', 
    'Storage', 'Admin', 'Electrical', 'Lower Engine', 'Upper Engine', 'Security'
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.amongus-container', 'slideInDown')
    initializeGame()
  }, [])

  const initializeGame = (): void => {
    // Create players
    const newPlayers: Player[] = [
      { id: '1', name: 'You', color: '🔵', isImpostor: Math.random() < 0.3, isAlive: true, position: 'Cafeteria' },
      { id: '2', name: 'Alex', color: '🔴', isImpostor: false, isAlive: true, position: 'Weapons' },
      { id: '3', name: 'Emma', color: '🟢', isImpostor: false, isAlive: true, position: 'O2' },
      { id: '4', name: 'Mike', color: '🟡', isImpostor: Math.random() < 0.3, isAlive: true, position: 'Navigation' },
      { id: '5', name: 'Sara', color: '🟠', isImpostor: false, isAlive: true, position: 'Shields' },
      { id: '6', name: 'John', color: '🟣', isImpostor: false, isAlive: true, position: 'Communications' },
      { id: '7', name: 'Lisa', color: '🟤', isImpostor: false, isAlive: true, position: 'Storage' },
      { id: '8', name: 'Tom', color: '⚫', isImpostor: false, isAlive: true, position: 'Admin' }
    ]
    
    setPlayers(newPlayers)
    setCurrentPlayer(newPlayers[0])
    
    // Create tasks
    const newTasks: Task[] = [
      { id: '1', name: 'Fix Wiring', location: 'Electrical', completed: false, type: 'short', progress: 0 },
      { id: '2', name: 'Empty Garbage', location: 'Cafeteria', completed: false, type: 'short', progress: 0 },
      { id: '3', name: 'Fuel Engine', location: 'Storage', completed: false, type: 'medium', progress: 0 },
      { id: '4', name: 'Calibrate Distributor', location: 'Electrical', completed: false, type: 'short', progress: 0 },
      { id: '5', name: 'Chart Course', location: 'Navigation', completed: false, type: 'short', progress: 0 },
      { id: '6', name: 'Clear Asteroids', location: 'Weapons', completed: false, type: 'long', progress: 0 },
      { id: '7', name: 'Upload Data', location: 'Communications', completed: false, type: 'medium', progress: 0 },
      { id: '8', name: 'Inspect Sample', location: 'MedBay', completed: false, type: 'long', progress: 0 }
    ]
    
    setTasks(newTasks.slice(0, 5)) // Give player 5 random tasks
  }

  const startGame = (): void => {
    onHaptic(50)
    setGameState(prev => ({ ...prev, phase: 'playing' }))
    animate('.game-area', 'fadeIn')
  }

  const performTask = (task: Task): void => {
    if (task.completed) return
    
    onHaptic(30)
    setSelectedTask(task)
    animate('.task-modal', 'zoomIn')
  }

  const completeTask = (): void => {
    if (!selectedTask) return
    
    onHaptic(100)
    
    setTasks(prev => prev.map(t => 
      t.id === selectedTask.id 
        ? { ...t, completed: true, progress: 100 }
        : t
    ))
    
    setGameState(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1
    }))
    
    setSelectedTask(null)
    animate('.task-complete', 'bounceIn')
    
    // Check win condition
    if (gameState.tasksCompleted + 1 >= gameState.totalTasks) {
      setGameResult('crewmates')
      setGameState(prev => ({ ...prev, phase: 'results' }))
    }
  }

  const callEmergencyMeeting = (): void => {
    if (gameState.emergencyMeetings <= 0) return
    
    onHaptic(200)
    setGameState(prev => ({
      ...prev,
      phase: 'meeting',
      emergencyMeetings: prev.emergencyMeetings - 1
    }))
    animate('.meeting-modal', 'slideInUp')
  }

  const castVote = (playerId: string): void => {
    onHaptic(50)
    setVotingTarget(playerId)
    
    setTimeout(() => {
      // Simulate voting results
      const targetPlayer = players.find(p => p.id === playerId)
      if (targetPlayer?.isImpostor) {
        setGameResult('crewmates')
      } else {
        // Remove innocent player
        setPlayers(prev => prev.map(p => 
          p.id === playerId ? { ...p, isAlive: false } : p
        ))
        setGameState(prev => ({ ...prev, playersAlive: prev.playersAlive - 1 }))
        
        // Check if impostors win
        const aliveImpostors = players.filter(p => p.isAlive && p.isImpostor).length
        const aliveCrew = players.filter(p => p.isAlive && !p.isImpostor).length - 1
        if (aliveImpostors >= aliveCrew) {
          setGameResult('impostors')
        }
      }
      
      setGameState(prev => ({ ...prev, phase: 'results' }))
      setVotingTarget(null)
    }, 2000)
  }

  const skipVote = (): void => {
    onHaptic(30)
    setGameState(prev => ({ ...prev, phase: 'playing' }))
    animate('.game-area', 'slideInLeft')
  }

  const restartGame = (): void => {
    onHaptic(50)
    setGameResult(null)
    setGameState({
      phase: 'lobby',
      playersAlive: 8,
      tasksCompleted: 0,
      totalTasks: 12,
      emergencyMeetings: 1
    })
    initializeGame()
  }

  const renderLobby = (): JSX.Element => (
    <div className="lobby-area p-6 text-center">
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-2xl font-bold text-white mb-6">Among Us - The Skeld</h2>
      
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Players ({players.length}/10)</h3>
        <div className="grid grid-cols-2 gap-2">
          {players.map(player => (
            <div key={player.id} className="flex items-center space-x-2 text-white">
              <span className="text-2xl">{player.color}</span>
              <span className={player.id === '1' ? 'font-bold' : ''}>{player.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <Button
        size="lg"
        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-xl font-bold"
        onClick={startGame}
      >
        🚀 Start Game
      </Button>
    </div>
  )

  const renderGamePlay = (): JSX.Element => (
    <div className="game-area p-4">
      {/* Game Stats */}
      <div className="bg-white/10 rounded-lg p-3 mb-4 text-white text-sm">
        <div className="flex justify-between items-center mb-2">
          <span>Tasks Completed</span>
          <span>{gameState.tasksCompleted}/{gameState.totalTasks}</span>
        </div>
        <Progress value={(gameState.tasksCompleted / gameState.totalTasks) * 100} className="mb-2" />
        <div className="flex justify-between text-xs">
          <span>Players Alive: {gameState.playersAlive}</span>
          <span>Emergency: {gameState.emergencyMeetings}</span>
        </div>
      </div>

      {/* Player Status */}
      <div className="bg-white/10 rounded-lg p-3 mb-4 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{currentPlayer?.color}</span>
          <span className="font-semibold">{currentPlayer?.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            currentPlayer?.isImpostor ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {currentPlayer?.isImpostor ? 'IMPOSTOR' : 'CREWMATE'}
          </span>
        </div>
        <div className="text-sm opacity-80">Location: {currentPlayer?.position}</div>
      </div>

      {/* Tasks */}
      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <h3 className="text-white font-semibold mb-3">Tasks</h3>
        <div className="space-y-2">
          {tasks.map(task => (
            <Button
              key={task.id}
              variant="ghost"
              className={`w-full justify-between text-white hover:bg-white/20 ${
                task.completed ? 'opacity-50' : ''
              }`}
              onClick={() => !task.completed && performTask(task)}
              disabled={task.completed}
            >
              <div className="flex items-center space-x-2">
                <span>{task.completed ? '✅' : '📋'}</span>
                <span>{task.name}</span>
              </div>
              <span className="text-xs opacity-70">{task.location}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3"
          onClick={callEmergencyMeeting}
          disabled={gameState.emergencyMeetings <= 0}
        >
          🚨 Emergency Meeting ({gameState.emergencyMeetings})
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="text-white border-white/30 hover:bg-white/20">
            🗺️ Map
          </Button>
          <Button variant="outline" className="text-white border-white/30 hover:bg-white/20">
            📱 Admin
          </Button>
        </div>
      </div>
    </div>
  )

  const renderMeeting = (): JSX.Element => (
    <div className="meeting-modal p-6 text-center">
      <div className="text-6xl mb-4">🚨</div>
      <h2 className="text-2xl font-bold text-white mb-6">Emergency Meeting</h2>
      
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Who is suspicious?</h3>
        <div className="space-y-2">
          {players.filter(p => p.isAlive && p.id !== '1').map(player => (
            <Button
              key={player.id}
              variant="ghost"
              className={`w-full text-white hover:bg-white/20 justify-start ${
                votingTarget === player.id ? 'bg-red-500/50' : ''
              }`}
              onClick={() => castVote(player.id)}
            >
              <span className="text-2xl mr-3">{player.color}</span>
              {player.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full text-white border-white/30 hover:bg-white/20"
        onClick={skipVote}
      >
        ⏭️ Skip Vote
      </Button>
    </div>
  )

  const renderResults = (): JSX.Element => (
    <div className="results-area p-6 text-center">
      <div className="text-6xl mb-4">
        {gameResult === 'crewmates' ? '🎉' : '💀'}
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">
        {gameResult === 'crewmates' ? 'Crewmates Win!' : 'Impostors Win!'}
      </h2>
      
      <div className="bg-white/10 rounded-lg p-4 mb-6 text-white">
        <div className="text-lg mb-2">Game Stats</div>
        <div className="text-sm space-y-1">
          <div>Tasks Completed: {gameState.tasksCompleted}/{gameState.totalTasks}</div>
          <div>Players Remaining: {gameState.playersAlive}</div>
          <div>You were: {currentPlayer?.isImpostor ? 'IMPOSTOR' : 'CREWMATE'}</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4"
          onClick={restartGame}
        >
          🔄 Play Again
        </Button>
        <Button
          variant="outline"
          className="w-full text-white border-white/30 hover:bg-white/20"
          onClick={onBack}
        >
          🏠 Back to Home
        </Button>
      </div>
    </div>
  )

  return (
    <div className="amongus-container h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👽</span>
              <h1 className="text-lg font-semibold">Among Us</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Phase</div>
            <div className="text-sm font-bold capitalize">{gameState.phase}</div>
          </div>
        </div>
      </div>

      {/* Stats Monitor (Desktop) */}
      {!isMobile && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800/90 text-white text-xs p-2 rounded font-mono">
          <div>Phase: {gameState.phase}</div>
          <div>Mobile: {isMobile}</div>
          <div>Alive: {gameState.playersAlive}</div>
          <div>Tasks: {gameState.tasksCompleted}/{gameState.totalTasks}</div>
          <div>Role: {currentPlayer?.isImpostor ? 'IMP' : 'CREW'}</div>
        </div>
      )}

      {/* Main Game Content */}
      <div className="pt-16 h-full overflow-y-auto">
        {gameState.phase === 'lobby' && renderLobby()}
        {gameState.phase === 'playing' && renderGamePlay()}
        {gameState.phase === 'meeting' && renderMeeting()}
        {gameState.phase === 'results' && renderResults()}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <div className="task-modal absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-2">{selectedTask.name}</h3>
            <p className="text-gray-600 mb-4">Location: {selectedTask.location}</p>
            <div className="space-y-3">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
                onClick={completeTask}
              >
                ✅ Complete Task
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedTask(null)}
              >
                ❌ Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}