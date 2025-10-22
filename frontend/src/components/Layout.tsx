import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Truck, 
  Route, 
  Users, 
  Wrench,
  Bell,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Receipt,
  Calculator,
  LucideIcon
} from 'lucide-react'
import NotificationBar from './NotificationBar'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../contexts/TranslationContext'
import '../styles/sidebar.css'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
  section: string
}

interface NavigationItem {
  name: string
  translationKey: string
  href: string
  icon: LucideIcon
  badge?: number
  section: string
}

const navigationItems: Omit<NavigationItem, 'name'>[] = [
  { translationKey: 'nav.dashboard', href: '/', icon: LayoutDashboard, section: 'overview' },
  { translationKey: 'nav.analytics', href: '/analytics', icon: BarChart3, section: 'overview' },
  
  { translationKey: 'nav.trucks', href: '/trucks', icon: Truck, section: 'fleet' },
  { translationKey: 'nav.trips', href: '/trips', icon: Route, badge: 3, section: 'fleet' },
  { translationKey: 'nav.drivers', href: '/drivers', icon: Users, section: 'fleet' },
  
  { translationKey: 'nav.invoices', href: '/invoices', icon: Receipt, badge: 2, section: 'financial' },
  { translationKey: 'nav.ifta_calculator', href: '/ifta', icon: Calculator, section: 'financial' },
  { translationKey: 'nav.ifta_form', href: '/ifta-form', icon: FileText, section: 'financial' },
  { translationKey: 'nav.maintenance', href: '/maintenance', icon: Wrench, badge: 2, section: 'operations' },
  { translationKey: 'nav.reports', href: '/reports', icon: FileText, section: 'operations' },
  { translationKey: 'nav.safety', href: '/safety', icon: Shield, section: 'operations' },
  { translationKey: 'nav.settings', href: '/settings', icon: Settings, section: 'system' },
]

const sectionKeys = {
  overview: 'Overview',
  fleet: 'Fleet Management', 
  financial: 'Financial',
  operations: 'Operations',
  system: 'System'
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  // Create navigation with translated names
  const navigation: NavigationItem[] = navigationItems.map(item => ({
    ...item,
    name: t(item.translationKey)
  }))

  const getSectionItems = (sectionKey: string) => 
    navigation.filter(item => item.section === sectionKey)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Enhanced Sidebar with Material Design and Theme Support */}
      <div className="sidebar elevation-2">
        {/* Header with professional truck branding */}
        <div className="sidebar-header">
          <div className="flex items-center">
            <Truck className="w-6 h-6 mr-3 text-secondary-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <h1 className="text-white">TruckFlow</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {Object.entries(sectionKeys).map(([sectionKey, sectionTitle]) => (
            <div key={sectionKey} className="nav-section">
              <div className="nav-section-title">
                {sectionTitle}
              </div>
              <ul className="space-y-1">
                {getSectionItems(sectionKey).map((item) => {
                  const isActive = location.pathname === item.href
                  const IconComponent = item.icon
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                      >
                        <IconComponent className="nav-icon" />
                        <span className="nav-text">{item.name}</span>
                        {item.badge && (
                          <span className="nav-badge">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Settings section at the bottom with professional styling */}
          <div className="nav-section mt-8 pt-4 border-t border-white border-opacity-20">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/notifications"
                  className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}
                >
                  <Bell className="nav-icon" />
                  <span className="nav-text">Notifications</span>
                  <span className="nav-badge">5</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                >
                  <Settings className="nav-icon" />
                  <span className="nav-text">Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Notification Bar */}
        <NotificationBar />
        
        <main className="py-8" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: 'calc(100vh - 80px)' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
