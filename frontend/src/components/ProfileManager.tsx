import { useState, useRef } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import GroupIcon from '@mui/icons-material/Group'

interface ProfileData {
  name: string
  role: string
  imageUrl: string | null
  imageType: 'upload' | 'icon'
  trips: number
  trucks: number
  status: 'active' | 'away' | 'offline'
}

interface ProfileManagerProps {
  onProfileUpdate?: (profile: ProfileData) => void
}

export default function ProfileManager({ onProfileUpdate }: ProfileManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(() => {
    // Load from localStorage if exists
    const saved = localStorage.getItem('userProfile')
    return saved ? JSON.parse(saved) : {
      name: 'John Martinez',
      role: 'Fleet Manager',
      imageUrl: null,
      imageType: 'icon',
      trips: 248,
      trucks: 45,
      status: 'active'
    }
  })
  
  const [tempProfile, setTempProfile] = useState<ProfileData>(profile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setTempProfile({
          ...tempProfile,
          imageUrl,
          imageType: 'upload'
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setProfile(tempProfile)
    localStorage.setItem('userProfile', JSON.stringify(tempProfile))
    if (onProfileUpdate) {
      onProfileUpdate(tempProfile)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setIsEditing(false)
  }

  const removeImage = () => {
    setTempProfile({
      ...tempProfile,
      imageUrl: null,
      imageType: 'icon'
    })
  }

  const renderProfileImage = (profileData: ProfileData, size: number = 140) => {
    if (profileData.imageType === 'upload' && profileData.imageUrl) {
      return (
        <img 
          src={profileData.imageUrl} 
          alt="Profile"
          className="w-full h-full object-cover"
          style={{
            borderRadius: '50%'
          }}
        />
      )
    } else {
      return (
        <GroupIcon sx={{ fontSize: size * 0.57 }} className="relative z-10" style={{
          background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #fb923c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 12px rgba(34, 211, 238, 0.6))'
        }} />
      )
    }
  }

  return (
    <div className="px-4 py-6" style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0,
      position: 'relative'
    }}>
      {/* Edit Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-300 z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
            border: '1px solid rgba(34, 211, 238, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(129, 140, 248, 0.3) 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)'
          }}
          title="Edit Profile"
        >
          <EditIcon sx={{ fontSize: 18, color: '#22d3ee' }} />
        </button>
      )}

      <div className="relative group">
        {/* Glowing Background Card */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 50%, rgba(251, 146, 60, 0.2) 100%)',
          filter: 'blur(20px)',
          transform: 'scale(1.05)'
        }}></div>

        {/* Main Profile Card */}
        <div className="relative rounded-3xl p-6 backdrop-blur-xl" style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}>
          {/* Profile Avatar Section */}
          <div className="flex flex-col items-center mb-4">
            {/* Holographic Avatar Container */}
            <div className="relative mb-4" style={{ width: '140px', height: '140px' }}>
              {/* Rotating Rainbow Ring 1 */}
              <div className="absolute inset-0 rounded-full" style={{
                animation: 'spin 10s linear infinite',
                background: 'conic-gradient(from 0deg, #22d3ee, #818cf8, #fb923c, #10b981, #22d3ee)',
                opacity: 0.6,
                filter: 'blur(8px)'
              }}></div>

              {/* Rotating Rainbow Ring 2 - Counter */}
              <div className="absolute inset-2 rounded-full" style={{
                animation: 'spin 8s linear infinite reverse',
                background: 'conic-gradient(from 180deg, #10b981, #fb923c, #818cf8, #22d3ee, #10b981)',
                opacity: 0.5,
                filter: 'blur(6px)'
              }}></div>

              {/* Pulsing Glow */}
              <div className="absolute inset-0 rounded-full animate-pulse" style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
                filter: 'blur(30px)',
                transform: 'scale(1.4)'
              }}></div>

              {/* Avatar Border Circle */}
              <div className="absolute inset-3 rounded-full overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '3px solid rgba(34, 211, 238, 0.5)',
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
              }}>
                {/* Avatar Image or Icon */}
                <div className="w-full h-full flex items-center justify-center">
                  {renderProfileImage(isEditing ? tempProfile : profile)}
                </div>
              </div>

              {/* Upload Button (Only in Edit Mode) */}
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
                    title="Upload Image"
                  >
                    <PhotoCameraIcon sx={{ fontSize: 20, color: 'white' }} />
                  </button>
                  
                  {tempProfile.imageUrl && (
                    <button
                      onClick={removeImage}
                      className="absolute top-0 right-0 p-2 rounded-full transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        border: '2px solid rgba(30, 41, 59, 0.9)',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
                      }}
                      title="Remove Image"
                    >
                      <CloseIcon sx={{ fontSize: 16, color: 'white' }} />
                    </button>
                  )}
                </>
              )}

              {/* Status Indicator */}
              <div className="absolute bottom-2 left-2" style={{
                width: '32px',
                height: '32px'
              }}>
                <div className="absolute inset-0 rounded-full animate-pulse" style={{
                  background: profile.status === 'active' ? '#10b981' : profile.status === 'away' ? '#fb923c' : '#6b7280',
                  boxShadow: `0 0 20px ${profile.status === 'active' ? 'rgba(16, 185, 129, 0.8)' : profile.status === 'away' ? 'rgba(251, 146, 60, 0.8)' : 'rgba(107, 114, 128, 0.8)'}`
                }}></div>
                <div className="absolute inset-1 rounded-full" style={{
                  background: profile.status === 'active' ? '#10b981' : profile.status === 'away' ? '#fb923c' : '#6b7280',
                  border: '3px solid rgba(30, 41, 59, 0.9)'
                }}></div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center w-full">
              {isEditing ? (
                <div className="space-y-3 mb-3">
                  <input
                    type="text"
                    value={tempProfile.role}
                    onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-center font-black text-white placeholder-gray-400"
                    placeholder="Role/Title"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-center font-semibold text-white placeholder-gray-400"
                    placeholder="Your Name"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  />
                  <select
                    value={tempProfile.status}
                    onChange={(e) => setTempProfile({ ...tempProfile, status: e.target.value as 'active' | 'away' | 'offline' })}
                    className="w-full px-4 py-2 rounded-xl text-center font-semibold text-white"
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="away">Away</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-black mb-1" style={{
                    background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(34, 211, 238, 0.5)'
                  }}>
                    {profile.role}
                  </h3>
                  <p className="text-sm font-semibold mb-2" style={{ 
                    color: 'rgba(148, 163, 184, 0.9)'
                  }}>
                    {profile.name}
                  </p>
                </>
              )}
              
              {/* Role Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="w-2 h-2 rounded-full" style={{
                  background: profile.status === 'active' ? '#10b981' : profile.status === 'away' ? '#fb923c' : '#6b7280',
                  boxShadow: `0 0 8px ${profile.status === 'active' ? 'rgba(16, 185, 129, 0.8)' : profile.status === 'away' ? 'rgba(251, 146, 60, 0.8)' : 'rgba(107, 114, 128, 0.8)'}`,
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
                <span className="text-xs font-bold" style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ADMIN {profile.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
              border: '1px solid rgba(34, 211, 238, 0.2)'
            }}>
              {isEditing ? (
                <input
                  type="number"
                  value={tempProfile.trips}
                  onChange={(e) => setTempProfile({ ...tempProfile, trips: parseInt(e.target.value) || 0 })}
                  className="w-full text-center bg-transparent text-2xl font-black mb-1 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                />
              ) : (
                <div className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{profile.trips}</div>
              )}
              <div className="text-xs font-semibold" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                Trips
              </div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              {isEditing ? (
                <input
                  type="number"
                  value={tempProfile.trucks}
                  onChange={(e) => setTempProfile({ ...tempProfile, trucks: parseInt(e.target.value) || 0 })}
                  className="w-full text-center bg-transparent text-2xl font-black mb-1 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                />
              ) : (
                <div className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{profile.trucks}</div>
              )}
              <div className="text-xs font-semibold" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                Trucks
              </div>
            </div>
          </div>

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(148, 163, 184, 0.9)'
                }}
              >
                <CloseIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 rounded-xl font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
              >
                <SaveIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
