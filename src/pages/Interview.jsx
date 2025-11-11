import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { INTERVIEW_QUESTIONS } from '../constants/questions'
import Recorder from '../components/Recorder'
import ProgressBar from '../components/ProgressBar'

const TOTAL_QUESTIONS = INTERVIEW_QUESTIONS.length

export default function Interview() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    loadProgress()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
    } else {
      setUser(user)
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check how many responses the user has already submitted
    const { data, error } = await supabase
      .from('interview_responses')
      .select('question_number')
      .eq('user_id', user.id)
      .order('question_number', { ascending: true })

    if (error) {
      console.error('Error loading progress:', error)
      return
    }

    if (data && data.length > 0) {
      const completedQuestions = data.map((r) => r.question_number)
      const maxCompleted = Math.max(...completedQuestions)
      // If user has completed all questions, redirect to completion page
      if (maxCompleted >= TOTAL_QUESTIONS) {
        navigate('/completed')
        return
      }
      // Otherwise, continue from the next question
      setCurrentQuestion(maxCompleted + 1)
    }
  }

  const handleRecordingComplete = async (blob) => {
    if (!user) return

    setUploading(true)
    try {
      // Upload video to Supabase Storage
      const filePath = `interviews/${user.id}/${currentQuestion}.webm`

      const { error: uploadError } = await supabase.storage
        .from('interview-videos')
        .upload(filePath, blob, {
          contentType: 'video/webm',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('interview-videos').getPublicUrl(filePath)

      // Save response to database (upsert to allow re-recording)
      const { error: dbError } = await supabase
        .from('interview_responses')
        .upsert({
          user_id: user.id,
          user_email: user.email,
          question_number: currentQuestion,
          video_url: publicUrl,
          timestamp: new Date().toISOString(),
        }, {
          onConflict: 'user_id,question_number'
        })

      if (dbError) {
        throw dbError
      }

      // Move to next question or completion page
      if (currentQuestion < TOTAL_QUESTIONS) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        navigate('/completed')
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      alert('Failed to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (currentQuestion > TOTAL_QUESTIONS) {
    navigate('/completed')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Video Interview
            </h1>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>

          <ProgressBar current={currentQuestion} total={TOTAL_QUESTIONS} />

          <div className="mb-6">
            <p className="text-lg text-gray-600 mb-2">
              Question {currentQuestion} of {TOTAL_QUESTIONS}
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {INTERVIEW_QUESTIONS[currentQuestion - 1]}
            </h2>
          </div>

          {uploading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Uploading your response...</p>
            </div>
          ) : (
            <Recorder
              onRecordingComplete={handleRecordingComplete}
              questionNumber={currentQuestion}
            />
          )}

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>You have up to 90 seconds to record your answer.</p>
            <p className="mt-1">
              Recording will automatically stop after 90 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

