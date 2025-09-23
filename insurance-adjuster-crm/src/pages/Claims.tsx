import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign,
  User,
  MapPin
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Claim {
  id: string
  fileNumber: string
  claimNumber: string
  clientName: string
  status: string
  dateOfLoss: string
  causeOfLoss: string
  estimatedValue: number
  assignedAdjuster: string
  location: string
  createdAt: string
}

export function Claims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading claims data
    const loadClaims = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const sampleClaims: Claim[] = [
        {
          id: '1',
          fileNumber: '2024-1501',
          claimNumber: 'INS-2024-001501',
          clientName: 'Robert Martinez',
          status: 'Settlement Negotiation',
          dateOfLoss: '2024-09-15',
          causeOfLoss: 'Hurricane Damage',
          estimatedValue: 450000,
          assignedAdjuster: 'Sarah Johnson',
          location: 'Miami, FL',
          createdAt: '2024-09-16'
        },
        {
          id: '2',
          fileNumber: '2024-1502',
          claimNumber: 'INS-2024-001502',
          clientName: 'Jennifer Chen',
          status: 'Investigation',
          dateOfLoss: '2024-09-20',
          causeOfLoss: 'Water Damage',
          estimatedValue: 125000,
          assignedAdjuster: 'Mike Chen',
          location: 'Orlando, FL',
          createdAt: '2024-09-21'
        },
        {
          id: '3',
          fileNumber: '2024-1503',
          claimNumber: 'INS-2024-001503',
          clientName: 'David Thompson',
          status: 'Closed - Settled',
          dateOfLoss: '2024-08-10',
          causeOfLoss: 'Fire Damage',
          estimatedValue: 320000,
          assignedAdjuster: 'Sarah Johnson',
          location: 'Tampa, FL',
          createdAt: '2024-08-11'
        }
      ]
      
      setClaims(sampleClaims)
      setLoading(false)
    }

    loadClaims()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'investigation':
        return 'bg-yellow-100 text-yellow-800'
      case 'settlement negotiation':
        return 'bg-blue-100 text-blue-800'
      case 'closed - settled':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      claim.status.toLowerCase().includes(statusFilter.toLowerCase())
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all insurance claims
          </p>
        </div>
        
        <Button asChild>
          <Link to="/claims/new">
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search claims by file number, client, or claim number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="investigation">Investigation</option>
              <option value="settlement">Settlement Negotiation</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <div className="grid gap-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.fileNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Claim #{claim.claimNumber}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium">{claim.clientName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Loss Date:</span>
                      <span className="font-medium">{formatDate(claim.dateOfLoss)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Est. Value:</span>
                      <span className="font-medium">{formatCurrency(claim.estimatedValue)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{claim.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Cause of Loss:</span>
                        <span className="ml-2 font-medium">{claim.causeOfLoss}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Assigned to:</span>
                        <span className="ml-2 font-medium">{claim.assignedAdjuster}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredClaims.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No claims found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first claim.'}
              </p>
              <Button asChild>
                <Link to="/claims/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Claim
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}