'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface TetrisGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Block {
  x: number
  y: number
  color: string
}

interface TetrominoShape {
  blocks: number[][]
  color: string
}

interface CurrentPiece {
  shape: number[][]
  color: string
  x: number
  y: number
}

export default function TetrisGame({ language, onBack, onHaptic, isNetworkConnected }: TetrisGameProps): JSX.Element {
  const [board, setBoard] = useState<string[][]>([])
  const [currentPiece, setCurrentPiece] = useState<CurrentPiece | null>(null)
  const [nextPiece, setNextPiece] = useState<TetrominoShape | null>(null)
  const [score, setScore] = useState<number>(0)
  const [lines, setLines] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [dropTimer, setDropTimer] = useState<number>(0)
  
  const gameIntervalRef = useRef<NodeJS.Timeout>()
  const t = getTranslation(language)

  const BOARD_WIDTH = 10
  const BOARD_HEIGHT = 20
  const BLOCK_SIZE = isMobile ? 15 : 25

  const TETROMINOES: TetrominoShape[] = [
    { // I-piece
      blocks: [[1, 1, 1, 1]],
      color: '#00FFFF'
    },
    { // O-piece
      blocks: [
        [1, 1],
        [1, 1]
      ],
      color: '#FFFF00'
    },
    { // T-piece
      blocks: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: '#800080'
    },
    { // S-piece
      blocks: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: '#00FF00'
    },
    { // Z-piece
      blocks: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: '#FF0000'
    },
    { // J-piece
      blocks: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: '#0000FF'
    },
    { // L-piece
      blocks: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: '#FFA500'
    }
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.tetris-container', 'slideInLeft')
    initializeGame()
    
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      const dropSpeed = Math.max(50, 600 - (level - 1) * 50)
      gameIntervalRef.current = setInterval(dropPiece, dropSpeed)
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
  }, [gameState, level, currentPiece])

  const initializeGame = (): void => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
    setBoard(newBoard)
    setScore(0)
    setLines(0)
    setLevel(1)
    spawnNewPiece()
  }

  const getRandomTetromino = (): TetrominoShape => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  }

  const spawnNewPiece = (): void => {
    const piece = nextPiece || getRandomTetromino()
    const newNextPiece = getRandomTetromino()
    
    setCurrentPiece({
      shape: piece.blocks,
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.blocks[0].length / 2),
      y: 0
    })
    setNextPiece(newNextPiece)
    
    // Check for game over
    if (!canPlacePiece(piece.blocks, Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.blocks[0].length / 2), 0)) {
      setGameState('gameOver')
      onHaptic(300)
    }
  }

  const canPlacePiece = (shape: number[][], x: number, y: number): boolean => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col
          const newY = y + row
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }
          
          if (newY >= 0 && board[newY] && board[newY][newX] !== '') {
            return false
          }
        }
      }
    }
    return true
  }

  const placePiece = useCallback((): void => {
    if (!currentPiece) return
    
    const newBoard = [...board]
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const x = currentPiece.x + col
          const y = currentPiece.y + row
          
          if (y >= 0) {
            newBoard[y][x] = currentPiece.color
          }
        }
      }
    }
    
    setBoard(newBoard)
    clearLines(newBoard)
    spawnNewPiece()
  }, [currentPiece, board])

  const clearLines = (newBoard: string[][]): void => {
    let linesCleared = 0
    const clearedBoard = [...newBoard]
    
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (clearedBoard[row].every(cell => cell !== '')) {
        clearedBoard.splice(row, 1)
        clearedBoard.unshift(Array(BOARD_WIDTH).fill(''))
        linesCleared++
        row++ // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      onHaptic(100)
      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      
      // Scoring system
      const lineScore = [0, 40, 100, 300, 1200][linesCleared] || 0
      setScore(prev => prev + lineScore * level)
      
      // Level progression
      const newTotalLines = lines + linesCleared
      const newLevel = Math.floor(newTotalLines / 10) + 1
      if (newLevel > level) {
        setLevel(newLevel)
      }
      
      animate('.score-display', 'pulse')
    }
  }

  const dropPiece = (): void => {
    if (!currentPiece) return
    
    if (canPlacePiece(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null)
    } else {
      placePiece()
    }
  }

  const movePiece = (deltaX: number): void => {
    if (!currentPiece) return
    
    onHaptic(20)
    if (canPlacePiece(currentPiece.shape, currentPiece.x + deltaX, currentPiece.y)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + deltaX } : null)
    }
  }

  const rotatePiece = (): void => {
    if (!currentPiece) return
    
    onHaptic(30)
    const rotated = currentPiece.shape[0].map((_, i) => 
      currentPiece.shape.map(row => row[i]).reverse()
    )
    
    if (canPlacePiece(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotated } : null)
      animate('.game-board', 'pulse')
    }
  }

  const hardDrop = (): void => {
    if (!currentPiece) return
    
    onHaptic(50)
    let dropDistance = 0
    
    while (canPlacePiece(currentPiece.shape, currentPiece.x, currentPiece.y + dropDistance + 1)) {
      dropDistance++
    }
    
    setCurrentPiece(prev => prev ? { ...prev, y: prev.y + dropDistance } : null)
    setScore(prev => prev + dropDistance * 2) // Bonus points for hard drop
    
    setTimeout(placePiece, 100)
  }

  const pauseGame = (): void => {
    onHaptic(30)
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
  }

  const restartGame = (): void => {
    onHaptic(50)
    setGameState('playing')
    initializeGame()
    animate('.tetris-container', 'bounceIn')
  }

  const renderBoard = (): JSX.Element => {
    const displayBoard = [...board]
    
    // Add current piece to display
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const x = currentPiece.x + col
            const y = currentPiece.y + row
            
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.color
            }
          }
        }
      }
    }
    
    return (
      <div 
        className="game-board inline-block border-2 border-gray-600 bg-black"
        style={{ 
          width: BOARD_WIDTH * BLOCK_SIZE,
          height: BOARD_HEIGHT * BLOCK_SIZE 
        }}
      >
        {displayBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="border border-gray-800"
                style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  backgroundColor: cell || '#000000',
                  boxShadow: cell ? 'inset 2px 2px 4px rgba(255,255,255,0.3)' : 'none'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderNextPiece = (): JSX.Element => {
    if (!nextPiece) return <></>
    
    return (
      <div className="bg-black border border-gray-600 p-2 rounded">
        <div className="text-white text-sm mb-1 text-center">Next</div>
        <div className="flex flex-col items-center">
          {nextPiece.blocks.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="border border-gray-800"
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: cell ? nextPiece.color : '#000000',
                    boxShadow: cell ? 'inset 1px 1px 2px rgba(255,255,255,0.3)' : 'none'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="tetris-container h-full bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🟦</span>
              <h1 className="text-lg font-semibold">Tetris</h1>
            </div>
          </div>
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

      {/* Stats Monitor (Desktop) */}
      {!isMobile && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800/90 text-white text-xs p-2 rounded font-mono">
          <div>FPS: 60</div>
          <div>Mobile: {isMobile}</div>
          <div>Level: {level}</div>
          <div>Lines: {lines}</div>
          <div>Score: {score}</div>
        </div>
      )}

      {/* Game Area */}
      <div className="pt-16 h-full flex items-center justify-center">
        <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'space-x-6'}`}>
          
          {/* Side Panel */}
          <div className={`${isMobile ? 'flex space-x-4' : 'flex flex-col space-y-4'}`}>
            {/* Score */}
            <div className="score-display bg-black/60 text-white p-4 rounded border border-gray-600">
              <div className="text-center">
                <div className="text-sm opacity-80">Score</div>
                <div className="text-xl font-bold">{score.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs">
                <div>Level: {level}</div>
                <div>Lines: {lines}</div>
              </div>
            </div>
            
            {/* Next Piece */}
            {renderNextPiece()}
          </div>

          {/* Game Board */}
          <div className="relative">
            {renderBoard()}
            
            {/* Game State Overlays */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">⏸️</div>
                  <div className="text-xl font-bold">PAUSED</div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          {isMobile && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Button
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                onClick={() => movePiece(-1)}
              >
                ←
              </Button>
              <Button
                className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={rotatePiece}
              >
                🔄
              </Button>
              <Button
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                onClick={() => movePiece(1)}
              >
                →
              </Button>
              <Button
                className="col-span-3 w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                onClick={hardDrop}
              >
                ⬇️ Hard Drop
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800/90 text-white text-xs p-2 rounded">
          <div className="text-center space-y-1">
            <div>🟦 <strong>TETRIS CONTROLS</strong></div>
            <div>A/D - Move • W - Rotate • S - Soft Drop • SPACE - Hard Drop</div>
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
            case 'a':
            case 'arrowleft':
              movePiece(-1)
              break
            case 'd':
            case 'arrowright':
              movePiece(1)
              break
            case 'w':
            case 'arrowup':
              rotatePiece()
              break
            case 's':
            case 'arrowdown':
              dropPiece()
              break
            case ' ':
              e.preventDefault()
              hardDrop()
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
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <div className="text-gray-600 mb-4">
              <div>Final Score: <span className="font-bold text-2xl">{score.toLocaleString()}</span></div>
              <div>Level Reached: <span className="font-bold">{level}</span></div>
              <div>Lines Cleared: <span className="font-bold">{lines}</span></div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3"
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