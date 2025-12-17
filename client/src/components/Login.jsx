import { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleHcaLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await axios.get('/api/auth/login')
      // Redirect to Hack Club Auth
      window.location.href = res.data.authUrl
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Fly Events
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Find your perfect travel buddy
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleHcaLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? (
              'Redirecting...'
            ) : (
              <>
                <span>🔗</span>
                <span className="ml-2">Sign in with Hack Club</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          You'll be redirected to Hack Club Auth to sign in
        </div>
      </div>
    </div>
  )
}