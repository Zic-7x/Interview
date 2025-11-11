import React, { useRef, useEffect, useState } from 'react'

export default function Recorder({ onRecordingComplete, questionNumber, maxTime = 60 }) {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(maxTime)
  const [stream, setStream] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    // Reset time remaining when maxTime or questionNumber changes
    setTimeRemaining(maxTime)
  }, [maxTime, questionNumber])

  useEffect(() => {
    let currentStream = null

    // Request camera and microphone access
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentStream = mediaStream
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error)
        alert('Could not access camera and microphone. Please grant permissions.')
      })

    // Cleanup on unmount or question change
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop all tracks
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [questionNumber])

  const startRecording = () => {
    if (!stream) {
      alert('Camera not available')
      return
    }

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      onRecordingComplete(blob)
      setIsRecording(false)
      setTimeRemaining(maxTime)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setTimeRemaining(maxTime)

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      // Timer will be cleared in onstop callback
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-auto max-h-96"
        />
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Recording: {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            disabled={timeRemaining === 0}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  )
}

