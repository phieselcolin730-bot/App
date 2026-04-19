'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'

interface CalculatorAppProps {
  language: string
  onBack: () => void
  onHaptic: (duration?: number) => void
  isNetworkConnected: boolean
}

export default function CalculatorApp({ language, onBack, onHaptic, isNetworkConnected }: CalculatorAppProps): JSX.Element {
  const [display, setDisplay] = useState<string>('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [scientificMode, setScientificMode] = useState<boolean>(false)
  
  const t = getTranslation(language)

  useEffect(() => {
    setIsVisible(true)
    animate('.calculator-container', 'slideInRight')
  }, [])

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand
      case '-':
        return firstOperand - secondOperand
      case '×':
        return firstOperand * secondOperand
      case '÷':
        return firstOperand / secondOperand
      case '%':
        return firstOperand % secondOperand
      case '^':
        return Math.pow(firstOperand, secondOperand)
      default:
        return secondOperand
    }
  }

  const scientificCalculate = (operand: number, func: string): number => {
    switch (func) {
      case 'sin':
        return Math.sin((operand * Math.PI) / 180)
      case 'cos':
        return Math.cos((operand * Math.PI) / 180)
      case 'tan':
        return Math.tan((operand * Math.PI) / 180)
      case 'log':
        return Math.log10(operand)
      case 'ln':
        return Math.log(operand)
      case '√':
        return Math.sqrt(operand)
      case 'x²':
        return operand * operand
      case '1/x':
        return 1 / operand
      default:
        return operand
    }
  }

  const handleNumber = (num: string): void => {
    onHaptic(20)
    animate(`.number-${num}`, 'pulse')
    
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  const handleDecimal = (): void => {
    onHaptic(20)
    animate('.decimal-button', 'pulse')
    
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const handleOperation = (nextOperation: string): void => {
    onHaptic(30)
    animate(`.operation-${nextOperation}`, 'pulse')
    
    const inputValue = parseFloat(display)
    
    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const result = calculate(currentValue, inputValue, operation)
      
      setDisplay(`${parseFloat(result.toPrecision(12))}`)
      setPreviousValue(result)
    }
    
    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const handleEquals = (): void => {
    onHaptic(50)
    animate('.equals-button', 'pulse')
    
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display)
      const result = calculate(previousValue, inputValue, operation)
      const calculation = `${previousValue} ${operation} ${inputValue} = ${result}`
      
      setHistory(prev => [calculation, ...prev.slice(0, 9)]) // Keep last 10 calculations
      setDisplay(`${parseFloat(result.toPrecision(12))}`)
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const handleClear = (): void => {
    onHaptic(40)
    animate('.clear-button', 'shake')
    
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const handleScientificFunction = (func: string): void => {
    onHaptic(30)
    animate(`.scientific-${func}`, 'pulse')
    
    const inputValue = parseFloat(display)
    const result = scientificCalculate(inputValue, func)
    const calculation = `${func}(${inputValue}) = ${result}`
    
    setHistory(prev => [calculation, ...prev.slice(0, 9)])
    setDisplay(`${parseFloat(result.toPrecision(12))}`)
    setWaitingForOperand(true)
  }

  const toggleMode = (): void => {
    onHaptic(50)
    setScientificMode(!scientificMode)
    animate('.mode-toggle', 'rotateY')
  }

  const toggleHistory = (): void => {
    onHaptic(30)
    setShowHistory(!showHistory)
    animate('.history-toggle', 'slideInRight')
  }

  const basicButtons = [
    { id: 'clear', label: 'AC', action: handleClear, className: 'bg-gray-500 hover:bg-gray-600 text-white clear-button' },
    { id: 'sign', label: '+/-', action: () => {}, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { id: 'percent', label: '%', action: () => handleOperation('%'), className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { id: 'divide', label: '÷', action: () => handleOperation('÷'), className: 'bg-orange-500 hover:bg-orange-600 text-white operation-÷' },
    
    { id: '7', label: '7', action: () => handleNumber('7'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-7' },
    { id: '8', label: '8', action: () => handleNumber('8'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-8' },
    { id: '9', label: '9', action: () => handleNumber('9'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-9' },
    { id: 'multiply', label: '×', action: () => handleOperation('×'), className: 'bg-orange-500 hover:bg-orange-600 text-white operation-×' },
    
    { id: '4', label: '4', action: () => handleNumber('4'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-4' },
    { id: '5', label: '5', action: () => handleNumber('5'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-5' },
    { id: '6', label: '6', action: () => handleNumber('6'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-6' },
    { id: 'subtract', label: '-', action: () => handleOperation('-'), className: 'bg-orange-500 hover:bg-orange-600 text-white operation--' },
    
    { id: '1', label: '1', action: () => handleNumber('1'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-1' },
    { id: '2', label: '2', action: () => handleNumber('2'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-2' },
    { id: '3', label: '3', action: () => handleNumber('3'), className: 'bg-gray-700 hover:bg-gray-800 text-white number-3' },
    { id: 'add', label: '+', action: () => handleOperation('+'), className: 'bg-orange-500 hover:bg-orange-600 text-white operation-+' },
    
    { id: '0', label: '0', action: () => handleNumber('0'), className: 'bg-gray-700 hover:bg-gray-800 text-white col-span-2 number-0' },
    { id: 'decimal', label: '.', action: handleDecimal, className: 'bg-gray-700 hover:bg-gray-800 text-white decimal-button' },
    { id: 'equals', label: '=', action: handleEquals, className: 'bg-orange-500 hover:bg-orange-600 text-white equals-button' }
  ]

  const scientificButtons = [
    { id: 'sin', label: 'sin', action: () => handleScientificFunction('sin'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-sin' },
    { id: 'cos', label: 'cos', action: () => handleScientificFunction('cos'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-cos' },
    { id: 'tan', label: 'tan', action: () => handleScientificFunction('tan'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-tan' },
    { id: 'log', label: 'log', action: () => handleScientificFunction('log'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-log' },
    
    { id: 'ln', label: 'ln', action: () => handleScientificFunction('ln'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-ln' },
    { id: 'sqrt', label: '√', action: () => handleScientificFunction('√'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-√' },
    { id: 'square', label: 'x²', action: () => handleScientificFunction('x²'), className: 'bg-blue-600 hover:bg-blue-700 text-white scientific-x²' },
    { id: 'power', label: '^', action: () => handleOperation('^'), className: 'bg-blue-600 hover:bg-blue-700 text-white operation-^' }
  ]

  return (
    <div className={`calculator-container h-full bg-black text-white ${isVisible ? 'animate__animated' : ''}`}>
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mr-2"
            onClick={onBack}
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">{t.appNames.calculator}</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="history-toggle text-white hover:bg-white/20"
            onClick={toggleHistory}
          >
            📜
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mode-toggle text-white hover:bg-white/20"
            onClick={toggleMode}
          >
            {scientificMode ? '🔬' : '📊'}
          </Button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-gray-800 p-4 border-b border-gray-700 max-h-32 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">History</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400">No calculations yet</p>
          ) : (
            <div className="space-y-1">
              {history.map((calculation, index) => (
                <p key={index} className="text-xs text-gray-300 font-mono">
                  {calculation}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Display */}
      <div className="bg-black p-6 text-right border-b border-gray-700">
        <div className="text-4xl font-light overflow-hidden">
          {display}
        </div>
        {operation && (
          <div className="text-sm text-orange-400 mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Scientific Functions */}
      {scientificMode && (
        <div className="bg-gray-800 p-3">
          <div className="grid grid-cols-4 gap-2">
            {scientificButtons.map((button) => (
              <Button
                key={button.id}
                className={`${button.className} h-12 text-sm font-medium transition-all duration-150`}
                onClick={button.action}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Basic Calculator Buttons */}
      <div className="flex-1 bg-gray-900 p-4">
        <div className="grid grid-cols-4 gap-3 h-full">
          {basicButtons.map((button) => (
            <Button
              key={button.id}
              className={`${button.className} h-16 text-xl font-semibold transition-all duration-150 ${
                button.id === '0' ? 'col-span-2' : ''
              }`}
              onClick={button.action}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="bg-gray-800 px-4 py-2 text-center">
        <p className="text-xs text-gray-400">
          {scientificMode ? 'Scientific Calculator' : 'Basic Calculator'}
          {!isNetworkConnected && ' • Offline Mode'}
        </p>
      </div>
    </div>
  )
}