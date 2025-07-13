import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Star,
  User,
  FileText,
  X
} from 'lucide-react'
import type { Vendor } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface VendorAssignmentsProps {
  vendors: Vendor[]
  onRefresh: () => void
}

interface Assignment {
  id: string
  vendor_id: string
  claim_id: string
  assignment_type: string
  description: string
  assigned_date: string
  due_date?: string
  completed_date?: string
  status: string
  priority: string
  amount?: number
  rating?: number
  vendors?: Vendor
}

export function VendorAssignments({ vendors, onRefresh }: VendorAssignmentsProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadAssignments()
  }, [userProfile?.organization_id])

  async function loadAssignments() {
    try {
      setLoading(true)
      
      // Mock assignments data
      const mockAssignments: Assignment[] = vendors.slice(0, 5).map((vendor, index) => ({
        id: `assignment-${index}`,
        vendor_id: vendor.id,
        claim_id: `claim-${index}`,
        assignment_type: ['inspection', 'repair', 'evaluation', 'cleanup'][index % 4],
        description: `${vendor.category} work for claim #${1000 + index}`,
        assigned_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['assigned', 'in_progress', 'completed', 'cancelled'][index % 4],
        priority: ['high', 'medium', 'low'][index % 3],
        amount: Math.floor(Math.random() * 5000) + 1000,
        rating: Math.random() > 0.5 ? 3 + Math.random() * 2 : undefined,
        vendors: vendor
      }))
      
      setAssignments(mockAssignments)
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteAssignment = async (assignment: Assignment) => {
    // Mock completion
    setAssignments(prev => prev.map(a => 
      a.id === assignment.id 
        ? { ...a, status: 'completed', completed_date: new Date().toISOString() }
        : a
    ))
    onRefresh()
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchTerm || 
      assignment.vendors?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vendor Assignments</h2>
          <p className="text-gray-600">Manage and track vendor work assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.assignment_type?.replace('_', ' ').toUpperCase()}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor(assignment.status)
                    }`}>
                      {assignment.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getPriorityColor(assignment.priority)
                    }`}>
                      {assignment.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{assignment.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.vendors?.company_name}
                        </p>
                        <p className="text-gray-600">{assignment.vendors?.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Assigned</p>
                        <p className="text-gray-600">{new Date(assignment.assigned_date).toLocaleDateString()}</p>
                        {assignment.due_date && (
                          <p className="text-sm text-gray-600">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {assignment.amount && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">${assignment.amount.toLocaleString()}</p>
                          <p className="text-gray-600">Assignment Value</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {assignment.rating && (
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (assignment.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({assignment.rating.toFixed(1)})</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteAssignment(assignment)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first vendor assignment to get started'
            }
          </p>
        </div>
      )}
    </div>
  )
}