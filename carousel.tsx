'use client'

import React, { useState, useEffect, useRef } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface RobloxGameProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

interface Player {
  x: number
  y: number
  z: number
  rotation: number
}

interface Block {
  x: number
  y: number
  z: number
  color: string
  type: string
}

export default function RobloxGame({ language, onBack, onHaptic, isNetworkConnected }: RobloxGameProps): JSX.Element {
  const [player, setPlayer] = useState<Player>({ x: 0, y: 0, z: 0, rotation: 0 })
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockType, setSelectedBlockType] = useState<string>('brick')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const gameCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const t = getTranslation(language)

  const blockTypes = [
    { id: 'brick', name: '🧱 Brick', color: '#CD853F' },
    { id: 'grass', name: '🌱 Grass', color: '#90EE90' },
    { id: 'stone', name: '🪨 Stone', color: '#696969' },
    { id: 'wood', name: '🪵 Wood', color: '#D2B48C' },
    { id: 'water', name: '💧 Water', color: '#4169E1' },
    { id: 'lava', name: '🌋 Lava', color: '#FF4500' }
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    animate('.roblox-container', 'fadeIn')
    
    // Initialize some starter blocks
    const starterBlocks: Block[] = [
      { x: 0, y: -1, z: 0, color: '#90EE90', type: 'grass' },
      { x: 1, y: -1, z: 0, color: '#90EE90', type: 'grass' },
      { x: -1, y: -1, z: 0, color: '#90EE90', type: 'grass' },
      { x: 0, y: -1, z: 1, color: '#90EE90', type: 'grass' },
      { x: 0, y: -1, z: -1, color: '#90EE90', type: 'grass' },
    ]
    setBlocks(starterBlocks)
    
    startGameLoop()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startGameLoop = (): void => {
    const gameLoop = (): void => {
      render3DWorld()
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    gameLoop()
  }

  const render3DWorld = (): void => {
    const canvas = gameCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#87CEEB' // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Simple 3D projection for blocks
    const cameraX = player.x * 50
    const cameraZ = player.z * 50
    
    blocks.forEach(block => {
      const screenX = (block.x * 50 - cameraX) + canvas.width / 2
      const screenY = (block.z * 50 - cameraZ) + canvas.height / 2 - (block.y * 30)
      
      if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
        // Draw block with 3D effect
        ctx.fillStyle = block.color
        ctx.fillRect(screenX, screenY, 40, 40)
        
        // Add 3D depth
        ctx.fillStyle = adjustBrightness(block.color, -20)
        ctx.fillRect(screenX + 40, screenY, 8, 40)
        ctx.fillRect(screenX, screenY - 8, 40, 8)
        
        // Block outline
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.strokeRect(screenX, screenY, 40, 40)
      }
    })

    // Draw player (simple rectangle for now)
    const playerScreenX = canvas.width / 2 - 10
    const playerScreenY = canvas.height / 2 - 10
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(playerScreenX, playerScreenY, 20, 20)
    ctx.strokeStyle = '#000'
    ctx.strokeRect(playerScreenX, playerScreenY, 20, 20)
  }

  const adjustBrightness = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * amount)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1)
  }

  const movePlayer = (dx: number, dz: number): void => {
    onHaptic(30)
    setPlayer(prev => ({
      ...prev,
      x: prev.x + dx,
      z: prev.z + dz
    }))
  }

  const placeBlock = (): void => {
    onHaptic(50)
    const selectedBlock = blockTypes.find(b => b.id === selectedBlockType)
    if (selectedBlock) {
      const newBlock: Block = {
        x: Math.round(player.x),
        y: 0,
        z: Math.round(player.z),
        color: selectedBlock.color,
        type: selectedBlock.id
      }
      setBlocks(prev => [...prev, newBlock])
      setScore(prev => prev + 10)
      animate('.place-btn', 'pulse')
    }
  }

  const removeBlock = (): void => {
    onHaptic(30)
    const playerX = Math.round(player.x)
    const playerZ = Math.round(player.z)
    
    setBlocks(prev => {
      const filtered = prev.filter(block => 
        !(Math.round(block.x) === playerX && Math.round(block.z) === playerZ && block.y >= 0)
      )
      if (filtered.length < prev.length) {
        setScore(prevScore => Math.max(0, prevScore - 5))
      }
      return filtered
    })
    animate('.remove-btn', 'shake')
  }

  const handleJoystickMove = (dx: number, dz: number): void => {
    const speed = 0.1
    movePlayer(dx * speed, dz * speed)
  }

  return (
    <div className="roblox-container h-full bg-gradient-to-b from-sky-400 to-green-400 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onBack}>
              ←
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏗️</span>
              <h1 className="text-lg font-semibold">RoboBlox</h1>
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
          <div>Pos: ({player.x.toFixed(1)}, {player.y.toFixed(1)}, {player.z.toFixed(1)})</div>
          <div>Blocks: {blocks.length}</div>
          <div>Score: {score}</div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={gameCanvasRef}
        width={isMobile ? 350 : 600}
        height={isMobile ? 400 : 500}
        className="absolute top-16 left-1/2 transform -translate-x-1/2 border-2 border-black/20 rounded-lg bg-sky-200"
        style={{
          width: isMobile ? '350px' : '600px',
          height: isMobile ? '400px' : '500px'
        }}
      />

      {/* Block Selection */}
      <div className="absolute top-20 left-4 z-20 bg-white/90 p-3 rounded-lg shadow-lg max-h-32 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2">Blocks:</h3>
        <div className="space-y-1">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.id}
              className={`w-full text-left p-2 rounded text-xs transition-colors ${
                selectedBlockType === blockType.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => {
                onHaptic(30)
                setSelectedBlockType(blockType.id)
              }}
            >
              {blockType.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-gray-800/90 text-white text-xs p-2 rounded">
          <div className="text-center space-y-1">
            <div>🎮 <strong>CONTROLS</strong></div>
            <div>WASD - Move • SPACE - Place Block • X - Remove Block</div>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
          <div className="flex justify-between items-end">
            {/* Virtual Joystick */}
            <div className="relative">
              <div className="w-20 h-20 bg-white/30 rounded-full border-2 border-white/50 relative">
                <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white/80 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                </div>
              </div>
              <div className="text-white text-xs text-center mt-1">Move</div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                size="sm"
                className="place-btn w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center"
                onClick={placeBlock}
              >
                <span className="text-lg">🧱</span>
                <span className="text-xs">Place</span>
              </Button>
              <Button
                size="sm"
                className="remove-btn w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center"
                onClick={removeBlock}
              >
                <span className="text-lg">💥</span>
                <span className="text-xs">Break</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Action Buttons */}
      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4">
          <Button
            className="place-btn bg-green-500 hover:bg-green-600 text-white px-6 py-3"
            onClick={placeBlock}
          >
            🧱 Place Block (SPACE)
          </Button>
          <Button
            className="remove-btn bg-red-500 hover:bg-red-600 text-white px-6 py-3"
            onClick={removeBlock}
          >
            💥 Remove Block (X)
          </Button>
        </div>
      )}

      {/* Desktop Keyboard Listeners */}
      <div
        className="absolute inset-0 z-0"
        tabIndex={0}
        onKeyDown={(e) => {
          switch (e.key.toLowerCase()) {
            case 'w': movePlayer(0, -0.5); break
            case 'a': movePlayer(-0.5, 0); break
            case 's': movePlayer(0, 0.5); break
            case 'd': movePlayer(0.5, 0); break
            case ' ': e.preventDefault(); placeBlock(); break
            case 'x': removeBlock(); break
          }
        }}
        style={{ outline: 'none' }}
      />
    </div>
  )
}