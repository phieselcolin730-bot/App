'use client'

import React from 'react'

interface ServerStatusProps {}

export default function ServerStatus(): JSX.Element {
  return (
    <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-3 py-1 rounded text-sm">
      ✅ Server Running
    </div>
  )
}