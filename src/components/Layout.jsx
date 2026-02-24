import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Building2, DollarSign, 
  CheckSquare, Activity, Settings, LogOut, Menu, X,
  Search, Bell, ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/contacts', label: '联系人', icon: Users },
  { path: '/companies', label: '公司', icon: Building2 },
  { path: '/deals', label: '销售机会', icon: DollarSign },
  { path: '/tasks', label: '任务', icon: CheckSquare },
  { path: '/activities', label: '活动', icon: Activity },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
                C
              </div>
              <span className="font-semibold text-lg">CRM</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-700 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || '用户'}</p>
                <p className="text-xs text-slate-400">管理员</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <Users size={20} />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="搜索客户、公司、机会..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <span>{user?.email?.split('@')[0] || '用户'}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
