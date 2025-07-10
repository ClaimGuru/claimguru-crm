import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard,
  FileText,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Wallet,
  BanknoteIcon,
  Calculator
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { FeeSchedule, Expense, Payment, Claim } from '../lib/supabase'
import { FinanceAnalytics } from '../components/finance/FinanceAnalytics'
import { FeeScheduleForm } from '../components/forms/FeeScheduleForm'
import { ExpenseForm } from '../components/forms/ExpenseForm'
import { PaymentForm } from '../components/forms/PaymentForm'

interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  outstandingFees: number
  monthlyRevenue: { month: string; revenue: number; expenses: number }[]
  revenueByStatus: { status: string; amount: number }[]
  expensesByCategory: { category: string; amount: number }[]
  topPerformingClaims: { id: string; file_number: string; revenue: number }[]
  recentTransactions: any[]
}

export function Finance() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadFinanceData()
    }
  }, [userProfile?.organization_id, dateRange])

  async function loadFinanceData() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch (dateRange) {
        case '7d': startDate.setDate(endDate.getDate() - 7); break
        case '30d': startDate.setDate(endDate.getDate() - 30); break
        case '90d': startDate.setDate(endDate.getDate() - 90); break
        case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break
        default: startDate.setDate(endDate.getDate() - 30)
      }

      const [feesData, expensesData, paymentsData, claimsData] = await Promise.all([
        supabase
          .from('fee_schedules')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('claims')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
      ])

      const fees = feesData.data || []
      const expensesResult = expensesData.data || []
      const paymentsResult = paymentsData.data || []
      const claims = claimsData.data || []

      // Calculate statistics
      const totalRevenue = paymentsResult
        .filter(p => p.payment_type === 'fee_payment')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      
      const totalExpenses = expensesResult
        .reduce((sum, e) => sum + (e.amount || 0), 0)
      
      const netProfit = totalRevenue - totalExpenses
      
      const pendingPayments = paymentsResult
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      
      const outstandingFees = fees
        .filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + (f.fee_amount || 0), 0)

      // Monthly revenue/expense analysis
      const monthlyData = {}
      paymentsResult.forEach(payment => {
        const month = new Date(payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, expenses: 0 }
        }
        if (payment.payment_type === 'fee_payment') {
          monthlyData[month].revenue += payment.amount || 0
        }
      })
      
      expensesResult.forEach(expense => {
        const month = new Date(expense.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, expenses: 0 }
        }
        monthlyData[month].expenses += expense.amount || 0
      })

      const monthlyRevenue = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses
      }))

      // Revenue by status
      const revenueByStatus = fees.reduce((acc, fee) => {
        const existing = acc.find(item => item.status === fee.status)
        if (existing) {
          existing.amount += fee.fee_amount || 0
        } else {
          acc.push({ status: fee.status, amount: fee.fee_amount || 0 })
        }
        return acc
      }, [] as { status: string; amount: number }[])

      // Expenses by category
      const expensesByCategory = expensesResult.reduce((acc, expense) => {
        const category = expense.category || 'Other'
        const existing = acc.find(item => item.category === category)
        if (existing) {
          existing.amount += expense.amount || 0
        } else {
          acc.push({ category, amount: expense.amount || 0 })
        }
        return acc
      }, [] as { category: string; amount: number }[])

      // Top performing claims (by revenue)
      const claimsRevenue = claims.map(claim => {
        const claimFees = fees.filter(f => f.claim_id === claim.id)
        const claimRevenue = claimFees.reduce((sum, f) => sum + (f.fee_amount || 0), 0)
        return {
          id: claim.id,
          file_number: claim.file_number,
          revenue: claimRevenue
        }
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

      // Recent transactions
      const recentTransactions = [
        ...paymentsResult.slice(0, 5).map(p => ({ ...p, type: 'payment' })),
        ...expensesResult.slice(0, 5).map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

      setStats({
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments,
        outstandingFees,
        monthlyRevenue,
        revenueByStatus,
        expensesByCategory,
        topPerformingClaims: claimsRevenue,
        recentTransactions
      })

      setFeeSchedules(fees)
      setExpenses(expensesResult)
      setPayments(paymentsResult)
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any, type: string) => {
    try {
      if (selectedRecord) {
        // Update existing record
        await supabase
          .from(type === 'fee' ? 'fee_schedules' : type === 'expense' ? 'expenses' : 'payments')
          .update(data)
          .eq('id', selectedRecord.id)
      } else {
        // Create new record
        await supabase
          .from(type === 'fee' ? 'fee_schedules' : type === 'expense' ? 'expenses' : 'payments')
          .insert([{ ...data, organization_id: userProfile?.organization_id }])
      }
      
      // Reload data
      await loadFinanceData()
      
      // Close forms
      setShowFeeForm(false)
      setShowExpenseForm(false)
      setShowPaymentForm(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error(`Error saving ${type}:`, error)
    }
  }

  const handleDelete = async (id: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      await supabase
        .from(type === 'fee' ? 'fee_schedules' : type === 'expense' ? 'expenses' : 'payments')
        .delete()
        .eq('id', id)
      
      await loadFinanceData()
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  const exportData = () => {
    // Implementation for data export
    const exportData = {
      feeSchedules,
      expenses,
      payments,
      stats
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `finance-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial tracking and analysis
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dateRange.replace('d', ' days').replace('y', ' year')}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">
                  ${stats?.totalExpenses?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dateRange.replace('d', ' days').replace('y', ' year')}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-3xl font-bold ${
                  (stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats?.netProfit?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats?.netProfit || 0) / (stats?.totalRevenue || 1) * 100).toFixed(1)}% margin
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${stats?.outstandingFees?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pending collection
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Wallet className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'fees', label: 'Fee Schedules', icon: Receipt },
            { id: 'expenses', label: 'Expenses', icon: CreditCard },
            { id: 'payments', label: 'Payments', icon: BanknoteIcon },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Monthly Revenue vs Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.monthlyRevenue?.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-green-600">+${data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(data.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue)) || 1) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Expenses: ${data.expenses.toLocaleString()}</span>
                      <span>Net: ${(data.revenue - data.expenses).toLocaleString()}</span>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No revenue data</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentTransactions?.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'payment' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'payment' ? (
                          <BanknoteIcon className={`h-4 w-4 ${
                            transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <Receipt className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || transaction.payment_type || transaction.expense_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'payment' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'fees' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Schedules</CardTitle>
              <Button onClick={() => setShowFeeForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeSchedules.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fee.fee_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${fee.fee_amount?.toLocaleString() || '0'}
                        {fee.fee_percentage && ` (${fee.fee_percentage}%)`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                          fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRecord(fee)
                            setShowFeeForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(fee.id, 'fee')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feeSchedules.length === 0 && (
                <p className="text-gray-500 text-center py-8">No fee schedules found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <FinanceAnalytics stats={stats} />
      )}

      {/* Forms */}
      {showFeeForm && (
        <FeeScheduleForm
          feeSchedule={selectedRecord}
          isOpen={showFeeForm}
          onClose={() => {
            setShowFeeForm(false)
            setSelectedRecord(null)
          }}
          onSave={(data) => handleSave(data, 'fee')}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          expense={selectedRecord}
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false)
            setSelectedRecord(null)
          }}
          onSave={(data) => handleSave(data, 'expense')}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          payment={selectedRecord}
          isOpen={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedRecord(null)
          }}
          onSave={(data) => handleSave(data, 'payment')}
        />
      )}
    </div>
  )
}