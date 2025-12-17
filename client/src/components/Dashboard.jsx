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
        <div className="text-center text-hc-red font-bold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-hc-dark">My Flights</h1>
        <Link to="/flights/new" className="btn-primary">
          + Add Flight
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-hc-red text-hc-red px-4 py-3 rounded-hc mb-6 font-medium">
          {error}
        </div>
      )}

      {flights.length === 0 ? (
        <div className="card text-center py-12">
          
          <p className="text-hc-muted mb-4">You haven't added any flights yet.</p>
          <Link to="/flights/new" className="text-hc-red hover:text-red-600 font-bold">
            Add your first flight →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flights.map((flight) => (
            <div key={flight.id} className="card-interactive">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-hc-dark">
                    {flight.flightNumber}
                  </h3>
                  {flight.event && (
                    <p className="text-sm text-hc-muted">{flight.event.name}</p>
                  )}
                </div>
                {flight.isActive && (
                  <span className="bg-hc-green/20 text-hc-green text-xs font-bold px-3 py-1 rounded-hc-full">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {flight.event && (
                  <div>
                    <span className="text-hc-muted">Event:</span>{' '}
                    <span className="font-medium text-hc-dark">{flight.event.name} - {flight.event.destination}</span>
                  </div>
                )}
                <div>
                  <span className="text-hc-muted">Arrival:</span>{' '}
                  <span className="font-medium text-hc-dark">
                    {formatDate(flight.arrivalDate)} at {formatTime(flight.arrivalTime)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <Link
                  to={`/matches?flightId=${flight.id}`}
                  className="flex-1 bg-hc-red hover:bg-red-600 text-white text-center px-4 py-2 rounded-hc-full text-sm font-bold transition-all duration-200"
                >
                  Find Buddies
                </Link>
                <button
                  onClick={() => handleDelete(flight.id)}
                  className="bg-hc-darkless hover:bg-hc-dark text-white px-4 py-2 rounded-hc-full text-sm font-bold transition-all duration-200"
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
