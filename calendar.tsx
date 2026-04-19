'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface FlappyBirdGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Bird {
  y: number
  velocityY: number
}

interface Pipe {
  x: number
  gapY: number
  passed: boolean
}

export default function FlappyBirdGame({ language, onBack, onHaptic, isNetworkConnected }: FlappyBirdGameProps): JSX.Element {
  const [bird, setBird] = useState<Bird>({ y: 250, velocityY: 0 })
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const t = getTranslation(language)
  
  const gravity = 0.5
  const jumpStrength = -12
  const pipeWidth = 60
  const pipeGap = 150
  const gameSpeed = 2

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.flappy-container', 'bounceIn')
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('flappy-highscore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState])

  const startGameLoop = (): void => {
    const gameLoop = (): void => {
      if (gameState === 'playing') {
        updateGame()
        render()
      }
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    gameLoop()
  }

  const updateGame = (): void => {
    // Update bird physics
    setBird(prev => {
      let newY = prev.y + prev.velocityY
      let newVelocityY = prev.velocityY + gravity
      
      // Prevent bird from going above screen
      if (newY < 0) {
        newY = 0
        newVelocityY = 0
      }
      
      // Check ground collision
      if (newY > 480) {
        gameOver()
        return prev
      }
      
      return { y: newY, velocityY: newVelocityY }
    })
    
    // Update pipes
    setPipes(prev => {
      let newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - gameSpeed }))
      
      // Remove pipes that are off screen
      newPipes = newPipes.filter(pipe => pipe.x > -pipeWidth)
      
      // Add new pipes
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 300) {
        newPipes.push({
          x: 400,
          gapY: Math.random() * 200 + 100,
          passed: false
        })
      }
      
      // Check for score increase
      newPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipeWidth < 50) {
          pipe.passed = true
          setScore(prevScore => prevScore + 1)
          onHaptic(30)
        }
      })
      
      // Check collisions
      const birdX = 50
      const birdY = bird.y
      const birdSize = 20
      
      newPipes.forEach(pipe => {
        if (pipe.x < birdX + birdSize && pipe.x + pipeWidth > birdX) {
          // Check if bird is in the gap
          if (birdY < pipe.gapY || birdY + birdSize > pipe.gapY + pipeGap) {
            gameOver()
          }
        }
      })
      
      return newPipes
    })
  }

  const render = (): void => {
    const canvas = gameCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#4FC3F7')
    gradient.addColorStop(1, '#29B6F6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw clouds
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.8
    for (let i = 0; i < 3; i++) {
      const x = (i * 150 + (score * 2)) % (canvas.width + 100) - 50
      ctx.beginPath()
      ctx.arc(x, 80 + i * 30, 30, 0, Math.PI * 2)
      ctx.arc(x + 25, 80 + i * 30, 35, 0, Math.PI * 2)
      ctx.arc(x + 50, 80 + i * 30, 30, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Draw pipes
    ctx.fillStyle = '#4CAF50'
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY)
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, canvas.height - pipe.gapY - pipeGap)
      
      // Pipe caps
      ctx.fillStyle = '#2E7D32'
      ctx.fillRect(pipe.x - 5, pipe.gapY - 30, pipeWidth + 10, 30)
      ctx.fillRect(pipe.x - 5, pipe.gapY + pipeGap, pipeWidth + 10, 30)
      ctx.fillStyle = '#4CAF50'
    })

    // Draw ground
    ctx.fillStyle = '#8BC34A'
    ctx.fillRect(0, 480, canvas.width, 20)

    // Draw bird
    const birdX = 50
    const birdY = bird.y
    
    // Bird body
    ctx.fillStyle = '#FFD54F'
    ctx.beginPath()
    ctx.arc(birdX + 10, birdY + 10, 12, 0, Math.PI * 2)
    ctx.fill()
    
    // Bird wing
    ctx.fillStyle = '#FFC107'
    ctx.beginPath()
    ctx.ellipse(birdX + 15, birdY + 8, 8, 5, bird.velocityY * 0.1, 0, Math.PI * 2)
    ctx.fill()
    
    // Bird beak
    ctx.fillStyle = '#FF9800'
    ctx.beginPath()
    ctx.moveTo(birdX + 20, birdY + 10)
    ctx.lineTo(birdX + 28, birdY + 8)
    ctx.lineTo(birdX + 20, birdY + 12)
    ctx.fill()
    
    // Bird eye
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(birdX + 12, birdY + 6, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(birdX + 13, birdY + 5, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  const jump = (): void => {
    if (gameState === 'waiting') {
      startGame()
    } else if (gameState === 'playing') {
      onHaptic(50)
      setBird(prev => ({ ...prev, velocityY: jumpStrength }))
    } else if (gameState === 'gameOver') {
      restartGame()
    }
  }

  const startGame = (): void => {
    onHaptic(50)
    setGameState('playing')
    setBird({ y: 250, velocityY: jumpStrength })
    setPipes([])
    setScore(0)
    animate('.game-canvas', 'pulse')
  }

  const gameOver = (): void => {
    setGameState('gameOver')
    onHaptic(200)
    
    // Update high score
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('flappy-highscore', score.toString())
      animate('.new-highscore', 'bounceIn')
    }
    
    animate('.game-over', 'fadeInUp')
  }

  const restartGame = (): void => {
    onHaptic(50)
    setBird({ y: 250, velocityY: 0 })
    setPipes([])
    setScore(0)
    setGameState('waiting')
    animate('.flappy-container', 'pulse')
  }

  return (
    <div className="flappy-container h-full bg-gradient-to-b from-blue-400 to-blue-600 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐦</span>
              <h1 className="text-lg font-semibold">Flappy Bird</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">High Score</div>
            <div className="text-lg font-bold">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Stats Monitor (Desktop) */}
      {!isMobile && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800/90 text-white text-xs p-2 rounded font-mono">
          <div>FPS: 60</div>
          <div>Mobile: {isMobile}</div>
          <div>Bird Y: {bird.y.toFixed(0)}</div>
          <div>Velocity: {bird.velocityY.toFixed(1)}</div>
          <div>Pipes: {pipes.length}</div>
        </div>
      )}

      {/* Score Display */}
      {gameState === 'playing' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="text-6xl font-bold text-white text-center drop-shadow-lg">
            {score}
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={gameCanvasRef}
        width={isMobile ? 350 : 600}
        height={500}
        className="game-canvas absolute top-16 left-1/2 transform -translate-x-1/2 border-2 border-black/20 rounded-lg"
        style={{
          width: isMobile ? '350px' : '600px',
          height: '500px'
        }}
        onClick={jump}
      />

      {/* Instructions */}
      {gameState === 'waiting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center">
          <div className="bg-white/90 rounded-lg p-6 max-w-sm mx-4">
            <div className="text-6xl mb-4">🐦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Flappy Bird</h2>
            <p className="text-gray-600 mb-4">Tap to fly through the pipes!</p>
            <Button
              size="lg"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 text-xl font-bold"
              onClick={jump}
            >
              🚀 Start Flying
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Controls */}
      {!isMobile && gameState === 'playing' && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800/90 text-white text-xs p-2 rounded">
          <div className="text-center space-y-1">
            <div>🐦 <strong>FLAPPY BIRD</strong></div>
            <div>SPACE/CLICK - Fly • Avoid Green Pipes</div>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && (
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-32 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center text-lg font-bold"
              onClick={jump}
              onTouchStart={jump}
            >
              <span className="text-2xl mr-2">🐦</span>
              FLY
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Click Area */}
      {!isMobile && (
        <div
          className="absolute inset-0 z-10"
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
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <div className="text-gray-600 mb-4">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{score}</div>
              <div>Best: <span className="font-bold">{highScore}</span></div>
              {score === highScore && score > 0 && (
                <div className="new-highscore text-green-600 font-bold animate-pulse">
                  🎉 New High Score! 🎉
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3"
                onClick={restartGame}
              >
                🔄 Try Again
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