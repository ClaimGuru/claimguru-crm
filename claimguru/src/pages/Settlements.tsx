import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Search, Filter,
  Plus, Eye, Edit, FileText, Calculator, Award, Target, Users, Calendar,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Handshake, Gavel
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Settlement } from '../lib/supabase'

export function Settlements() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'settlements' | 'negotiations' | 'analytics'>('overview')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadSettlements()
    }
  }, [userProfile?.organization_id])

  async function loadSettlements() {
    if (!userProfile?.organization_id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setSettlements(data || [])
    } catch (error) {
      console.error('Error loading settlements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = 
      settlement.settlement_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || settlement.settlement_status === statusFilter
    const matchesType = typeFilter === 'all' || settlement.settlement_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalized': case 'paid': return CheckCircle
      case 'negotiating': return Handshake
      case 'pending_approval': return Clock
      case 'disputed': return AlertTriangle
      case 'rejected': return AlertTriangle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized': case 'paid': return 'text-green-600 bg-green-100'
      case 'negotiating': return 'text-blue-600 bg-blue-100'
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100'
      case 'disputed': case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate settlement metrics
  const totalSettlements = settlements.length
  const totalSettlementAmount = settlements
    .filter(s => s.settlement_status === 'finalized' || s.settlement_status === 'paid')
    .reduce((sum, s) => sum + (s.settlement_amount || 0), 0)
  const pendingSettlements = settlements.filter(s => 
    s.settlement_status === 'negotiating' || s.settlement_status === 'pending_approval'
  )
  const pendingAmount = pendingSettlements.reduce((sum, s) => sum + (s.settlement_amount || 0), 0)
  const averageSettlement = totalSettlements > 0 ? totalSettlementAmount / totalSettlements : 0

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
          <h1 className="text-3xl font-bold text-gray-900">Settlement Management</h1>
          <p className="text-gray-600 mt-2">
            Track negotiations, manage settlements, and analyze payment outcomes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculate Settlement
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Settlement
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSettlements}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {settlements.filter(s => s.settlement_status === 'finalized').length} finalized
                  </p>
                </div>
                <Handshake className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(totalSettlementAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Completed settlements
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(pendingAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pendingSettlements.length} in progress
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
                  <p className="text-sm font-medium text-gray-600">Average Settlement</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(averageSettlement)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per case average
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'settlements', label: 'Settlements', icon: DollarSign },
            { id: 'negotiations', label: 'Active Negotiations', icon: Handshake },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
      {(activeTab === 'settlements' || activeTab === 'negotiations') && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search settlements..."
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
              <option value="negotiating">Negotiating</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="finalized">Finalized</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="property_damage">Property Damage</option>
              <option value="business_interruption">Business Interruption</option>
              <option value="additional_living_expenses">Additional Living Expenses</option>
              <option value="contents">Contents</option>
            </select>
          </div>
        </div>
      )}

      {/* Settlements List */}
      {(activeTab === 'settlements' || activeTab === 'negotiations') && (
        <>
          {filteredSettlements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {settlements.length === 0 ? 'No settlements yet' : 'No matching settlements'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {settlements.length === 0 
                    ? 'Start your first settlement negotiation'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {settlements.length === 0 && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Settlement
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSettlements.map((settlement) => {
                const StatusIcon = getStatusIcon(settlement.settlement_status)
                const statusColorClass = getStatusColor(settlement.settlement_status)
                
                return (
                  <Card key={settlement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {settlement.settlement_type?.replace('_', ' ').split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')} Settlement
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {settlement.settlement_status?.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">Settlement Amount</p>
                                <p className="font-semibold text-lg text-green-600">
                                  {formatCurrency(settlement.settlement_amount || 0)}
                                </p>
                              </div>
                              
                              {settlement.initial_demand && (
                                <div>
                                  <p className="text-sm text-gray-500">Initial Demand</p>
                                  <p className="font-medium text-gray-900">
                                    {formatCurrency(settlement.initial_demand)}
                                  </p>
                                </div>
                              )}
                              
                              {settlement.settlement_date && (
                                <div>
                                  <p className="text-sm text-gray-500">Settlement Date</p>
                                  <p className="font-medium text-gray-900">
                                    {new Date(settlement.settlement_date).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {settlement.notes && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {settlement.notes}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Created {new Date(settlement.created_at).toLocaleDateString()}
                              </span>
                              
                              {settlement.negotiation_rounds && (
                                <span className="flex items-center">
                                  <Handshake className="h-3 w-3 mr-1" />
                                  {settlement.negotiation_rounds} rounds
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          {settlement.settlement_status === 'negotiating' && (
                            <Button size="sm" className="flex items-center gap-1">
                              <Handshake className="h-3 w-3" />
                              Negotiate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Overview Dashboard */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Settlements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Settlements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settlements.slice(0, 5).map((settlement) => {
                  const StatusIcon = getStatusIcon(settlement.settlement_status)
                  const statusColorClass = getStatusColor(settlement.settlement_status)
                  
                  return (
                    <div key={settlement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {settlement.settlement_type?.replace('_', ' ')} Settlement
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(settlement.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(settlement.settlement_amount || 0)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                          {settlement.settlement_status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Settlement Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Settlement Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Property Damage', amount: settlements.filter(s => s.settlement_type === 'property_damage').reduce((sum, s) => sum + (s.settlement_amount || 0), 0), color: 'bg-blue-100 text-blue-600' },
                  { type: 'Business Interruption', amount: settlements.filter(s => s.settlement_type === 'business_interruption').reduce((sum, s) => sum + (s.settlement_amount || 0), 0), color: 'bg-green-100 text-green-600' },
                  { type: 'Additional Living', amount: settlements.filter(s => s.settlement_type === 'additional_living_expenses').reduce((sum, s) => sum + (s.settlement_amount || 0), 0), color: 'bg-yellow-100 text-yellow-600' },
                  { type: 'Contents', amount: settlements.filter(s => s.settlement_type === 'contents').reduce((sum, s) => sum + (s.settlement_amount || 0), 0), color: 'bg-purple-100 text-purple-600' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${item.color.split(' ')[0]}`}></div>
                      <span className="font-medium text-gray-900">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-500">
                        {totalSettlementAmount > 0 ? ((item.amount / totalSettlementAmount) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalSettlements > 0 ? ((settlements.filter(s => s.settlement_status === 'finalized' || s.settlement_status === 'paid').length / totalSettlements) * 100).toFixed(1) : 0}%
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
                    <p className="text-sm font-medium text-gray-600">Avg. Negotiation Time</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                    <p className="text-3xl font-bold text-gray-900">87%</p>
                    <p className="text-xs text-gray-500">of initial demand</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Settlement Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Top Performing Categories</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Property Damage</span>
                      <span className="text-sm font-medium">92% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Business Interruption</span>
                      <span className="text-sm font-medium">85% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contents</span>
                      <span className="text-sm font-medium">78% success</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Settlement Trends</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">+15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Settlement</span>
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">+8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Resolution Time</span>
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">-12%</span>
                      </div>
                    </div>
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