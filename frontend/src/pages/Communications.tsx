import { useState } from 'react'
import { motion } from 'framer-motion'
// Material UI Icons
import ChatIcon from '@mui/icons-material/Chat'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SearchIcon from '@mui/icons-material/Search'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PhoneIcon from '@mui/icons-material/Phone'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CampaignIcon from '@mui/icons-material/Campaign'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import CheckIcon from '@mui/icons-material/Check'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isOwn: boolean
  status: 'sent' | 'delivered' | 'read'
}

interface Chat {
  id: number
  name: string
  role: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  avatar: string
  type: 'driver' | 'dispatcher' | 'admin'
}

interface Announcement {
  id: number
  title: string
  message: string
  author: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  read: boolean
}

export default function Communications() {
  const [activeTab, setActiveTab] = useState<'chats' | 'announcements'>('chats')
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for chats
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Mike Johnson',
      role: 'Driver - Truck #2847',
      lastMessage: 'On my way to the pickup location',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      avatar: '👨‍✈️',
      type: 'driver'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Driver - Truck #3192',
      lastMessage: 'Delivered successfully, sending proof',
      timestamp: '15 min ago',
      unread: 0,
      online: true,
      avatar: '👩‍✈️',
      type: 'driver'
    },
    {
      id: 3,
      name: 'James Brown',
      role: 'Dispatcher',
      lastMessage: 'Can you take the Chicago route?',
      timestamp: '1 hour ago',
      unread: 1,
      online: false,
      avatar: '👨‍💼',
      type: 'dispatcher'
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      role: 'Driver - Truck #4521',
      lastMessage: 'Engine warning light came on',
      timestamp: '2 hours ago',
      unread: 3,
      online: true,
      avatar: '👩‍✈️',
      type: 'driver'
    },
    {
      id: 5,
      name: 'Admin Team',
      role: 'System Administrators',
      lastMessage: 'System maintenance scheduled',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      avatar: '👥',
      type: 'admin'
    }
  ])

  // Mock messages for selected chat
  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Mike Johnson',
      content: 'Hey, I\'m heading to the warehouse now. ETA 20 minutes.',
      timestamp: '10:30 AM',
      isOwn: false,
      status: 'read'
    },
    {
      id: 2,
      sender: 'You',
      content: 'Great! Make sure to check the load manifest before departure.',
      timestamp: '10:32 AM',
      isOwn: true,
      status: 'read'
    },
    {
      id: 3,
      sender: 'Mike Johnson',
      content: 'Will do. Also, do you have the delivery contact number?',
      timestamp: '10:35 AM',
      isOwn: false,
      status: 'read'
    },
    {
      id: 4,
      sender: 'You',
      content: 'Yes, it\'s (555) 123-4567. Contact John at the receiving dock.',
      timestamp: '10:36 AM',
      isOwn: true,
      status: 'delivered'
    },
    {
      id: 5,
      sender: 'Mike Johnson',
      content: 'On my way to the pickup location',
      timestamp: '10:45 AM',
      isOwn: false,
      status: 'delivered'
    }
  ])

  // Mock announcements
  const [announcements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'New Safety Protocol Update',
      message: 'All drivers must complete the new DOT safety training by end of month. The training module is available in the Learning Center.',
      author: 'Safety Department',
      timestamp: '2 hours ago',
      priority: 'urgent',
      category: 'Safety',
      read: false
    },
    {
      id: 2,
      title: 'Scheduled Maintenance Window',
      message: 'The system will undergo maintenance on Sunday, Oct 27 from 2 AM to 6 AM EST. Please plan accordingly.',
      author: 'IT Department',
      timestamp: '5 hours ago',
      priority: 'high',
      category: 'System',
      read: false
    },
    {
      id: 3,
      title: 'Fuel Card Pin Reset Required',
      message: 'Due to security updates, all fuel card PINs need to be reset. Please visit the settings page to update your PIN.',
      author: 'Finance Department',
      timestamp: '1 day ago',
      priority: 'medium',
      category: 'Finance',
      read: true
    },
    {
      id: 4,
      title: 'Holiday Schedule Announcement',
      message: 'Thanksgiving holiday schedule has been posted. Check the calendar for dispatch times and rate adjustments.',
      author: 'HR Department',
      timestamp: '2 days ago',
      priority: 'low',
      category: 'HR',
      read: true
    },
    {
      id: 5,
      title: 'New Route Optimization Feature',
      message: 'We\'ve launched AI-powered route optimization! Check your trip planning dashboard to see fuel and time savings.',
      author: 'Product Team',
      timestamp: '3 days ago',
      priority: 'medium',
      category: 'Product Update',
      read: true
    }
  ])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Add message logic here
      console.log('Sending message:', messageInput)
      setMessageInput('')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#64748b'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'URGENT'
      case 'high': return 'HIGH'
      case 'medium': return 'MEDIUM'
      case 'low': return 'INFO'
      default: return priority.toUpperCase()
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-black mb-2" style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Communication Hub
          </h1>
          <p className="text-gray-400">Real-time messaging and announcements</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 rounded-2xl backdrop-blur-xl" style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'chats' 
                ? 'text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'chats'
                ? 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)'
                : 'transparent'
            }}
          >
            <ChatIcon sx={{ fontSize: 20 }} />
            Chats
            {chats.filter(c => c.unread > 0).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{
                background: '#ef4444',
                color: 'white'
              }}>
                {chats.reduce((acc, c) => acc + c.unread, 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'announcements' 
                ? 'text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'announcements'
                ? 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)'
                : 'transparent'
            }}
          >
            <CampaignIcon sx={{ fontSize: 20 }} />
            Announcements
            {announcements.filter(a => !a.read).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{
                background: '#f59e0b',
                color: 'white'
              }}>
                {announcements.filter(a => !a.read).length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'chats' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ height: 'calc(100vh - 280px)' }}
        >
          {/* Chat List */}
          <div className="lg:col-span-1 rounded-3xl backdrop-blur-xl overflow-hidden flex flex-col" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Search */}
            <div className="p-4 border-b border-white border-opacity-10">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 border-b border-white border-opacity-10 cursor-pointer transition-all ${
                    selectedChat === chat.id ? 'bg-opacity-50' : ''
                  }`}
                  style={{
                    background: selectedChat === chat.id 
                      ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)'
                      : 'transparent'
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)'
                      }}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{
                          background: '#10b981',
                          borderColor: 'rgba(30, 41, 59, 0.8)'
                        }}></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white truncate">{chat.name}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{chat.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{chat.role}</p>
                      <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unread > 0 && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                        background: '#22d3ee',
                        color: '#0f172a'
                      }}>
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 rounded-3xl backdrop-blur-xl overflow-hidden flex flex-col" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white border-opacity-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)'
                      }}>
                        {chats.find(c => c.id === selectedChat)?.avatar}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{
                        background: '#10b981',
                        borderColor: 'rgba(30, 41, 59, 0.8)'
                      }}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{chats.find(c => c.id === selectedChat)?.name}</h3>
                      <p className="text-xs text-gray-400">{chats.find(c => c.id === selectedChat)?.role}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                      <PhoneIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                      <VideoCallIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                      <MoreVertIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className="rounded-2xl px-4 py-3 shadow-lg"
                          style={{
                            background: message.isOwn
                              ? 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)'
                              : 'rgba(51, 65, 85, 0.8)',
                            borderTopRightRadius: message.isOwn ? '4px' : '16px',
                            borderTopLeftRadius: message.isOwn ? '16px' : '4px'
                          }}
                        >
                          <p className="text-white text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                          {message.isOwn && (
                            <>
                              {message.status === 'sent' && <CheckIcon sx={{ fontSize: 14 }} className="text-gray-500" />}
                              {message.status === 'delivered' && <DoneAllIcon sx={{ fontSize: 14 }} className="text-gray-500" />}
                              {message.status === 'read' && <DoneAllIcon sx={{ fontSize: 14 }} className="text-cyan-400" />}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white border-opacity-10">
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
                      <AttachFileIcon sx={{ fontSize: 20 }} className="text-gray-400" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-3 rounded-xl font-bold transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                        boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)'
                      }}
                      disabled={!messageInput.trim()}
                    >
                      <SendIcon sx={{ fontSize: 20 }} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatIcon sx={{ fontSize: 80 }} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Announcements */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="rounded-3xl backdrop-blur-xl p-6 transition-all"
              style={{
                background: announcement.read 
                  ? 'rgba(30, 41, 59, 0.4)' 
                  : 'rgba(30, 41, 59, 0.7)',
                border: `1px solid ${announcement.read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'}`,
                boxShadow: announcement.read 
                  ? '0 10px 30px rgba(0, 0, 0, 0.2)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Priority Icon */}
                  <div className="p-3 rounded-2xl" style={{
                    background: `${getPriorityColor(announcement.priority)}20`,
                    border: `1px solid ${getPriorityColor(announcement.priority)}40`
                  }}>
                    <NotificationsActiveIcon 
                      sx={{ fontSize: 24 }} 
                      style={{ color: getPriorityColor(announcement.priority) }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: `${getPriorityColor(announcement.priority)}30`,
                          color: getPriorityColor(announcement.priority),
                          border: `1px solid ${getPriorityColor(announcement.priority)}`
                        }}
                      >
                        {getPriorityBadge(announcement.priority)}
                      </span>
                      {!announcement.read && (
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{
                          background: '#22d3ee',
                          boxShadow: '0 0 10px #22d3ee'
                        }}></span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-3">{announcement.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <PersonIcon sx={{ fontSize: 16 }} />
                        <span>{announcement.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <span>{announcement.timestamp}</span>
                      </div>
                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          background: 'rgba(129, 140, 248, 0.2)',
                          color: '#818cf8'
                        }}
                      >
                        {announcement.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
