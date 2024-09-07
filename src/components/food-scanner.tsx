'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Camera, SwitchCamera, Shuffle } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface FoodInfo {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

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

export function FoodScanner() {
  const [cameraActive, setCameraActive] = useState(false)
  const [foodInfo, setFoodInfo] = useState<FoodInfo | null>(null)
  const [analyzing, setAnalyzing] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentFont, setCurrentFont] = useState(fonts[0])
  const hasRunEffect = useRef(false)

  useEffect(() => {
    if (hasRunEffect.current) return
    hasRunEffect.current = true

    async function setupCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support camera access')
        }

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setCameras(videoDevices)

        if (videoDevices.length === 0) {
          throw new Error('No cameras available')
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: videoDevices[currentCameraIndex]?.deviceId }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setCameraActive(true)
            }).catch(e => {
              throw new Error('Failed to start video playback: ' + e.message)
            })
          }
        } else {
          throw new Error('Video element not found')
        }
      } catch (err) {
        setError('Failed to access camera: ' + (err as Error).message)
      }
    }

    setupCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const simulateFoodRecognition = setInterval(() => {
      const foods: FoodInfo[] = [
        { name: "Apple", calories: 95, protein: "0.5g", carbs: "25g", fat: "0.3g" },
        { name: "Banana", calories: 105, protein: "1.3g", carbs: "27g", fat: "0.4g" },
        { name: "Chicken Breast", calories: 165, protein: "31g", carbs: "0g", fat: "3.6g" },
        { name: "Broccoli", calories: 55, protein: "3.7g", carbs: "11g", fat: "0.6g" },
        { name: "Salmon", calories: 206, protein: "22g", carbs: "0g", fat: "13g" },
      ]
      
      setAnalyzing(false)
      setFoodInfo(foods[Math.floor(Math.random() * foods.length)])

      if (Math.random() < 0.2) {
        setAnalyzing(true)
        setFoodInfo(null)
      }
    }, 3000)

    return () => clearInterval(simulateFoodRecognition)
  }, [])

  const switchCamera = () => {
    setCurrentCameraIndex((prevIndex) => (prevIndex + 1) % cameras.length)
    setCameraActive(false)
    setError(null)
    hasRunEffect.current = false
  }

  const shuffleFont = () => {
    const newFont = fonts[Math.floor(Math.random() * fonts.length)]
    setCurrentFont(newFont)
  }

  return (
    <div className={`relative w-full h-screen bg-gray-900 overflow-hidden ${currentFont}`}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover z-10 ${cameraActive ? '' : 'hidden'}`}
      />
      {!cameraActive && (
        <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center z-10">
          <Camera className="w-16 h-16 text-gray-600" />
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded z-20">
        <p className="text-white text-sm">Live Camera</p>
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded z-20">
        <p className="text-white text-lg font-bold">FoodScan Pro</p>
      </div>

      {/* Glassy Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[25vh] bg-white bg-opacity-10 backdrop-filter backdrop-blur-md flex flex-col justify-center p-6 rounded-t-3xl shadow-lg z-20">
        {analyzing ? (
          <p className="text-white text-lg text-center">Analyzing food...</p>
        ) : foodInfo ? (
          <div className="space-y-2">
            <p className="text-white text-2xl font-bold">{foodInfo.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-white">Calories: <span className="font-semibold">{foodInfo.calories}</span></p>
              <p className="text-white">Protein: <span className="font-semibold">{foodInfo.protein}</span></p>
              <p className="text-white">Carbs: <span className="font-semibold">{foodInfo.carbs}</span></p>
              <p className="text-white">Fat: <span className="font-semibold">{foodInfo.fat}</span></p>
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

      {/* Camera switch button */}
      {cameras.length > 1 && (
        <Button 
          onClick={switchCamera} 
          className="absolute top-4 left-16 bg-white bg-opacity-20 hover:bg-opacity-30 z-20"
          size="sm"
        >
          <SwitchCamera className="w-4 h-4 mr-2" />
          Switch Camera
        </Button>
      )}

      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-30">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  )
}