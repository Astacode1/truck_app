import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StarIcon from '@mui/icons-material/Star'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DescriptionIcon from '@mui/icons-material/Description'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'

interface DriverProfile {
  id: string
  name: string
  imageUrl: string | null
  phone: string
  email: string
  license: string
  licenseType: string
  experience: string
  rating: number
  totalTrips: number
  location: string
  status: 'active' | 'on-leave' | 'inactive'
  joinDate: string
  notes: string
}

export default function DriverProfilePage() {
  const { driverId } = useParams<{ driverId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [driver, setDriver] = useState<DriverProfile>(() => {
    // Load driver from localStorage (use same key as Drivers page)
    const drivers = JSON.parse(localStorage.getItem('truckManagement_drivers') || '[]')
    const found = drivers.find((d: any) => d.id.toString() === driverId)
    
    if (found) {
      // Convert existing driver data to our format
      return {
        id: found.id.toString(),
        name: found.name || '',
        imageUrl: found.profileImage || null,
        phone: found.phone || '',
        email: found.email || '',
        license: found.licenseNumber || '',
        licenseType: 'CDL Class A',
        experience: found.experience || '',
        rating: found.rating || 5.0,
        totalTrips: found.totalTrips || 0,
        location: found.location || '',
        status: found.status === 'on_leave' ? 'on-leave' : (found.status || 'active'),
        joinDate: new Date().toISOString().split('T')[0],
        notes: ''
      }
    }
    
    return {
      id: driverId || 'new',
      name: '',
      imageUrl: null,
      phone: '',
      email: '',
      license: '',
      licenseType: 'CDL Class A',
      experience: '',
      rating: 5.0,
      totalTrips: 0,
      location: '',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  })

  const [tempDriver, setTempDriver] = useState<DriverProfile>(driver)
  const isNewDriver = !driverId || driverId === 'new'

  useEffect(() => {
    if (isNewDriver) {
      setIsEditing(true)
    }
  }, [isNewDriver])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setTempDriver({ ...tempDriver, imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Validate required fields
    if (!tempDriver.name.trim()) {
      alert('Please enter driver name')
      return
    }

    // Generate ID for new driver
    const newId = tempDriver.id === 'new' ? Date.now() : parseInt(tempDriver.id)

    // Convert to format used by Drivers page
    const savedDriver = {
      id: newId,
      name: tempDriver.name,
      profileImage: tempDriver.imageUrl,
      phone: tempDriver.phone,
      email: tempDriver.email,
      licenseNumber: tempDriver.license,
      status: tempDriver.status === 'on-leave' ? 'on_leave' : tempDriver.status,
      experience: tempDriver.experience,
      currentTruck: 'Unassigned',
      location: tempDriver.location,
      rating: tempDriver.rating,
      totalTrips: tempDriver.totalTrips,
      qualifications: [
        { 
          type: tempDriver.licenseType, 
          issueDate: tempDriver.joinDate, 
          expiryDate: new Date(new Date(tempDriver.joinDate).setFullYear(new Date(tempDriver.joinDate).getFullYear() + 8)).toISOString().split('T')[0],
          status: 'valid' 
        }
      ],
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    }

    // Save to localStorage with same key as Drivers page
    const drivers = JSON.parse(localStorage.getItem('truckManagement_drivers') || '[]')
    const existingIndex = drivers.findIndex((d: any) => d.id === newId)
    
    if (existingIndex >= 0) {
      drivers[existingIndex] = savedDriver
    } else {
      drivers.push(savedDriver)
    }
    
    localStorage.setItem('truckManagement_drivers', JSON.stringify(drivers))
    
    // Update local state
    setDriver({
      ...tempDriver,
      id: newId.toString()
    })
    setIsEditing(false)
    
    if (isNewDriver) {
      navigate(`/driver/${newId}`)
    }
  }

  const handleDelete = () => {
    const drivers = JSON.parse(localStorage.getItem('truckManagement_drivers') || '[]')
    const filtered = drivers.filter((d: any) => d.id.toString() !== driver.id)
    localStorage.setItem('truckManagement_drivers', JSON.stringify(filtered))
    navigate('/drivers')
  }

  const handleCancel = () => {
    if (isNewDriver) {
      navigate('/drivers')
    } else {
      setTempDriver(driver)
      setIsEditing(false)
    }
  }

  const removeImage = () => {
    setTempDriver({ ...tempDriver, imageUrl: null })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.8)' }
      case 'on-leave': return { bg: '#fb923c', glow: 'rgba(251, 146, 60, 0.8)' }
      case 'inactive': return { bg: '#6b7280', glow: 'rgba(107, 114, 128, 0.8)' }
      default: return { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.8)' }
    }
  }

  const statusColor = getStatusColor(driver.status)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/drivers')}
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
              border: '1px solid rgba(34, 211, 238, 0.3)'
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20, color: '#22d3ee' }} />
          </button>
          <div>
            <h1 className="text-3xl font-black" style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {isNewDriver ? 'Add New Driver' : 'Driver Profile'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isNewDriver ? 'Create a new driver profile' : 'View and manage driver information'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isNewDriver && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
              >
                <EditIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5'
                }}
              >
                <DeleteIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Profile Picture & Basic Info */}
        <div className="col-span-4">
          <div className="rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4" style={{ width: '200px', height: '200px' }}>
                {/* Rotating Rainbow Ring */}
                <div className="absolute inset-0 rounded-full" style={{
                  animation: 'spin 10s linear infinite',
                  background: 'conic-gradient(from 0deg, #22d3ee, #818cf8, #fb923c, #10b981, #22d3ee)',
                  opacity: 0.6,
                  filter: 'blur(8px)'
                }}></div>

                {/* Pulsing Glow */}
                <div className="absolute inset-0 rounded-full animate-pulse" style={{
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  transform: 'scale(1.4)'
                }}></div>

                {/* Avatar Container */}
                <div className="absolute inset-3 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                  border: '3px solid rgba(34, 211, 238, 0.5)',
                  boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)'
                }}>
                  {tempDriver.imageUrl ? (
                    <img 
                      src={tempDriver.imageUrl} 
                      alt={tempDriver.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PersonIcon sx={{ fontSize: 100, color: '#22d3ee', opacity: 0.5 }} />
                    </div>
                  )}
                </div>

                {/* Upload Button (Edit Mode) */}
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-3 rounded-full transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                        border: '3px solid rgba(30, 41, 59, 0.9)',
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
                      }}
                      title="Upload Photo"
                    >
                      <PhotoCameraIcon sx={{ fontSize: 24, color: 'white' }} />
                    </button>
                    
                    {tempDriver.imageUrl && (
                      <button
                        onClick={removeImage}
                        className="absolute top-0 right-0 p-2 rounded-full transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: '2px solid rgba(30, 41, 59, 0.9)',
                          boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
                        }}
                        title="Remove Photo"
                      >
                        <CloseIcon sx={{ fontSize: 18, color: 'white' }} />
                      </button>
                    )}
                  </>
                )}

                {/* Status Indicator */}
                <div className="absolute bottom-2 left-2" style={{
                  width: '40px',
                  height: '40px'
                }}>
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{
                    background: statusColor.bg,
                    boxShadow: `0 0 20px ${statusColor.glow}`
                  }}></div>
                  <div className="absolute inset-1 rounded-full" style={{
                    background: statusColor.bg,
                    border: '3px solid rgba(30, 41, 59, 0.9)'
                  }}></div>
                </div>
              </div>

              {/* Name & Rating */}
              <div className="text-center w-full">
                {isEditing ? (
                  <input
                    type="text"
                    value={tempDriver.name}
                    onChange={(e) => setTempDriver({ ...tempDriver, name: e.target.value })}
                    placeholder="Driver Name"
                    className="w-full px-4 py-3 rounded-xl text-center text-2xl font-black text-white placeholder-gray-400 mb-3"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <h2 className="text-2xl font-black mb-2 text-white">
                    {driver.name || 'No Name'}
                  </h2>
                )}

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      sx={{ fontSize: 24, color: star <= driver.rating ? '#fb923c' : '#374151' }}
                    />
                  ))}
                  <span className="ml-2 text-xl font-bold" style={{ color: '#fb923c' }}>
                    {driver.rating}
                  </span>
                </div>

                {/* Status Badge */}
                {isEditing ? (
                  <select
                    value={tempDriver.status}
                    onChange={(e) => setTempDriver({ ...tempDriver, status: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-full text-center font-bold text-white"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    background: `${statusColor.bg}20`,
                    border: `1px solid ${statusColor.bg}50`
                  }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{
                      background: statusColor.bg,
                      boxShadow: `0 0 8px ${statusColor.glow}`
                    }}></div>
                    <span className="text-sm font-bold text-white">
                      {driver.status.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                <div className="text-center p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.2)'
                }}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={tempDriver.totalTrips}
                      onChange={(e) => setTempDriver({ ...tempDriver, totalTrips: parseInt(e.target.value) || 0 })}
                      className="w-full text-center bg-transparent text-3xl font-black text-white"
                    />
                  ) : (
                    <div className="text-3xl font-black" style={{
                      background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>{driver.totalTrips}</div>
                  )}
                  <div className="text-xs font-semibold text-gray-400 mt-1">Trips</div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
                  border: '1px solid rgba(251, 146, 60, 0.2)'
                }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempDriver.experience}
                      onChange={(e) => setTempDriver({ ...tempDriver, experience: e.target.value })}
                      placeholder="5"
                      className="w-full text-center bg-transparent text-3xl font-black text-white"
                    />
                  ) : (
                    <div className="text-3xl font-black" style={{
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>{driver.experience}</div>
                  )}
                  <div className="text-xs font-semibold text-gray-400 mt-1">Years Exp</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="col-span-8 space-y-4">
          {/* Contact Information */}
          <div className="rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="text-lg font-black mb-4" style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <PhoneIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempDriver.phone}
                    onChange={(e) => setTempDriver({ ...tempDriver, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <p className="text-white font-semibold text-lg">{driver.phone || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <EmailIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempDriver.email}
                    onChange={(e) => setTempDriver({ ...tempDriver, email: e.target.value })}
                    placeholder="driver@example.com"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <p className="text-white font-semibold text-lg">{driver.email || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <LocationOnIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempDriver.location}
                    onChange={(e) => setTempDriver({ ...tempDriver, location: e.target.value })}
                    placeholder="Los Angeles, CA"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <p className="text-white font-semibold text-lg">{driver.location || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <CalendarTodayIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  Join Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={tempDriver.joinDate}
                    onChange={(e) => setTempDriver({ ...tempDriver, joinDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <p className="text-white font-semibold text-lg">
                    {new Date(driver.joinDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="text-lg font-black mb-4" style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              License Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <DescriptionIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  License Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempDriver.license}
                    onChange={(e) => setTempDriver({ ...tempDriver, license: e.target.value })}
                    placeholder="DL123456789"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                ) : (
                  <p className="text-white font-semibold text-lg">{driver.license || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  <LocalShippingIcon sx={{ fontSize: 16, marginRight: '8px' }} />
                  License Type
                </label>
                {isEditing ? (
                  <select
                    value={tempDriver.licenseType}
                    onChange={(e) => setTempDriver({ ...tempDriver, licenseType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  >
                    <option value="CDL Class A">CDL Class A</option>
                    <option value="CDL Class B">CDL Class B</option>
                    <option value="CDL Class C">CDL Class C</option>
                  </select>
                ) : (
                  <p className="text-white font-semibold text-lg">{driver.licenseType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl p-6" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="text-lg font-black mb-4" style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Additional Notes
            </h3>
            {isEditing ? (
              <textarea
                value={tempDriver.notes}
                onChange={(e) => setTempDriver({ ...tempDriver, notes: e.target.value })}
                placeholder="Add any additional notes about this driver..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  resize: 'vertical'
                }}
              />
            ) : (
              <p className="text-white">{driver.notes || 'No additional notes'}</p>
            )}
          </div>

          {/* Action Buttons (Edit Mode) */}
          {isEditing && (
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(148, 163, 184, 0.9)'
                }}
              >
                <CloseIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
              >
                <SaveIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                Save Driver Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="rounded-2xl p-8 max-w-md" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="text-center mb-6">
              <WarningIcon sx={{ fontSize: 60, color: '#ef4444', marginBottom: '16px' }} />
              <h3 className="text-2xl font-black text-white mb-2">Delete Driver?</h3>
              <p className="text-gray-400">
                Are you sure you want to delete <span className="text-white font-bold">{driver.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                }}
              >
                <DeleteIcon sx={{ fontSize: 20, marginRight: '8px' }} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
