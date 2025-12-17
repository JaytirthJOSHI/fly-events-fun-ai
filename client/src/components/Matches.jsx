import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function Matches() {
  const [searchParams] = useSearchParams()
  const flightId = searchParams.get('flightId')
  
  const [events, setEvents] = useState([])
  const [searchForm, setSearchForm] = useState({
    eventId: '',
    arrivalDate: '',
    timeWindow: '4'
  })
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
    if (flightId) {
      fetchMatchesForFlight(flightId)
    }
  }, [flightId])

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events')
      setEvents(res.data)
    } catch (err) {
      console.error('Failed to load events')
    }
  }

  const fetchMatchesForFlight = async (id) => {
    setLoading(true)
    try {
      const res = await axios.get(`/matches/flight/${id}`)
      setMatches(res.data.matches || [])
      if (res.data.flight) {
        setSearchForm({
          eventId: res.data.flight.eventId || '',
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
        eventId: searchForm.eventId,
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
      <h1 className="text-3xl font-bold text-hc-dark mb-8">Find Travel Buddies</h1>

      {!flightId && (
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-hc-dark mb-2">
                  Event *
                </label>
                <select
                  required
                  value={searchForm.eventId}
                  onChange={(e) => setSearchForm({ ...searchForm, eventId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-hc-dark mb-2">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  required
                  value={searchForm.arrivalDate}
                  onChange={(e) => setSearchForm({ ...searchForm, arrivalDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-hc-dark mb-2">
                  Time Window (hours)
                </label>
                <select
                  value={searchForm.timeWindow}
                  onChange={(e) => setSearchForm({ ...searchForm, timeWindow: e.target.value })}
                  className="input-field"
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
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search for Buddies'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-hc-red text-hc-red px-4 py-3 rounded-hc mb-6 font-medium">
          {error}
        </div>
      )}

      {loading && matches.length === 0 ? (
        <div className="text-center py-12 text-hc-red font-bold animate-pulse">
          Loading matches...
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-12">
          
          <p className="text-hc-muted">No matches found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-hc-cyan/20 border-2 border-hc-cyan rounded-hc-lg p-4">
            <p className="text-hc-dark font-medium">
              Found <strong className="text-hc-cyan">{matches.length}</strong> {matches.length === 1 ? 'person' : 'people'} arriving around the same time!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <div key={match.id} className="card-interactive">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-hc-dark">
                      {match.user?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-hc-muted">{match.user?.email}</p>
                  </div>
                  {match.timeDifferenceHours !== undefined && (
                    <span className="bg-hc-green/20 text-hc-green text-xs font-bold px-3 py-1 rounded-hc-full">
                      ±{match.timeDifferenceHours}h
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {match.event && (
                    <div>
                      <span className="text-hc-muted">Event:</span>{' '}
                      <span className="font-medium text-hc-dark">{match.event.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-hc-muted">Flight:</span>{' '}
                    <span className="font-medium text-hc-dark">{match.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-hc-muted">Arriving:</span>{' '}
                    <span className="font-medium text-hc-dark">
                      {formatDate(match.arrivalDate)} at {formatTime(match.arrivalTime)}
                    </span>
                  </div>
                </div>

                {match.user?.phone && (
                  <div className="border-t border-hc-border pt-3">
                    <p className="text-sm">
                      <span className="text-hc-muted">Contact:</span>{' '}
                      <a 
                        href={`tel:${match.user.phone}`}
                        className="text-hc-red hover:text-red-600 font-bold"
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
