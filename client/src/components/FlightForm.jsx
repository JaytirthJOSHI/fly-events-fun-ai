import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FlightForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    terminal: '',
    gate: '',
    lookingFor: 'travel-buddy',
    notes: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Combine date and time for arrival/departure
      const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`)
      const arrivalDateTime = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`)

      const flightData = {
        ...formData,
        departureDate: departureDateTime,
        arrivalDate: arrivalDateTime
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Flight Information</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Airline *
            </label>
            <input
              type="text"
              name="airline"
              required
              value={formData.airline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="American Airlines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin *
            </label>
            <input
              type="text"
              name="origin"
              required
              value={formData.origin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <input
              type="text"
              name="destination"
              required
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Los Angeles, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date *
            </label>
            <input
              type="date"
              name="departureDate"
              required
              value={formData.departureDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time *
            </label>
            <input
              type="time"
              name="departureTime"
              required
              value={formData.departureTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terminal
            </label>
            <input
              type="text"
              name="terminal"
              value={formData.terminal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Terminal 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gate
            </label>
            <input
              type="text"
              name="gate"
              value={formData.gate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="A12"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Looking For
          </label>
          <select
            name="lookingFor"
            value={formData.lookingFor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="travel-buddy">Travel Buddy</option>
            <option value="ride-share">Ride Share</option>
            <option value="events">Events</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Any additional information..."
          />
        </div>

        <div className="flex space-x-4">
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
    </div>
  )
}
