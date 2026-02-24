import { useState, useEffect } from 'react'
import { 
  Users, Building2, DollarSign, TrendingUp, 
  TrendingDown, Calendar, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState({
    contacts: 0,
    companies: 0,
    deals: 0,
    dealsValue: 0,
    tasks: 0,
    completedTasks: 0
  })
  const [recentDeals, setRecentDeals] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)

      // Fetch contacts
      const { data: contacts } = await supabase.from('contacts').select('id, created_at')
      
      // Fetch companies
      const { data: companies } = await supabase.from('companies').select('id, created_at')

      // Fetch deals
      const { data: deals } = await supabase.from('deals').select('*')
      const dealsValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0

      // Fetch tasks
      const { data: tasks } = await supabase.from('tasks').select('*')
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0

      setStats({
        contacts: contacts?.length || 0,
        companies: companies?.length || 0,
        deals: deals?.length || 0,
        dealsValue,
        tasks: tasks?.length || 0,
        completedTasks
      })

      // Recent deals
      const sortedDeals = deals?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5) || []
      setRecentDeals(sortedDeals)

      // Upcoming tasks
      const upcoming = tasks
        ?.filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(a.due_date) - new b.due_date)
        .slice(0, 5) || []
      setUpcomingTasks(upcoming)

      // Recent activities
      const allActivities = []
      contacts?.forEach(c => allActivities.push({ type: 'contact', data: c, date: c.created_at }))
      companies?.forEach(c => allActivities.push({ type: 'company', data: c, date: c.created_at }))
      deals?.forEach(d => allActivities.push({ type: 'deal', data: d, date: d.created_at }))
      tasks?.forEach(t => allActivities.push({ type: 'task', data: t, date: t.created_at }))
      
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
      setActivities(sortedActivities)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDealStageColor = (stage) => {
    const colors = {
      '新建': 'bg-blue-100 text-blue-700',
      '初步接触': 'bg-yellow-100 text-yellow-700',
      '需求分析': 'bg-purple-100 text-purple-700',
      '方案报价': 'bg-orange-100 text-orange-700',
      '商务谈判': 'bg-indigo-100 text-indigo-700',
      '成交': 'bg-green-100 text-green-700',
      '丢失': 'bg-red-100 text-red-700'
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'contact': return <Users size={16} />
      case 'company': return <Building2 size={16} />
      case 'deal': return <DollarSign size={16} />
      case 'task': return <CheckCircle2 size={16} />
      default: return <Activity size={16} />
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'contact': return `新建联系人: ${activity.data.name}`
      case 'company': return `新建公司: ${activity.data.name}`
      case 'deal': return `新建销售机会: ${activity.data.name}`
      case 'task': return `新建任务: ${activity.data.title}`
      default: return '新活动'
    }
  }

  const statCards = [
    { 
      title: '联系人', 
      value: stats.contacts, 
      icon: Users, 
      trend: '+12%',
      trendUp: true,
      color: 'bg-blue-500'
    },
    { 
      title: '公司', 
      value: stats.companies, 
      icon: Building2, 
      trend: '+8%',
      trendUp: true,
      color: 'bg-purple-500'
    },
    { 
      title: '销售机会', 
      value: stats.deals, 
      icon: DollarSign, 
      trend: '+24%',
      trendUp: true,
      color: 'bg-green-500'
    },
    { 
      title: '总价值', 
      value: `¥${stats.dealsValue.toLocaleString()}`, 
      icon: TrendingUp, 
      trend: '+18%',
      trendUp: true,
      color: 'bg-orange-500'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-slate-500 mt-1">欢迎回来，这里是您的CRM概览</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />
          <span>{format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">最新销售机会</h2>
          </div>
          <div className="p-6">
            {recentDeals.length > 0 ? (
              <div className="space-y-4">
                {recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{deal.name}</p>
                        <p className="text-sm text-slate-500">{deal.company_name || '未关联公司'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">¥{deal.value?.toLocaleString() || 0}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getDealStageColor(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <DollarSign size={40} className="mx-auto mb-2 opacity-50" />
                <p>暂无销售机会</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">待办任务</h2>
          </div>
          <div className="p-6">
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`mt-0.5 p-1 rounded ${task.priority === 'high' ? 'bg-red-100' : task.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                      {task.priority === 'high' ? 
                        <AlertCircle size={14} className="text-red-600" /> : 
                        task.priority === 'medium' ?
                        <Clock size={14} className="text-yellow-600" /> :
                        <CheckCircle2 size={14} className="text-blue-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <Clock size={12} className="inline mr-1" />
                        {task.due_date ? format(new Date(task.due_date), 'MM/dd') : '无截止日期'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 size={40} className="mx-auto mb-2 opacity-50" />
                <p>暂无待办任务</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">最近活动</h2>
        </div>
        <div className="p-6">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-full">
                    <span className="text-slate-600">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{getActivityText(activity)}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(activity.date), 'MM/dd HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>暂无活动记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
