import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../../services/api';

interface Trip {
  id: string;
  truckId: string;
  driverId?: string;
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
  createdAt: string;
  updatedAt: string;
  truck: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
}

interface Truck {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  status: string;
}

const statusColors = {
  SCHEDULED: '#2196f3',
  IN_PROGRESS: '#ff9800',
  COMPLETED: '#4caf50',
  CANCELLED: '#f44336',
  DELAYED: '#9c27b0'
};

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    truckId: '',
    driverId: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortBy, setSortBy] = useState('scheduledStartTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  // Form states
  const [tripForm, setTripForm] = useState({
    truckId: '',
    driverId: '',
    startLocation: '',
    endLocation: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    estimatedDistance: '',
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    driverId: '',
    notes: ''
  });

  useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchTrucks();
  }, [page, filters, sortBy, sortOrder]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      });

      const response = await api.get(`/trips?${queryParams}`);
      setTrips(response.data.trips);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/users?role=DRIVER');
      setDrivers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await api.get('/trucks');
      setTrucks(response.data);
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  };

  const handleCreateTrip = async () => {
    try {
      const tripData = {
        ...tripForm,
        estimatedDistance: tripForm.estimatedDistance ? Number(tripForm.estimatedDistance) : undefined,
        driverId: tripForm.driverId || undefined
      };
      
      await api.post('/trips', tripData);
      setSuccess('Trip created successfully');
      setCreateDialogOpen(false);
      resetTripForm();
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create trip');
    }
  };

  const handleUpdateTrip = async () => {
    if (!selectedTrip) return;
    
    try {
      const tripData = {
        ...tripForm,
        estimatedDistance: tripForm.estimatedDistance ? Number(tripForm.estimatedDistance) : undefined,
        driverId: tripForm.driverId || undefined
      };
      
      await api.patch(`/trips/${selectedTrip.id}`, tripData);
      setSuccess('Trip updated successfully');
      setEditDialogOpen(false);
      resetTripForm();
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update trip');
    }
  };

  const handleAssignDriver = async () => {
    try {
      await api.post(`/trips/${selectedTripId}/assign-driver`, assignForm);
      setSuccess('Driver assigned successfully');
      setAssignDialogOpen(false);
      setAssignForm({ driverId: '', notes: '' });
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign driver');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await api.delete(`/trips/${tripId}`);
      setSuccess('Trip deleted successfully');
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete trip');
    }
  };

  const openEditDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setTripForm({
      truckId: trip.truckId,
      driverId: trip.driverId || '',
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      scheduledStartTime: trip.scheduledStartTime.slice(0, 16),
      scheduledEndTime: trip.scheduledEndTime?.slice(0, 16) || '',
      estimatedDistance: trip.estimatedDistance?.toString() || '',
      notes: trip.notes || ''
    });
    setEditDialogOpen(true);
  };

  const openAssignDialog = (tripId: string, currentDriverId?: string) => {
    setSelectedTripId(tripId);
    setAssignForm({
      driverId: currentDriverId || '',
      notes: ''
    });
    setAssignDialogOpen(true);
  };

  const resetTripForm = () => {
    setTripForm({
      truckId: '',
      driverId: '',
      startLocation: '',
      endLocation: '',
      scheduledStartTime: '',
      scheduledEndTime: '',
      estimatedDistance: '',
      notes: ''
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      truckId: '',
      driverId: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Trip Management</h1>
        <button
          onClick={() => setCreateDialogOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Create Trip
        </button>
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

      {success && (
        <div style={{ backgroundColor: '#e8f5e8', color: '#2e7d32', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          {success}
          <button 
            onClick={() => setSuccess(null)}
            style={{ float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search trips..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Truck</label>
            <select
              value={filters.truckId}
              onChange={(e) => setFilters(prev => ({ ...prev, truckId: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">All</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.licensePlate} - {truck.make} {truck.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Driver</label>
            <select
              value={filters.driverId}
              onChange={(e) => setFilters(prev => ({ ...prev, driverId: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">All</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              <th 
                style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                onClick={() => handleSort('scheduledStartTime')}
              >
                Scheduled Start {sortBy === 'scheduledStartTime' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Route</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Truck</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Driver</th>
              <th 
                style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                onClick={() => handleSort('status')}
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Distance</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>No trips found</td>
              </tr>
            ) : (
              trips.map((trip, index) => (
                <tr key={trip.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {format(new Date(trip.scheduledStartTime), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{trip.startLocation}</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>→ {trip.endLocation}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div>{trip.truck.licensePlate}</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {trip.truck.make} {trip.truck.model}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {trip.driver ? (
                      <div>
                        <div>{trip.driver.firstName} {trip.driver.lastName}</div>
                        <div style={{ color: '#666', fontSize: '14px' }}>{trip.driver.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#666' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: statusColors[trip.status]
                      }}
                    >
                      {trip.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {trip.estimatedDistance && (
                      <div style={{ fontSize: '14px' }}>Est: {trip.estimatedDistance} km</div>
                    )}
                    {trip.actualDistance && (
                      <div style={{ fontSize: '14px', color: '#666' }}>Actual: {trip.actualDistance} km</div>
                    )}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditDialog(trip)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openAssignDialog(trip.id, trip.driverId)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        disabled={trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED'}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED' ? '#ccc' : '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED' ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Create Trip Dialog */}
      {createDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Create New Trip</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Truck *
                </label>
                <select
                  value={tripForm.truckId}
                  onChange={(e) => setTripForm(prev => ({ ...prev, truckId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Select Truck</option>
                  {trucks.filter(truck => truck.status === 'AVAILABLE').map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.licensePlate} - {truck.make} {truck.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Driver
                </label>
                <select
                  value={tripForm.driverId}
                  onChange={(e) => setTripForm(prev => ({ ...prev, driverId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Assign Later</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Location *
                </label>
                <input
                  type="text"
                  value={tripForm.startLocation}
                  onChange={(e) => setTripForm(prev => ({ ...prev, startLocation: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Location *
                </label>
                <input
                  type="text"
                  value={tripForm.endLocation}
                  onChange={(e) => setTripForm(prev => ({ ...prev, endLocation: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Scheduled Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledStartTime}
                  onChange={(e) => setTripForm(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Scheduled End Time
                </label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledEndTime}
                  onChange={(e) => setTripForm(prev => ({ ...prev, scheduledEndTime: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Estimated Distance (km)
                </label>
                <input
                  type="number"
                  value={tripForm.estimatedDistance}
                  onChange={(e) => setTripForm(prev => ({ ...prev, estimatedDistance: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setCreateDialogOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={!tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime}
                style={{
                  padding: '8px 16px',
                  backgroundColor: !tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime ? 'not-allowed' : 'pointer'
                }}
              >
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Dialog */}
      {editDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Edit Trip</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Truck *
                </label>
                <select
                  value={tripForm.truckId}
                  onChange={(e) => setTripForm(prev => ({ ...prev, truckId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.licensePlate} - {truck.make} {truck.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Driver
                </label>
                <select
                  value={tripForm.driverId}
                  onChange={(e) => setTripForm(prev => ({ ...prev, driverId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Unassigned</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Start Location *
                </label>
                <input
                  type="text"
                  value={tripForm.startLocation}
                  onChange={(e) => setTripForm(prev => ({ ...prev, startLocation: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  End Location *
                </label>
                <input
                  type="text"
                  value={tripForm.endLocation}
                  onChange={(e) => setTripForm(prev => ({ ...prev, endLocation: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Scheduled Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledStartTime}
                  onChange={(e) => setTripForm(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Scheduled End Time
                </label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledEndTime}
                  onChange={(e) => setTripForm(prev => ({ ...prev, scheduledEndTime: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Estimated Distance (km)
                </label>
                <input
                  type="number"
                  value={tripForm.estimatedDistance}
                  onChange={(e) => setTripForm(prev => ({ ...prev, estimatedDistance: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setEditDialogOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTrip}
                disabled={!tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime}
                style={{
                  padding: '8px 16px',
                  backgroundColor: !tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime ? 'not-allowed' : 'pointer'
                }}
              >
                Update Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Dialog */}
      {assignDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{ marginTop: 0 }}>Assign Driver to Trip</h2>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Driver *
                </label>
                <select
                  value={assignForm.driverId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, driverId: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName} - {driver.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Assignment Notes
                </label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any special instructions or notes for the driver..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setAssignDialogOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!assignForm.driverId}
                style={{
                  padding: '8px 16px',
                  backgroundColor: !assignForm.driverId ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !assignForm.driverId ? 'not-allowed' : 'pointer'
                }}
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripList;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination and filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    truckId: '',
    driverId: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortBy, setSortBy] = useState('scheduledStartTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  // Form states
  const [tripForm, setTripForm] = useState({
    truckId: '',
    driverId: '',
    startLocation: '',
    endLocation: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    estimatedDistance: '',
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    driverId: '',
    notes: ''
  });

  useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchTrucks();
  }, [page, filters, sortBy, sortOrder]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      });

      const response = await api.get(`/trips?${queryParams}`);
      setTrips(response.data.trips);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/users?role=DRIVER');
      setDrivers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await api.get('/trucks');
      setTrucks(response.data);
    } catch (err) {
      console.error('Failed to fetch trucks:', err);
    }
  };

  const handleCreateTrip = async () => {
    try {
      const tripData = {
        ...tripForm,
        estimatedDistance: tripForm.estimatedDistance ? Number(tripForm.estimatedDistance) : undefined,
        driverId: tripForm.driverId || undefined
      };
      
      await api.post('/trips', tripData);
      setSuccess('Trip created successfully');
      setCreateDialogOpen(false);
      resetTripForm();
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create trip');
    }
  };

  const handleUpdateTrip = async () => {
    if (!selectedTrip) return;
    
    try {
      const tripData = {
        ...tripForm,
        estimatedDistance: tripForm.estimatedDistance ? Number(tripForm.estimatedDistance) : undefined,
        driverId: tripForm.driverId || undefined
      };
      
      await api.patch(`/trips/${selectedTrip.id}`, tripData);
      setSuccess('Trip updated successfully');
      setEditDialogOpen(false);
      resetTripForm();
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update trip');
    }
  };

  const handleAssignDriver = async () => {
    try {
      await api.post(`/trips/${selectedTripId}/assign-driver`, assignForm);
      setSuccess('Driver assigned successfully');
      setAssignDialogOpen(false);
      setAssignForm({ driverId: '', notes: '' });
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign driver');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await api.delete(`/trips/${tripId}`);
      setSuccess('Trip deleted successfully');
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete trip');
    }
  };

  const openEditDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setTripForm({
      truckId: trip.truckId,
      driverId: trip.driverId || '',
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      scheduledStartTime: trip.scheduledStartTime.slice(0, 16), // Format for datetime-local
      scheduledEndTime: trip.scheduledEndTime?.slice(0, 16) || '',
      estimatedDistance: trip.estimatedDistance?.toString() || '',
      notes: trip.notes || ''
    });
    setEditDialogOpen(true);
  };

  const openAssignDialog = (tripId: string, currentDriverId?: string) => {
    setSelectedTripId(tripId);
    setAssignForm({
      driverId: currentDriverId || '',
      notes: ''
    });
    setAssignDialogOpen(true);
  };

  const resetTripForm = () => {
    setTripForm({
      truckId: '',
      driverId: '',
      startLocation: '',
      endLocation: '',
      scheduledStartTime: '',
      scheduledEndTime: '',
      estimatedDistance: '',
      notes: ''
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      truckId: '',
      driverId: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trip Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Trip
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="DELAYED">Delayed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Truck</InputLabel>
              <Select
                value={filters.truckId}
                label="Truck"
                onChange={(e) => setFilters(prev => ({ ...prev, truckId: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {trucks.map(truck => (
                  <MenuItem key={truck.id} value={truck.id}>
                    {truck.licensePlate} - {truck.make} {truck.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Driver</InputLabel>
              <Select
                value={filters.driverId}
                label="Driver"
                onChange={(e) => setFilters(prev => ({ ...prev, driverId: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {drivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.firstName} {driver.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Trips Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'scheduledStartTime'}
                  direction={sortBy === 'scheduledStartTime' ? sortOrder : 'asc'}
                  onClick={() => handleSort('scheduledStartTime')}
                >
                  Scheduled Start
                </TableSortLabel>
              </TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Truck</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Distance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No trips found</TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id} hover>
                  <TableCell>
                    {format(new Date(trip.scheduledStartTime), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {trip.startLocation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        → {trip.endLocation}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {trip.truck.licensePlate}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {trip.truck.make} {trip.truck.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {trip.driver ? (
                      <Box>
                        <Typography variant="body2">
                          {trip.driver.firstName} {trip.driver.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {trip.driver.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trip.status.replace('_', ' ')}
                      color={statusColors[trip.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {trip.estimatedDistance && (
                      <Typography variant="body2">
                        Est: {trip.estimatedDistance} km
                      </Typography>
                    )}
                    {trip.actualDistance && (
                      <Typography variant="body2" color="text.secondary">
                        Actual: {trip.actualDistance} km
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Trip">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditDialog(trip)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Driver">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => openAssignDialog(trip.id, trip.driverId)}
                        >
                          <AssignIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Trip">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTrip(trip.id)}
                          disabled={trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      {/* Create Trip Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Trip</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Truck *</InputLabel>
                <Select
                  value={tripForm.truckId}
                  label="Truck *"
                  onChange={(e) => setTripForm(prev => ({ ...prev, truckId: e.target.value }))}
                >
                  {trucks.filter(truck => truck.status === 'AVAILABLE').map(truck => (
                    <MenuItem key={truck.id} value={truck.id}>
                      {truck.licensePlate} - {truck.make} {truck.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={tripForm.driverId}
                  label="Driver"
                  onChange={(e) => setTripForm(prev => ({ ...prev, driverId: e.target.value }))}
                >
                  <MenuItem value="">Assign Later</MenuItem>
                  {drivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Location *"
                value={tripForm.startLocation}
                onChange={(e) => setTripForm(prev => ({ ...prev, startLocation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Location *"
                value={tripForm.endLocation}
                onChange={(e) => setTripForm(prev => ({ ...prev, endLocation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Start Time *"
                type="datetime-local"
                value={tripForm.scheduledStartTime}
                onChange={(e) => setTripForm(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled End Time"
                type="datetime-local"
                value={tripForm.scheduledEndTime}
                onChange={(e) => setTripForm(prev => ({ ...prev, scheduledEndTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Distance (km)"
                type="number"
                value={tripForm.estimatedDistance}
                onChange={(e) => setTripForm(prev => ({ ...prev, estimatedDistance: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={tripForm.notes}
                onChange={(e) => setTripForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTrip} 
            variant="contained"
            disabled={!tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime}
          >
            Create Trip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Trip</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Truck *</InputLabel>
                <Select
                  value={tripForm.truckId}
                  label="Truck *"
                  onChange={(e) => setTripForm(prev => ({ ...prev, truckId: e.target.value }))}
                >
                  {trucks.map(truck => (
                    <MenuItem key={truck.id} value={truck.id}>
                      {truck.licensePlate} - {truck.make} {truck.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={tripForm.driverId}
                  label="Driver"
                  onChange={(e) => setTripForm(prev => ({ ...prev, driverId: e.target.value }))}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {drivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Location *"
                value={tripForm.startLocation}
                onChange={(e) => setTripForm(prev => ({ ...prev, startLocation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Location *"
                value={tripForm.endLocation}
                onChange={(e) => setTripForm(prev => ({ ...prev, endLocation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Start Time *"
                type="datetime-local"
                value={tripForm.scheduledStartTime}
                onChange={(e) => setTripForm(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled End Time"
                type="datetime-local"
                value={tripForm.scheduledEndTime}
                onChange={(e) => setTripForm(prev => ({ ...prev, scheduledEndTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Distance (km)"
                type="number"
                value={tripForm.estimatedDistance}
                onChange={(e) => setTripForm(prev => ({ ...prev, estimatedDistance: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={tripForm.notes}
                onChange={(e) => setTripForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateTrip} 
            variant="contained"
            disabled={!tripForm.truckId || !tripForm.startLocation || !tripForm.endLocation || !tripForm.scheduledStartTime}
          >
            Update Trip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Driver to Trip</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Driver *</InputLabel>
                <Select
                  value={assignForm.driverId}
                  label="Driver *"
                  onChange={(e) => setAssignForm(prev => ({ ...prev, driverId: e.target.value }))}
                >
                  {drivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName} - {driver.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Notes"
                multiline
                rows={3}
                value={assignForm.notes}
                onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions or notes for the driver..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignDriver} 
            variant="contained"
            disabled={!assignForm.driverId}
          >
            Assign Driver
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripList;
