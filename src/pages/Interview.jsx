import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { INTERVIEW_QUESTIONS } from '../constants/questions'
import Recorder from '../components/Recorder'
import ProgressBar from '../components/ProgressBar'
import Logo from '../components/Logo'

const TOTAL_QUESTIONS = INTERVIEW_QUESTIONS.length

export default function Interview() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
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
    if (!user) {
      setUploadError('User not authenticated. Please log in again.')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    setUploading(true)
    setUploadError(null) // Clear any previous errors
    try {
      // Verify user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !currentUser) {
        throw new Error('Authentication failed. Please log in again.')
      }

      // Upload video to Supabase Storage
      const filePath = `interviews/${user.id}/${currentQuestion}.webm`

      // Delete existing file if it exists (for re-recording)
      const { error: deleteError } = await supabase.storage
        .from('interview-videos')
        .remove([filePath])
      
      // Ignore delete errors (file might not exist)
      if (deleteError && deleteError.message !== 'Object not found') {
        console.warn('Warning: Could not delete existing file:', deleteError)
      }

      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('interview-videos')
        .upload(filePath, blob, {
          contentType: 'video/webm',
          cacheControl: '3600',
        })

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
        })
        
        // Provide more specific error messages
        if (uploadError.message?.includes('new row violates row-level security policy')) {
          throw new Error('Upload denied by security policy. Please check storage policies in Supabase.')
        } else if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please create "interview-videos" bucket in Supabase.')
        } else if (uploadError.message?.includes('JWT expired')) {
          throw new Error('Session expired. Please log in again.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`)
        }
      }

      if (!uploadData) {
        throw new Error('Upload failed: No data returned')
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('interview-videos').getPublicUrl(filePath)

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded video')
      }

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
        console.error('Database error:', dbError)
        throw new Error(`Failed to save response: ${dbError.message || 'Database error'}`)
      }

      // Move to next question or completion page
      if (currentQuestion < TOTAL_QUESTIONS) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        navigate('/completed')
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      let errorMessage = error.message || 'Failed to upload video. Please try again.'
      
      // Provide helpful error messages based on error type
      if (errorMessage.includes('security policy') || errorMessage.includes('row-level security')) {
        errorMessage = '❌ Upload blocked by security policy.\n\nPlease run the storage-policies.sql file in Supabase SQL Editor to fix this.'
      } else if (errorMessage.includes('Bucket not found')) {
        errorMessage = '❌ Storage bucket not found.\n\nPlease create "interview-videos" bucket in Supabase Dashboard → Storage.'
      } else if (errorMessage.includes('expired') || errorMessage.includes('Authentication')) {
        errorMessage = '❌ Session expired.\n\nPlease refresh the page and log in again.'
      } else if (errorMessage.includes('JWT')) {
        errorMessage = '❌ Authentication error.\n\nPlease log out and log back in.'
      }
      
      setUploadError(errorMessage)
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
          <div className="flex justify-between items-center mb-6 gap-3">
            <Logo size={36} showText={true} />
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

          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-2">Upload Failed</h3>
                  <p className="text-red-700 text-sm whitespace-pre-line">{uploadError}</p>
                  <p className="text-red-600 text-xs mt-3">
                    💡 Check storage-policies.sql file and run it in Supabase SQL Editor
                  </p>
                </div>
                <button
                  onClick={() => setUploadError(null)}
                  className="ml-4 text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {uploading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Uploading your response...</p>
            </div>
          ) : (
            <Recorder
              onRecordingComplete={handleRecordingComplete}
              questionNumber={currentQuestion}
              maxTime={currentQuestion === 1 ? 180 : 60}
            />
          )}

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>You have up to {currentQuestion === 1 ? '3 minutes' : '60 seconds'} to record your answer.</p>
            <p className="mt-1">
              Recording will automatically stop after {currentQuestion === 1 ? '3 minutes' : '60 seconds'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

