import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFlights()
  }, [])

  const fetchFlights = async () => {
    try {
      const res = await axios.get('/flights/my-flights')
      setFlights(res.data)
    } catch (err) {
      setError('Failed to load flights')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return

    try {
      await axios.delete(`/flights/${id}`)
      fetchFlights()
    } catch (err) {
      alert('Failed to delete flight')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString || 'TBD'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Flights</h1>
        <Link
          to="/flights/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
        >
          + Add Flight
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {flights.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't added any flights yet.</p>
          <Link
            to="/flights/new"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Add your first flight →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flights.map((flight) => (
            <div key={flight._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {flight.flightNumber}
                  </h3>
                  <p className="text-sm text-gray-500">{flight.airline}</p>
                </div>
                {flight.isActive && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">From:</span>{' '}
                  <span className="font-medium">{flight.origin}</span>
                </div>
                <div>
                  <span className="text-gray-500">To:</span>{' '}
                  <span className="font-medium">{flight.destination}</span>
                </div>
                <div>
                  <span className="text-gray-500">Arrival:</span>{' '}
                  <span className="font-medium">
                    {formatDate(flight.arrivalDate)} at {formatTime(flight.arrivalTime)}
                  </span>
                </div>
                {flight.terminal && (
                  <div>
                    <span className="text-gray-500">Terminal:</span>{' '}
                    <span className="font-medium">{flight.terminal}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/matches?flightId=${flight._id}`}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium"
                >
                  Find Buddies
                </Link>
                <button
                  onClick={() => handleDelete(flight._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
