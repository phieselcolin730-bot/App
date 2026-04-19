'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface SnakeGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Position {
  x: number
  y: number
}

interface Food {
  position: Position
  type: 'normal' | 'bonus' | 'power'
  value: number
}

export default function SnakeGame({ language, onBack, onHaptic, isNetworkConnected }: SnakeGameProps): JSX.Element {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Food>({ position: { x: 15, y: 15 }, type: 'normal', value: 10 })
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 })
  const [nextDirection, setNextDirection] = useState<Position>({ x: 1, y: 0 })
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing')
  const [speed, setSpeed] = useState<number>(150)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [powerUpActive, setPowerUpActive] = useState<boolean>(false)
  const [powerUpTimer, setPowerUpTimer] = useState<number>(0)
  
  const gameIntervalRef = useRef<NodeJS.Timeout>()
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const t = getTranslation(language)
  
  const GRID_SIZE = 20
  const CANVAS_SIZE = isMobile ? 300 : 400

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.snake-container', 'zoomIn')
    
    // Load high score
    const savedHighScore = localStorage.getItem('snake-highscore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
    
    generateFood()
    startGameLoop()
    
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop()
    } else {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
    
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
  }, [gameState, speed])

  useEffect(() => {
    render()
  }, [snake, food, powerUpActive])

  const startGameLoop = (): void => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current)
    }
    
    gameIntervalRef.current = setInterval(() => {
      if (gameState === 'playing') {
        moveSnake()
        updatePowerUp()
      }
    }, speed)
  }

  const generateFood = (): void => {
    const gridWidth = Math.floor(CANVAS_SIZE / GRID_SIZE)
    const gridHeight = Math.floor(CANVAS_SIZE / GRID_SIZE)
    
    let newFood: Position
    let attempts = 0
    
    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      }
      attempts++
    } while (attempts < 100 && snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    
    const foodTypes: Array<{ type: Food['type'], value: number, chance: number }> = [
      { type: 'normal', value: 10, chance: 0.7 },
      { type: 'bonus', value: 25, chance: 0.25 },
      { type: 'power', value: 50, chance: 0.05 }
    ]
    
    const random = Math.random()
    let cumulativeChance = 0
    let selectedType = foodTypes[0]
    
    for (const foodType of foodTypes) {
      cumulativeChance += foodType.chance
      if (random <= cumulativeChance) {
        selectedType = foodType
        break
      }
    }
    
    setFood({
      position: newFood,
      type: selectedType.type,
      value: selectedType.value
    })
  }

  const moveSnake = (): void => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake]
      const head = { ...newSnake[0] }
      
      // Update direction
      setDirection(nextDirection)
      head.x += nextDirection.x
      head.y += nextDirection.y
      
      const gridWidth = Math.floor(CANVAS_SIZE / GRID_SIZE)
      const gridHeight = Math.floor(CANVAS_SIZE / GRID_SIZE)
      
      // Wall collision (game over unless power-up active)
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        if (powerUpActive) {
          // Wrap around with power-up
          head.x = ((head.x % gridWidth) + gridWidth) % gridWidth
          head.y = ((head.y % gridHeight) + gridHeight) % gridHeight
        } else {
          gameOver()
          return prevSnake
        }
      }
      
      // Self collision (game over unless power-up active)
      if (!powerUpActive && newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver()
        return prevSnake
      }
      
      newSnake.unshift(head)
      
      // Check food collision
      if (head.x === food.position.x && head.y === food.position.y) {
        onHaptic(50)
        
        // Add score
        setScore(prevScore => prevScore + food.value)
        
        // Activate power-up
        if (food.type === 'power') {
          setPowerUpActive(true)
          setPowerUpTimer(5000) // 5 seconds
          animate('.power-up-indicator', 'bounceIn')
        }
        
        // Increase speed slightly
        if (food.type === 'bonus') {
          setSpeed(prevSpeed => Math.max(50, prevSpeed - 5))
        } else {
          setSpeed(prevSpeed => Math.max(80, prevSpeed - 2))
        }
        
        generateFood()
        animate('.score-display', 'pulse')
        
      } else {
        // Remove tail if no food eaten
        newSnake.pop()
      }
      
      return newSnake
    })
  }

  const updatePowerUp = (): void => {
    if (powerUpActive && powerUpTimer > 0) {
      setPowerUpTimer(prev => prev - speed)
      if (powerUpTimer <= 0) {
        setPowerUpActive(false)
        animate('.power-up-indicator', 'fadeOut')
      }
    }
  }

  const changeDirection = (newDirection: Position): void => {
    // Prevent 180-degree turns
    if (
      (direction.x === 1 && newDirection.x === -1) ||
      (direction.x === -1 && newDirection.x === 1) ||
      (direction.y === 1 && newDirection.y === -1) ||
      (direction.y === -1 && newDirection.y === 1)
    ) {
      return
    }
    
    onHaptic(20)
    setNextDirection(newDirection)
  }

  const gameOver = (): void => {
    setGameState('gameOver')
    onHaptic(300)
    
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snake-highscore', score.toString())
      animate('.new-highscore', 'bounceIn')
    }
    
    animate('.game-over', 'slideInUp')
  }

  const pauseGame = (): void => {
    onHaptic(30)
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
  }

  const restartGame = (): void => {
    onHaptic(50)
    setSnake([{ x: 10, y: 10 }])
    setDirection({ x: 1, y: 0 })
    setNextDirection({ x: 1, y: 0 })
    setScore(0)
    setSpeed(150)
    setPowerUpActive(false)
    setPowerUpTimer(0)
    generateFood()
    setGameState('playing')
    animate('.snake-container', 'pulse')
  }

  const render = (): void => {
    const canvas = gameCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_SIZE)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_SIZE, i)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * GRID_SIZE
      const y = segment.y * GRID_SIZE
      
      if (index === 0) {
        // Snake head
        ctx.fillStyle = powerUpActive ? '#FFD700' : '#4CAF50'
        ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4)
        
        // Eyes
        ctx.fillStyle = '#000'
        ctx.fillRect(x + 5, y + 5, 3, 3)
        ctx.fillRect(x + 12, y + 5, 3, 3)
        
        // Power-up effect
        if (powerUpActive) {
          ctx.strokeStyle = '#FFF'
          ctx.lineWidth = 2
          ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2)
        }
      } else {
        // Snake body
        const alpha = Math.max(0.3, 1 - (index * 0.05))
        ctx.fillStyle = powerUpActive ? `rgba(255, 215, 0, ${alpha})` : `rgba(76, 175, 80, ${alpha})`
        ctx.fillRect(x + 3, y + 3, GRID_SIZE - 6, GRID_SIZE - 6)
      }
    })

    // Draw food
    const foodX = food.position.x * GRID_SIZE
    const foodY = food.position.y * GRID_SIZE
    
    const foodColors = {
      normal: '#FF5722',
      bonus: '#9C27B0',
      power: '#FFD700'
    }
    
    ctx.fillStyle = foodColors[food.type]
    
    if (food.type === 'power') {
      // Power food - star shape
      ctx.save()
      ctx.translate(foodX + GRID_SIZE/2, foodY + GRID_SIZE/2)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        const x = Math.cos(angle) * 8
        const y = Math.sin(angle) * 8
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    } else if (food.type === 'bonus') {
      // Bonus food - diamond
      ctx.beginPath()
      ctx.moveTo(foodX + GRID_SIZE/2, foodY + 2)
      ctx.lineTo(foodX + GRID_SIZE - 2, foodY + GRID_SIZE/2)
      ctx.lineTo(foodX + GRID_SIZE/2, foodY + GRID_SIZE - 2)
      ctx.lineTo(foodX + 2, foodY + GRID_SIZE/2)
      ctx.closePath()
      ctx.fill()
    } else {
      // Normal food - circle
      ctx.beginPath()
      ctx.arc(foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return (
    <div className="snake-container h-full bg-gradient-to-b from-green-900 via-green-800 to-green-700 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐍</span>
              <h1 className="text-lg font-semibold">Snake Game</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={pauseGame}
            >
              {gameState === 'playing' ? '⏸️' : '▶️'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Monitor (Desktop) */}
      {!isMobile && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800/90 text-white text-xs p-2 rounded font-mono">
          <div>FPS: {Math.round(1000/speed)}</div>
          <div>Mobile: {isMobile}</div>
          <div>Length: {snake.length}</div>
          <div>Speed: {Math.round((200-speed)/10)}</div>
          <div>Power: {powerUpActive ? 'ON' : 'OFF'}</div>
        </div>
      )}

      {/* Game Area */}
      <div className="pt-16 h-full flex items-center justify-center">
        <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'items-start space-x-6'}`}>
          
          {/* Game Stats */}
          <div className={`${isMobile ? 'flex space-x-4' : 'flex flex-col space-y-4'}`}>
            <div className="score-display bg-black/60 text-white p-4 rounded border border-green-500">
              <div className="text-center">
                <div className="text-sm opacity-80">Score</div>
                <div className="text-2xl font-bold">{score.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-center">
                <div>Length: {snake.length}</div>
                <div>Best: {highScore}</div>
              </div>
            </div>
            
            {/* Power-up indicator */}
            {powerUpActive && (
              <div className="power-up-indicator bg-yellow-500/90 text-black p-3 rounded border border-yellow-300 text-center">
                <div className="text-lg">⭐</div>
                <div className="text-xs font-bold">POWER UP!</div>
                <div className="text-xs">{Math.ceil(powerUpTimer/1000)}s</div>
              </div>
            )}
            
            {/* Food legend */}
            <div className="bg-black/60 text-white p-3 rounded border border-gray-600 text-xs">
              <div className="font-bold mb-2">Food Types:</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Normal (+10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500"></div>
                  <span>Bonus (+25)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500"></div>
                  <span>Power (+50)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative">
            <canvas
              ref={gameCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border-4 border-green-400 rounded-lg bg-gray-900"
            />
            
            {/* Pause Overlay */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">⏸️</div>
                  <div className="text-xl font-bold">PAUSED</div>
                  <div className="text-sm mt-2">Click play to continue</div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          {isMobile && (
            <div className="grid grid-cols-3 gap-2 w-48">
              <div></div>
              <Button
                className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => changeDirection({ x: 0, y: -1 })}
              >
                ⬆️
              </Button>
              <div></div>
              <Button
                className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => changeDirection({ x: -1, y: 0 })}
              >
                ⬅️
              </Button>
              <div></div>
              <Button
                className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => changeDirection({ x: 1, y: 0 })}
              >
                ➡️
              </Button>
              <div></div>
              <Button
                className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => changeDirection({ x: 0, y: 1 })}
              >
                ⬇️
              </Button>
              <div></div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800/90 text-white text-xs p-2 rounded">
          <div className="text-center space-y-1">
            <div>🐍 <strong>SNAKE GAME</strong></div>
            <div>WASD/ARROW KEYS - Move • P - Pause • Golden Food = Power-Up!</div>
          </div>
        </div>
      )}

      {/* Desktop Keyboard Controls */}
      <div
        className="absolute inset-0 z-0"
        tabIndex={0}
        onKeyDown={(e) => {
          if (gameState !== 'playing') return
          
          switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
              changeDirection({ x: 0, y: -1 })
              break
            case 's':
            case 'arrowdown':
              changeDirection({ x: 0, y: 1 })
              break
            case 'a':
            case 'arrowleft':
              changeDirection({ x: -1, y: 0 })
              break
            case 'd':
            case 'arrowright':
              changeDirection({ x: 1, y: 0 })
              break
            case 'p':
              pauseGame()
              break
          }
        }}
        style={{ outline: 'none' }}
      />

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="game-over absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <div className="text-gray-600 mb-4">
              <div className="text-3xl font-bold text-green-600 mb-2">{score}</div>
              <div>Length: <span className="font-bold">{snake.length}</span></div>
              <div>Best: <span className="font-bold">{highScore}</span></div>
              {score === highScore && score > 0 && (
                <div className="new-highscore text-green-600 font-bold animate-pulse mt-2">
                  🎉 New High Score! 🎉
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
                onClick={restartGame}
              >
                🔄 Play Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onBack}
              >
                🏠 Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}