export default // Driver Management Page - Enhanced with color themes
function Drivers() {
  // Mock driver data
  const drivers = [
    {
      id: 1,
      name: "John Martinez",
      licenseNumber: "DL123456789",
      phone: "(555) 123-4567",
      email: "john.martinez@email.com",
      status: "active",
      experience: "8 years",
      currentTruck: "TRK-001",
      location: "Los Angeles, CA",
      rating: 4.8,
      totalTrips: 342,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2019-03-15", expiryDate: "2027-03-15", status: "valid" },
        { type: "Hazmat Endorsement", issueDate: "2020-01-10", expiryDate: "2026-01-10", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "valid" },
        { type: "Defensive Driving", issueDate: "2024-01-15", expiryDate: "2025-01-15", status: "expiring_soon" }
      ],
      emergencyContact: {
        name: "Maria Martinez",
        relationship: "Spouse",
        phone: "(555) 123-4568"
      }
    },
    {
      id: 2,
      name: "Sarah Johnson",
      licenseNumber: "DL987654321",
      phone: "(555) 234-5678",
      email: "sarah.johnson@email.com",
      status: "active",
      experience: "12 years",
      currentTruck: "TRK-003",
      location: "Phoenix, AZ",
      rating: 4.9,
      totalTrips: 587,
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b1c8?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2015-08-20", expiryDate: "2027-08-20", status: "valid" },
        { type: "Passenger Endorsement", issueDate: "2018-04-12", expiryDate: "2026-04-12", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2024-03-15", expiryDate: "2026-03-15", status: "valid" },
        { type: "Safety Training", issueDate: "2024-09-01", expiryDate: "2025-09-01", status: "valid" }
      ],
      emergencyContact: {
        name: "Robert Johnson",
        relationship: "Father",
        phone: "(555) 234-5679"
      }
    },
    {
      id: 3,
      name: "Mike Thompson",
      licenseNumber: "DL456789123",
      phone: "(555) 345-6789",
      email: "mike.thompson@email.com",
      status: "on_leave",
      experience: "5 years",
      currentTruck: "Unassigned",
      location: "Dallas, TX",
      rating: 4.6,
      totalTrips: 198,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2021-11-30", expiryDate: "2029-11-30", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2023-12-01", expiryDate: "2025-12-01", status: "valid" },
        { type: "First Aid Certification", issueDate: "2024-02-14", expiryDate: "2026-02-14", status: "valid" }
      ],
      emergencyContact: {
        name: "Linda Thompson",
        relationship: "Wife",
        phone: "(555) 345-6790"
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualificationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get card color theme based on driver status and rating
  const getCardTheme = (driver: any) => {
    const { status, rating } = driver;
    
    if (status === 'active' && rating >= 4.8) {
      return {
        background: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
        border: 'border-emerald-200 hover:border-emerald-300',
        shadow: 'shadow-lg hover:shadow-emerald-200/50',
        glow: 'hover:shadow-2xl hover:shadow-emerald-500/20',
        accent: 'border-l-4 border-l-emerald-500'
      };
    } else if (status === 'active' && rating >= 4.5) {
      return {
        background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        border: 'border-blue-200 hover:border-blue-300',
        shadow: 'shadow-lg hover:shadow-blue-200/50',
        glow: 'hover:shadow-2xl hover:shadow-blue-500/20',
        accent: 'border-l-4 border-l-blue-500'
      };
    } else if (status === 'active') {
      return {
        background: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50',
        border: 'border-cyan-200 hover:border-cyan-300',
        shadow: 'shadow-lg hover:shadow-cyan-200/50',
        glow: 'hover:shadow-2xl hover:shadow-cyan-500/20',
        accent: 'border-l-4 border-l-cyan-500'
      };
    } else if (status === 'on_leave') {
      return {
        background: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
        border: 'border-amber-200 hover:border-amber-300',
        shadow: 'shadow-lg hover:shadow-amber-200/50',
        glow: 'hover:shadow-2xl hover:shadow-amber-500/20',
        accent: 'border-l-4 border-l-amber-500'
      };
    } else {
      return {
        background: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
        border: 'border-gray-200 hover:border-gray-300',
        shadow: 'shadow-lg hover:shadow-gray-200/50',
        glow: 'hover:shadow-2xl hover:shadow-gray-500/20',
        accent: 'border-l-4 border-l-gray-400'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            🚛 Hire New Driver
          </button>
        </div>

        {/* Driver Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Drivers</h3>
            <p className="text-2xl font-bold text-blue-600">{drivers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Drivers</h3>
            <p className="text-2xl font-bold text-green-600">
              {drivers.filter(d => d.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">On Leave</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {drivers.filter(d => d.status === 'on_leave').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Avg Rating</h3>
            <p className="text-2xl font-bold text-purple-600">
              {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Driver Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {drivers.map((driver) => {
            const cardTheme = getCardTheme(driver);
            return (
              <div 
                key={driver.id} 
                className={`${cardTheme.background} ${cardTheme.border} ${cardTheme.shadow} ${cardTheme.glow} ${cardTheme.accent} rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden`}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Driver Header */}
                <div className="flex items-center mb-4 relative z-10">
                  <div className="relative">
                    <img
                      src={driver.profileImage}
                      alt={driver.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-white/50 shadow-lg"
                    />
                    {/* Status indicator dot */}
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      driver.status === 'active' ? 'bg-green-500 animate-pulse' : 
                      driver.status === 'on_leave' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-sm text-gray-600">📍 {driver.location}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-sm ${i < Math.floor(driver.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700 ml-2">{driver.rating}</span>
                      <span className="text-xs text-gray-500 ml-2">({driver.totalTrips} trips)</span>
                    </div>
                  </div>
                </div>

                {/* Driver Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                  <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">License</p>
                    <p className="text-sm font-medium text-gray-900">{driver.licenseNumber}</p>
                    <p className="text-xs text-gray-600">Valid CDL</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{driver.experience}</p>
                    <p className="text-xs text-gray-600">Commercial driving</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                      driver.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {driver.status === 'active' ? '🟢 Active' : 
                       driver.status === 'on_leave' ? '🟡 On Leave' : '🔴 Inactive'}
                    </span>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{driver.phone}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                      📞 Call
                    </button>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="mb-4 relative z-10">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">🏆 Qualifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {driver.qualifications.map((qual, index) => (
                      <span 
                        key={index}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          qual.status === 'valid' ? 'bg-green-100 text-green-800 border border-green-200' :
                          qual.status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {qual.type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mb-4 relative z-10">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">🚨 Emergency Contact</h4>
                  <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm font-medium text-gray-900">{driver.emergencyContact.name}</p>
                    <p className="text-xs text-gray-600">{driver.emergencyContact.relationship}</p>
                    <p className="text-xs text-gray-600">{driver.emergencyContact.phone}</p>
                  </div>
                </div>

                {/* Recent Performance */}
                <div className="mb-4 relative z-10">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">� Recent Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">On-time Delivery</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(driver.rating * 20)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{Math.round(driver.rating * 20)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Safety Score</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(85)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900">85%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Customer Rating</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(driver.rating * 18)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{Math.round(driver.rating * 18)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 relative z-10">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl">
                    �️ View Profile
                  </button>
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl">
                    � Assign Trip
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Driver Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚛 Hire New Driver</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g., John Smith"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="john.smith@email.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input
                type="text"
                placeholder="DL123456789"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select experience</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g., Los Angeles, CA"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Qualifications */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Required Qualifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL Class</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select CDL class</option>
                    <option value="A">Class A</option>
                    <option value="B">Class B</option>
                    <option value="C">Class C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CDL Expiry Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOT Medical Expiry</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Endorsements</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select endorsement</option>
                    <option value="hazmat">Hazmat</option>
                    <option value="passenger">Passenger</option>
                    <option value="school_bus">School Bus</option>
                    <option value="tanker">Tanker</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚨 Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Jane Smith"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-span-full">
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-green-700">
                ✅ Hire Driver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
