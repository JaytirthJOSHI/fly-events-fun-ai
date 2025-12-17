import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function Matches() {
  const [searchParams] = useSearchParams()
  const flightId = searchParams.get('flightId')
  
  const [searchForm, setSearchForm] = useState({
    destination: '',
    arrivalDate: '',
    timeWindow: '4'
  })
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (flightId) {
      fetchMatchesForFlight(flightId)
    }
  }, [flightId])

  const fetchMatchesForFlight = async (id) => {
    setLoading(true)
    try {
      const res = await axios.get(`/matches/flight/${id}`)
      setMatches(res.data.matches || [])
      if (res.data.flight) {
        setSearchForm({
          destination: res.data.flight.destination,
          arrivalDate: new Date(res.data.flight.arrivalDate).toISOString().split('T')[0],
          timeWindow: '4'
        })
      }
    } catch (err) {
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        destination: searchForm.destination,
        arrivalDate: searchForm.arrivalDate,
        timeWindow: searchForm.timeWindow
      })

      const res = await axios.get(`/matches/find?${params}`)
      setMatches(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search for matches')
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Travel Buddies</h1>

      {!flightId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  value={searchForm.destination}
                  onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="LAX, JFK, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  required
                  value={searchForm.arrivalDate}
                  onChange={(e) => setSearchForm({ ...searchForm, arrivalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Window (hours)
                </label>
                <select
                  value={searchForm.timeWindow}
                  onChange={(e) => setSearchForm({ ...searchForm, timeWindow: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="2">±2 hours</option>
                  <option value="4">±4 hours</option>
                  <option value="6">±6 hours</option>
                  <option value="8">±8 hours</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search for Buddies'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && matches.length === 0 ? (
        <div className="text-center py-12">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No matches found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Found <strong>{matches.length}</strong> {matches.length === 1 ? 'person' : 'people'} arriving around the same time!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <div key={match._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {match.user?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">{match.user?.email}</p>
                  </div>
                  {match.timeDifferenceHours !== undefined && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      ±{match.timeDifferenceHours}h
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Flight:</span>{' '}
                    <span className="font-medium">{match.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Airline:</span>{' '}
                    <span className="font-medium">{match.airline}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Arriving:</span>{' '}
                    <span className="font-medium">
                      {formatDate(match.arrivalDate)} at {formatTime(match.arrivalTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">From:</span>{' '}
                    <span className="font-medium">{match.origin}</span>
                  </div>
                  {match.terminal && (
                    <div>
                      <span className="text-gray-500">Terminal:</span>{' '}
                      <span className="font-medium">{match.terminal}</span>
                    </div>
                  )}
                  {match.lookingFor && (
                    <div>
                      <span className="text-gray-500">Looking for:</span>{' '}
                      <span className="font-medium capitalize">
                        {match.lookingFor.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {match.notes && (
                  <div className="border-t pt-3 mb-4">
                    <p className="text-sm text-gray-600 italic">"{match.notes}"</p>
                  </div>
                )}

                {match.user?.phone && (
                  <div className="border-t pt-3">
                    <p className="text-sm">
                      <span className="text-gray-500">Contact:</span>{' '}
                      <a 
                        href={`tel:${match.user.phone}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {match.user.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
