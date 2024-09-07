'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Camera, Shuffle } from 'lucide-react'
import { Button } from "@/components/ui/button"

const fonts = [
  'font-sans',
  'font-serif',
  'font-mono',
  'font-exo',
  'font-orbitron',
  'font-rajdhani',
  'font-chakra-petch',
  'font-audiowide',
]

interface NutrientInfo {
  name: string;
  calories: number;
  carbs: string;
  fiber: string;
  vitaminC: string;
}

export function NutrientCamera() {
  const [analyzing, setAnalyzing] = useState(true)
  const [nutrientInfo, setNutrientInfo] = useState<NutrientInfo | null>(null)
  const [currentFont, setCurrentFont] = useState(fonts[0])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
      }
    }

    setupCamera()

    return () => {
      const video = videoRef.current
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const analyzeInterval = setInterval(() => {
      // Simulate AI analysis
      const foods = ['Apple', 'Banana', 'Orange', 'Broccoli', 'Chicken Breast']
      const randomFood = foods[Math.floor(Math.random() * foods.length)]
      
      setAnalyzing(false)
      setNutrientInfo({
        name: randomFood,
        calories: Math.floor(Math.random() * 200) + 50,
        carbs: `${Math.floor(Math.random() * 30) + 5}g`,
        fiber: `${Math.floor(Math.random() * 5) + 1}g`,
        vitaminC: `${Math.floor(Math.random() * 50) + 10}% DV`
      })

      // Simulate occasional "searching" state
      if (Math.random() < 0.2) {
        setAnalyzing(true)
        setNutrientInfo(null)
      }
    }, 3000) // Update every 3 seconds

    return () => clearInterval(analyzeInterval)
  }, [])

  const shuffleFont = () => {
    const newFont = fonts[Math.floor(Math.random() * fonts.length)]
    setCurrentFont(newFont)
  }

  return (
    <div className={`relative w-full h-screen bg-gray-900 overflow-hidden ${currentFont}`}>
      {/* Real Camera Feed */}
      {cameraActive ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <Camera className="w-16 h-16 text-gray-600" />
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded">
        <p className="text-white text-sm">Live Camera</p>
      </div>
      
      {/* Foodscan Logo */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded">
        <p className="text-white text-lg font-bold">Foodscan</p>
      </div>

      {/* Glassy Overlay (bottom 25% of screen) */}
      <div className="absolute bottom-0 left-0 right-0 h-[25vh] bg-white bg-opacity-10 backdrop-filter backdrop-blur-md flex flex-col justify-center p-6 rounded-t-3xl shadow-lg">
        {analyzing ? (
          <p className="text-white text-lg text-center">Analyzing food...</p>
        ) : nutrientInfo ? (
          <div className="space-y-2">
            <p className="text-white text-2xl font-bold">{nutrientInfo.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-white">Calories: <span className="font-semibold">{nutrientInfo.calories}</span></p>
              <p className="text-white">Carbs: <span className="font-semibold">{nutrientInfo.carbs}</span></p>
              <p className="text-white">Fiber: <span className="font-semibold">{nutrientInfo.fiber}</span></p>
              <p className="text-white">Vitamin C: <span className="font-semibold">{nutrientInfo.vitaminC}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-white text-lg text-center">Point camera at food to analyze</p>
        )}
        
        {/* Font Shuffle Button */}
        <Button 
          onClick={shuffleFont} 
          className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30"
          size="sm"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle Font
        </Button>
      </div>
    </div>
  )
}