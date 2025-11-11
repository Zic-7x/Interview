import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAILS } from '../constants/adminEmails'
import { INTERVIEW_QUESTIONS } from '../constants/questions'

export default function AdminReview() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (user) {
      loadCompletedUsers()
    }
  }, [user])

  useEffect(() => {
    if (selectedUser) {
      loadUserResponses(selectedUser.id)
    }
  }, [selectedUser])

  const checkAdminAccess = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      navigate('/login')
      return
    }

    // Check if user is in the hardcoded admin list
    if (!ADMIN_EMAILS.includes(currentUser.email)) {
      alert('Access denied. Admin only.')
      navigate('/interview')
      return
    }

    // Verify admin status in database (RLS will also enforce this for data access)
    // Users can read their own admin status via RLS policy
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle()

    if (adminError) {
      console.error('Error checking admin status:', adminError)
    }

    if (!adminData) {
      console.warn('User is in ADMIN_EMAILS but not in admins table. RLS policies may block data access. Please add them to the admins table in Supabase.')
      // Still allow UI access if in ADMIN_EMAILS, but data access will be blocked by RLS
    }

    setUser(currentUser)
    setLoading(false)
  }

  const loadCompletedUsers = async () => {
    try {
      // Get all users who have completed all 20 questions
      const { data, error } = await supabase
        .from('interview_responses')
        .select('user_id, question_number')
        .order('question_number', { ascending: true })

      if (error) throw error

      // Group by user_id and count questions
      const userQuestionCounts = {}
      data.forEach((response) => {
        if (!userQuestionCounts[response.user_id]) {
          userQuestionCounts[response.user_id] = new Set()
        }
        userQuestionCounts[response.user_id].add(response.question_number)
      })

      // Filter users who have completed all 20 questions
      const completedUserIds = Object.keys(userQuestionCounts).filter(
        (userId) => userQuestionCounts[userId].size === INTERVIEW_QUESTIONS.length
      )

      // Get user emails from auth (we'll need to fetch user metadata)
      // Note: Supabase doesn't allow querying auth.users directly from client
      // So we'll need to store user email in the interview_responses table
      // For now, we'll show user IDs and you can enhance this later

      // Get unique user responses with user info
      const { data: userResponses, error: userError } = await supabase
        .from('interview_responses')
        .select('user_id, user_email')
        .in('user_id', completedUserIds)
        .order('timestamp', { ascending: false })

      if (userError) throw userError

      // Get unique users
      const uniqueUsers = {}
      userResponses.forEach((response) => {
        if (!uniqueUsers[response.user_id]) {
          uniqueUsers[response.user_id] = {
            id: response.user_id,
            email: response.user_email || response.user_id,
          }
        }
      })

      setUsers(Object.values(uniqueUsers))
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users')
    }
  }

  const loadUserResponses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('interview_responses')
        .select('*')
        .eq('user_id', userId)
        .order('question_number', { ascending: true })

      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error loading responses:', error)
      alert('Failed to load responses')
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Review</h1>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed Interviews
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-500">No completed interviews yet.</p>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedUser?.id === user.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{user.id}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Video Responses */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Responses from {selectedUser.email}
                  </h2>
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {responses.length === 0 ? (
                      <p className="text-gray-500">Loading responses...</p>
                    ) : (
                      responses.map((response, index) => (
                        <div
                          key={response.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="text-md font-semibold text-gray-900 mb-2">
                            Question {response.question_number}:{' '}
                            {INTERVIEW_QUESTIONS[response.question_number - 1]}
                          </h3>
                          <video
                            controls
                            className="w-full rounded-lg"
                            src={response.video_url}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <p className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(response.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a user to view their interview responses
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

