export default function Trips() {
  // Mock data for demonstration
  const trips = [
    {
      id: '1',
      startingPoint: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      cargoType: 'Electronics',
      weight: 15000,
      company: 'TechCorp Logistics',
      rate: 2500,
      distance: 372,
      estimatedDuration: '6 hours',
      status: 'available',
      pickupDate: '2025-09-25',
      deliveryDate: '2025-09-26'
    },
    {
      id: '2',
      startingPoint: 'Houston, TX',
      destination: 'Dallas, TX',
      cargoType: 'Automotive Parts',
      weight: 22000,
      company: 'AutoFreight Inc',
      rate: 1800,
      distance: 239,
      estimatedDuration: '4 hours',
      status: 'in-progress',
      pickupDate: '2025-09-23',
      deliveryDate: '2025-09-24'
    },
    {
      id: '3',
      startingPoint: 'Miami, FL',
      destination: 'Atlanta, GA',
      cargoType: 'Food & Beverages',
      weight: 18500,
      company: 'Fresh Foods Transport',
      rate: 3200,
      distance: 663,
      estimatedDuration: '10 hours',
      status: 'available',
      pickupDate: '2025-09-26',
      deliveryDate: '2025-09-27'
    }
  ];

  const companies = [
    { id: '1', name: 'TechCorp Logistics', rating: 4.8, totalLoads: 150, contactInfo: 'contact@techcorp.com' },
    { id: '2', name: 'AutoFreight Inc', rating: 4.5, totalLoads: 89, contactInfo: 'logistics@autofreight.com' },
    { id: '3', name: 'Fresh Foods Transport', rating: 4.9, totalLoads: 200, contactInfo: 'dispatch@freshfoods.com' },
    { id: '4', name: 'BuildMat Haulers', rating: 4.3, totalLoads: 75, contactInfo: 'ops@buildmat.com' },
    { id: '5', name: 'ChemSafe Logistics', rating: 4.7, totalLoads: 120, contactInfo: 'safety@chemsafe.com' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Add New Trip
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Trips</label>
              <input
                type="text"
                placeholder="Search by location, cargo, or company..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Quick Add</h3>
            <p className="text-sm text-gray-600 mb-3">Create a new trip</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              Add Trip
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Load Board</h3>
            <p className="text-sm text-gray-600 mb-3">Browse available loads</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
              Browse Loads
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Route Planner</h3>
            <p className="text-sm text-gray-600 mb-3">Plan optimal routes</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
              Plan Route
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mb-3">View trip analytics</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
              View Stats
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {trip.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-lg font-bold text-green-600">${trip.rate.toLocaleString()}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-medium text-gray-900">
                    📍 {trip.startingPoint}
                  </p>
                  <p className="font-medium text-gray-900">
                    🏁 {trip.destination}
                  </p>
                  <p className="text-sm text-gray-500">{trip.distance} miles • {trip.estimatedDuration}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Cargo Details</p>
                  <p className="font-medium text-gray-900">📦 {trip.cargoType}</p>
                  <p className="text-sm text-gray-500">⚖️ {trip.weight.toLocaleString()} lbs</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium text-gray-900">🏢 {trip.company}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pickup Date</p>
                    <p className="text-sm font-medium text-gray-900">📅 {trip.pickupDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date</p>
                    <p className="text-sm font-medium text-gray-900">📅 {trip.deliveryDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                  {trip.status === 'available' ? 'Assign Driver' : 'View Details'}
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200">
                  📱 Contact Company
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Trip Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">➕ Add New Trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Point</label>
              <input
                type="text"
                placeholder="e.g., Los Angeles, CA"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                placeholder="e.g., Phoenix, AZ"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select cargo type</option>
                <option value="Electronics">📱 Electronics</option>
                <option value="Automotive Parts">🔧 Automotive Parts</option>
                <option value="Food & Beverages">🍎 Food & Beverages</option>
                <option value="Construction Materials">🏗️ Construction Materials</option>
                <option value="Chemicals">⚗️ Chemicals</option>
                <option value="General Freight">📦 General Freight</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                placeholder="e.g., 15000"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
              <input
                type="number"
                placeholder="e.g., 2500"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700">
                ➕ Create Trip
              </button>
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🤝 Partner Companies Offering Loads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">🏢 {company.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">{company.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">📊 {company.totalLoads} loads completed</p>
                <p className="text-sm text-gray-500 mb-3">📧 {company.contactInfo}</p>
                <div className="space-y-2">
                  <button className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm hover:bg-blue-200">
                    📋 View Available Loads
                  </button>
                  <button className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm hover:bg-green-200">
                    📞 Contact Company
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}