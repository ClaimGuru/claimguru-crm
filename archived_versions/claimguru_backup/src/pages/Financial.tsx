import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Calculator
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { FeeSchedule, Expense, Payment } from '../lib/supabase'
import { useClaims } from '../hooks/useClaims'

export function Financial() {
  const { userProfile } = useAuth()
  const { claims } = useClaims()
  const [loading, setLoading] = useState(true)
  const [fees, setFees] = useState<FeeSchedule[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'expenses' | 'payments'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadFinancialData()
    }
  }, [userProfile?.organization_id])

  async function loadFinancialData() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      const [feesData, expensesData, paymentsData] = await Promise.all([
        supabase
          .from('fee_schedules')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('expense_date', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false })
      ])

      setFees(feesData.data || [])
      setExpenses(expensesData.data || [])
      setPayments(paymentsData.data || [])
    } catch (error) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate financial metrics
  const totalRevenue = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.fee_amount || 0), 0)
  const pendingRevenue = fees.filter(f => f.status === 'pending' || f.status === 'invoiced').reduce((sum, f) => sum + (f.fee_amount || 0), 0)
  const totalExpenses = expenses.filter(e => e.approval_status === 'approved').reduce((sum, e) => sum + e.amount, 0)
  const pendingExpenses = expenses.filter(e => e.approval_status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalRevenue - totalExpenses

  const filteredData = () => {
    let data: any[] = []
    switch (activeTab) {
      case 'fees':
        data = fees
        break
      case 'expenses':
        data = expenses
        break
      case 'payments':
        data = payments
        break
      default:
        return []
    }

    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
        item.status === statusFilter || 
        item.approval_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': case 'completed': case 'approved': return CheckCircle
      case 'pending': return Clock
      case 'rejected': case 'failed': return AlertCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'completed': case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-2">
            Track fees, expenses, and payments with comprehensive financial analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fees.filter(f => f.status === 'paid').length} paid fees
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    ${pendingRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fees.filter(f => f.status === 'pending' || f.status === 'invoiced').length} pending fees
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {expenses.filter(e => e.approval_status === 'approved').length} approved expenses
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-3xl font-bold ${
                    netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${netIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Revenue - Expenses
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'fees', label: 'Fee Schedules', icon: DollarSign },
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'payments', label: 'Payments', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      {activeTab !== 'overview' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {/* Data Tables */}
      {activeTab !== 'overview' && (
        <Card>
          <CardContent className="p-6">
            {filteredData().length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab} found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : `Start by adding your first ${activeTab.slice(0, -1)}`
                  }
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add {activeTab.slice(0, -1)}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData().map((item) => {
                  const status = item.status || item.approval_status
                  const StatusIcon = getStatusIcon(status)
                  const statusColorClass = getStatusColor(status)
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${statusColorClass}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {activeTab === 'fees' && `Fee: ${item.fee_type}`}
                              {activeTab === 'expenses' && `${item.expense_type}: ${item.description}`}
                              {activeTab === 'payments' && `${item.payment_type}: ${item.reference_number || 'Payment'}`}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {activeTab === 'fees' && item.description}
                              {activeTab === 'expenses' && `Category: ${item.category || 'General'}`}
                              {activeTab === 'payments' && `Method: ${item.payment_method || 'N/A'}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activeTab === 'fees' && item.due_date && `Due: ${new Date(item.due_date).toLocaleDateString()}`}
                              {activeTab === 'expenses' && `Date: ${new Date(item.expense_date).toLocaleDateString()}`}
                              {activeTab === 'payments' && item.payment_date && `Date: ${new Date(item.payment_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.amount?.toLocaleString() || item.fee_amount?.toLocaleString() || '0'}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                            {status?.charAt(0).toUpperCase() + status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overview Charts and Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...fees.slice(0, 3), ...expenses.slice(0, 3), ...payments.slice(0, 3)]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((item, index) => {
                    const isRevenue = 'fee_amount' in item
                    const amount = ('amount' in item ? item.amount : null) || ('fee_amount' in item ? item.fee_amount : 0) || 0
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isRevenue ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {isRevenue ? (
                              <DollarSign className="h-5 w-5 text-green-600" />
                            ) : (
                              <Receipt className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {'fee_type' in item ? `Fee: ${item.fee_type}` : 
                               'expense_type' in item ? `Expense: ${item.expense_type}` : 
                               'Payment'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isRevenue ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isRevenue ? '+' : '-'}${amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Financial Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">Total Revenue</span>
                  <span className="text-green-600 font-bold">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-800 font-medium">Pending Revenue</span>
                  <span className="text-yellow-600 font-bold">${pendingRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-800 font-medium">Total Expenses</span>
                  <span className="text-red-600 font-bold">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800 font-medium">Pending Expenses</span>
                  <span className="text-gray-600 font-bold">${pendingExpenses.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className={`flex justify-between items-center p-3 rounded-lg ${
                    netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <span className={`font-bold ${
                      netIncome >= 0 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Net Income
                    </span>
                    <span className={`font-bold text-lg ${
                      netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${netIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}