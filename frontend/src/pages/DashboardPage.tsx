function DashboardPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Total Trips</h3>
            <p className="text-3xl font-bold text-blue-600">42</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Active Trucks</h3>
            <p className="text-3xl font-bold text-green-600">8</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">$12,450</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Fuel Costs</h3>
            <p className="text-3xl font-bold text-red-600">$3,200</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Dashboard loaded successfully!</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;