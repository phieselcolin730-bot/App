'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface GeometryDashGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Player {
  x: number
  y: number
  velocityY: number
  isGrounded: boolean
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  type: string
}

interface Collectible {
  x: number
  y: number
  collected: boolean
}

export default function GeometryDashGame({ language, onBack, onHaptic, isNetworkConnected }: GeometryDashGameProps): JSX.Element {
  const [player, setPlayer] = useState<Player>({ x: 50, y: 400, velocityY: 0, isGrounded: true })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [gameSpeed, setGameSpeed] = useState<number>(3)
  const [score, setScore] = useState<number>(0)
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [backgroundOffset, setBackgroundOffset] = useState<number>(0)
  
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const gameLoopRef = useRef<number>()
  
  const t = getTranslation(language)

  const gravity = 0.8
  const jumpStrength = -15

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.geometry-container', 'slideInUp')
    
    // Initialize obstacles and collectibles
    generateLevel()
    startGameLoop()
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [])

  const generateLevel = (): void => {
    const newObstacles: Obstacle[] = []
    const newCollectibles: Collectible[] = []
    
    for (let i = 0; i < 20; i++) {
      const x = 800 + i * 300
      
      // Add spike obstacles
      if (Math.random() > 0.3) {
        newObstacles.push({
          x: x,
          y: 420,
          width: 30,
          height: 30,
          type: 'spike'
        })
      }
      
      // Add platform obstacles
      if (Math.random() > 0.7) {
        newObstacles.push({
          x: x + 100,
          y: 350,
          width: 80,
          height: 20,
          type: 'platform'
        })
      }
      
      // Add collectible stars
      if (Math.random() > 0.5) {
        newCollectibles.push({
          x: x + 50,
          y: 350,
          collected: false
        })
      }
    }
    
    setObstacles(newObstacles)
    setCollectibles(newCollectibles)
  }

  const startGameLoop = (): void => {
    const gameLoop = (): void => {
      if (gameState === 'playing') {
        updateGame()
        render()
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    gameLoop()
  }

  const updateGame = (): void => {
    // Update background
    setBackgroundOffset(prev => (prev + gameSpeed) % 600)
    
    // Update player physics
    setPlayer(prev => {
      let newY = prev.y + prev.velocityY
      let newVelocityY = prev.velocityY + gravity
      let newIsGrounded = false
      
      // Ground collision
      if (newY >= 400) {
        newY = 400
        newVelocityY = 0
        newIsGrounded = true
      }
      
      return {
        ...prev,
        y: newY,
        velocityY: newVelocityY,
        isGrounded: newIsGrounded
      }
    })
    
    // Move obstacles
    setObstacles(prev => prev.map(obstacle => ({
      ...obstacle,
      x: obstacle.x - gameSpeed
    })).filter(obstacle => obstacle.x > -100))
    
    // Move collectibles
    setCollectibles(prev => prev.map(collectible => ({
      ...collectible,
      x: collectible.x - gameSpeed
    })).filter(collectible => collectible.x > -50))
    
    // Check collisions
    checkCollisions()
    
    // Increase score
    setScore(prev => prev + 1)
    
    // Increase difficulty
    if (score > 0 && score % 500 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.5, 8))
    }
    
    // Generate new obstacles
    if (obstacles.length > 0 && obstacles[obstacles.length - 1].x < 2000) {
      generateLevel()
    }
  }

  const checkCollisions = (): void => {
    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      if (obstacle.x < player.x + 20 && obstacle.x + obstacle.width > player.x &&
          obstacle.y < player.y + 20 && obstacle.y + obstacle.height > player.y) {
        if (obstacle.type === 'spike') {
          gameOver()
        }
      }
    })
    
    // Check collectible collisions
    setCollectibles(prev => prev.map(collectible => {
      if (!collectible.collected &&
          collectible.x < player.x + 20 && collectible.x + 20 > player.x &&
          collectible.y < player.y + 20 && collectible.y + 20 > player.y) {
        onHaptic(30)
        setScore(prevScore => prevScore + 50)
        return { ...collectible, collected: true }
      }
      return collectible
    }))
  }

  const jump = (): void => {
    if (gameState === 'playing') {
      onHaptic(50)
      setPlayer(prev => {
        if (prev.isGrounded) {
          return { ...prev, velocityY: jumpStrength }
        }
        return prev
      })
    }
  }

  const gameOver = (): void => {
    setGameState('gameOver')
    onHaptic(200)
    animate('.game-over', 'bounceIn')
  }

  const restartGame = (): void => {
    onHaptic(50)
    setPlayer({ x: 50, y: 400, velocityY: 0, isGrounded: true })
    setScore(0)
    setGameSpeed(3)
    setGameState('playing')
    setBackgroundOffset(0)
    generateLevel()
    animate('.geometry-container', 'pulse')
  }

  const render = (): void => {
    const canvas = gameCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#FF6B6B')
    gradient.addColorStop(1, '#4ECDC4')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw scrolling background pattern
    ctx.fillStyle = '#FF8E53'
    for (let i = 0; i < canvas.width + 100; i += 100) {
      const x = (i - backgroundOffset) % (canvas.width + 100)
      ctx.fillRect(x, canvas.height - 40, 80, 40)
    }

    // Draw ground
    ctx.fillStyle = '#45B7D1'
    ctx.fillRect(0, 450, canvas.width, 50)

    // Draw obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.x > -100 && obstacle.x < canvas.width + 100) {
        ctx.fillStyle = obstacle.type === 'spike' ? '#E74C3C' : '#95A5A6'
        
        if (obstacle.type === 'spike') {
          // Draw triangle spike
          ctx.beginPath()
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y)
          ctx.lineTo(obstacle.x, obstacle.y + obstacle.height)
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
          ctx.closePath()
          ctx.fill()
        } else {
          // Draw rectangle platform
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        }
        
        // Add outline
        ctx.strokeStyle = '#2C3E50'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw collectibles
    collectibles.forEach(collectible => {
      if (!collectible.collected && collectible.x > -50 && collectible.x < canvas.width + 50) {
        ctx.fillStyle = '#F39C12'
        
        // Draw star shape
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
          const x = collectible.x + 10 + Math.cos(angle) * 10
          const y = collectible.y + 10 + Math.sin(angle) * 10
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        
        // Add sparkle effect
        ctx.fillStyle = '#FFD700'
        ctx.fillRect(collectible.x + 8, collectible.y + 8, 4, 4)
      }
    })

    // Draw player (cube)
    ctx.fillStyle = '#2ECC71'
    ctx.fillRect(player.x, player.y, 20, 20)
    
    // Add player rotation effect
    const rotation = (score / 10) % (Math.PI * 2)
    ctx.save()
    ctx.translate(player.x + 10, player.y + 10)
    ctx.rotate(rotation)
    ctx.fillStyle = '#27AE60'
    ctx.fillRect(-8, -8, 16, 16)
    ctx.restore()
    
    // Player outline
    ctx.strokeStyle = '#1E8449'
    ctx.lineWidth = 2
    ctx.strokeRect(player.x, player.y, 20, 20)
  }

  return (
    <div className="geometry-container h-full bg-gradient-to-b from-red-400 to-teal-400 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-lg font-semibold">Geometry Dash</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">Score</div>
            <div className="text-lg font-bold">{score}</div>
          </div>
        </div>
      </div>

      {/* Stats Monitor (Desktop) */}
      {!isMobile && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800/90 text-white text-xs p-2 rounded font-mono">
          <div>FPS: 60</div>
          <div>Mobile: {isMobile}</div>
          <div>Speed: {gameSpeed.toFixed(1)}</div>
          <div>Y-Pos: {player.y.toFixed(0)}</div>
          <div>Score: {score}</div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={gameCanvasRef}
        width={isMobile ? 350 : 700}
        height={isMobile ? 400 : 500}
        className="absolute top-16 left-1/2 transform -translate-x-1/2 border-2 border-black/20 rounded-lg"
        style={{
          width: isMobile ? '350px' : '700px',
          height: isMobile ? '400px' : '500px'
        }}
      />

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800/90 text-white text-xs p-2 rounded">
          <div className="text-center space-y-1">
            <div>⚡ <strong>GEOMETRY DASH</strong></div>
            <div>SPACE/CLICK - Jump • Avoid Red Spikes • Collect Golden Stars</div>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-32 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-lg font-bold"
              onClick={jump}
              onTouchStart={jump}
            >
              <span className="text-2xl mr-2">🦘</span>
              JUMP
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Click Area */}
      {!isMobile && (
        <div
          className="absolute inset-0 z-10"
          onClick={jump}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'ArrowUp') {
              e.preventDefault()
              jump()
            }
          }}
          tabIndex={0}
          style={{ outline: 'none' }}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div className="game-over absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <div className="text-gray-600 mb-4">
              <div>Final Score: <span className="font-bold text-xl">{score}</span></div>
              <div>Speed Reached: <span className="font-bold">{gameSpeed.toFixed(1)}x</span></div>
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