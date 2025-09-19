import React, { useState, useEffect } from 'react';

interface Trip {
  id: string;
  truckId: string;
  startLocation: string;
  endLocation: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  estimatedDistance?: number;
  actualDistance?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
  notes?: string;
  truck: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
}

const statusColors = {
  SCHEDULED: '#2196f3',
  IN_PROGRESS: '#ff9800',
  COMPLETED: '#4caf50',
  CANCELLED: '#f44336',
  DELAYED: '#9c27b0'
};

export const DriverTripHistory = ({ driverId }: { driverId: string }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDriverTrips();
  }, [driverId, page, statusFilter]);

  const fetchDriverTrips = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'scheduledStartTime',
        sortOrder: 'desc',
        ...(statusFilter && { status: statusFilter })
      });

      // Mock API call - replace with actual API
      const response = await fetch(`/api/drivers/${driverId}/trips?${queryParams}`);
      const data = await response.json();
      
      setTrips(data.trips || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        color: 'white',
        backgroundColor: statusColors[status as keyof typeof statusColors] || '#666'
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '2rem', fontWeight: 'bold' }}>My Trips</h1>
        <p style={{ margin: 0, color: '#666' }}>View your assigned trips and their status</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '150px' }}
            >
              <option value="">All Trips</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div style={{ backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading your trips...</div>
          </div>
        ) : trips.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>No trips found</div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              {statusFilter ? 'Try changing the status filter.' : 'You have no assigned trips yet.'}
            </div>
          </div>
        ) : (
          trips.map((trip, index) => (
            <div
              key={trip.id}
              style={{
                padding: '20px',
                borderBottom: index < trips.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      {trip.startLocation} → {trip.endLocation}
                    </h3>
                    {getStatusBadge(trip.status)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Truck</div>
                      <div style={{ fontWeight: '500' }}>
                        {trip.truck.licensePlate}
                      </div>
                      <div style={{ fontSize: '14px', color: '#999' }}>
                        {trip.truck.make} {trip.truck.model}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Scheduled Start</div>
                      <div style={{ fontWeight: '500' }}>
                        {formatDate(trip.scheduledStartTime)}
                      </div>
                    </div>
                    
                    {trip.scheduledEndTime && (
                      <div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Scheduled End</div>
                        <div style={{ fontWeight: '500' }}>
                          {formatDate(trip.scheduledEndTime)}
                        </div>
                      </div>
                    )}
                    
                    {trip.estimatedDistance && (
                      <div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Distance</div>
                        <div style={{ fontWeight: '500' }}>
                          {trip.estimatedDistance} km
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actual Times */}
                  {(trip.actualStartTime || trip.actualEndTime) && (
                    <div style={{ 
                      backgroundColor: '#f0f7ff', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      marginTop: '8px',
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '12px' 
                    }}>
                      {trip.actualStartTime && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Actual Start</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {formatDate(trip.actualStartTime)}
                          </div>
                        </div>
                      )}
                      {trip.actualEndTime && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Actual End</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {formatDate(trip.actualEndTime)}
                          </div>
                        </div>
                      )}
                      {trip.actualDistance && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Actual Distance</div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {trip.actualDistance} km
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {trip.notes && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Notes</div>
                      <div style={{ 
                        fontSize: '14px', 
                        padding: '8px', 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }}>
                        {trip.notes}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  {trip.status === 'SCHEDULED' && (
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                      onClick={() => {
                        // Handle start trip
                        console.log('Start trip:', trip.id);
                      }}
                    >
                      Start Trip
                    </button>
                  )}
                  
                  {trip.status === 'IN_PROGRESS' && (
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                      onClick={() => {
                        // Handle complete trip
                        console.log('Complete trip:', trip.id);
                      }}
                    >
                      Complete Trip
                    </button>
                  )}
                  
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Trip #{trip.id.slice(-8)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '8px' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 12px',
              backgroundColor: page === 1 ? '#f5f5f5' : '#1976d2',
              color: page === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '0 16px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 12px',
              backgroundColor: page === totalPages ? '#f5f5f5' : '#1976d2',
              color: page === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px', 
        marginTop: '32px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '4px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
            {trips.filter(t => t.status === 'COMPLETED').length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Completed</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '4px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
            {trips.filter(t => t.status === 'IN_PROGRESS').length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>In Progress</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '4px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
            {trips.filter(t => t.status === 'SCHEDULED').length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Scheduled</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '4px', 
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
            {trips.reduce((total, trip) => total + (trip.actualDistance || trip.estimatedDistance || 0), 0).toFixed(0)}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total KM</div>
        </div>
      </div>
    </div>
  );
};
