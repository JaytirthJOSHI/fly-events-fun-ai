import { Link } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-hc-dark shadow-hc-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img 
                src="https://assets.hackclub.com/flag-standalone.svg" 
                alt="Hack Club" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white">Fly Events</span>
            </Link>
            <div className="flex space-x-1">
              <Link
                to="/dashboard"
                className="text-hc-smoke hover:text-hc-red hover:bg-hc-darkless px-4 py-2 rounded-hc-full text-sm font-medium transition-all duration-200"
              >
                My Flights
              </Link>
              <Link
                to="/flights/new"
                className="text-hc-smoke hover:text-hc-red hover:bg-hc-darkless px-4 py-2 rounded-hc-full text-sm font-medium transition-all duration-200"
              >
                Add Flight
              </Link>
              <Link
                to="/matches"
                className="text-hc-smoke hover:text-hc-red hover:bg-hc-darkless px-4 py-2 rounded-hc-full text-sm font-medium transition-all duration-200"
              >
                Find Buddies
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/events"
                    className="text-hc-smoke hover:text-hc-red hover:bg-hc-darkless px-4 py-2 rounded-hc-full text-sm font-medium transition-all duration-200"
                  >
                    Events
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-hc-smoke hover:text-hc-red hover:bg-hc-darkless px-4 py-2 rounded-hc-full text-sm font-medium transition-all duration-200"
                  >
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-hc-muted text-sm">{user?.name}</span>
            <button
              onClick={onLogout}
              className="bg-hc-red hover:bg-red-600 text-white px-4 py-2 rounded-hc-full text-sm font-bold transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
