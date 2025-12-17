import { Link } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-2xl font-bold text-indigo-600">
              ✈️ Fly Events
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Flights
              </Link>
              <Link
                to="/flights/new"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Add Flight
              </Link>
              <Link
                to="/matches"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Buddies
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">{user?.name}</span>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
