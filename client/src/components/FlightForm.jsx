import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FlightForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    flightNumber: '',
    eventId: '',
    arrivalDate: '',
    arrivalTime: ''
  })
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events')
      setEvents(res.data)
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const flightData = {
        flightNumber: formData.flightNumber,
        eventId: formData.eventId,
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime
      }

      await axios.post('/flights', flightData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add flight')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Your Flight</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loadingEvents ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          No events available. Please contact an admin to create an event.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event / Destination *
            </label>
            <select
              name="eventId"
              required
              value={formData.eventId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name} - {event.destination}
                </option>
              ))}
            </select>
            {formData.eventId && (
              <p className="mt-1 text-sm text-gray-500">
                {events.find(e => e.id === formData.eventId)?.description || ''}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number *
            </label>
            <input
              type="text"
              name="flightNumber"
              required
              value={formData.flightNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="AA1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Date *
            </label>
            <input
              type="date"
              name="arrivalDate"
              required
              value={formData.arrivalDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Time *
            </label>
            <input
              type="time"
              name="arrivalTime"
              required
              value={formData.arrivalTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Adding Flight...' : 'Add Flight'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
