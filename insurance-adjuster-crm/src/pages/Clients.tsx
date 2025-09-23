import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Calendar
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  activeClaims: number
  totalClaims: number
  lastContact: string
  status: string
  createdAt: string
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading clients data
    const loadClients = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const sampleClients: Client[] = [
        {
          id: '1',
          firstName: 'Robert',
          lastName: 'Martinez',
          email: 'robert.martinez@email.com',
          phone: '(305) 555-0123',
          address: '1234 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139',
          activeClaims: 1,
          totalClaims: 3,
          lastContact: '2024-09-23',
          status: 'Active',
          createdAt: '2023-05-15'
        },
        {
          id: '2',
          firstName: 'Jennifer',
          lastName: 'Chen',
          email: 'jennifer.chen@email.com',
          phone: '(407) 555-0456',
          address: '5678 Lake Vista Blvd',
          city: 'Orlando',
          state: 'FL',
          zipCode: '32801',
          activeClaims: 1,
          totalClaims: 1,
          lastContact: '2024-09-22',
          status: 'Active',
          createdAt: '2024-09-10'
        },
        {
          id: '3',
          firstName: 'David',
          lastName: 'Thompson',
          email: 'david.thompson@email.com',
          phone: '(813) 555-0789',
          address: '9012 Bay Shore Drive',
          city: 'Tampa',
          state: 'FL',
          zipCode: '33602',
          activeClaims: 0,
          totalClaims: 2,
          lastContact: '2024-08-15',
          status: 'Inactive',
          createdAt: '2023-12-03'
        },
        {
          id: '4',
          firstName: 'Maria',
          lastName: 'Rodriguez',
          email: 'maria.rodriguez@email.com',
          phone: '(561) 555-0234',
          address: '3456 Palm Beach Rd',
          city: 'West Palm Beach',
          state: 'FL',
          zipCode: '33401',
          activeClaims: 2,
          totalClaims: 4,
          lastContact: '2024-09-24',
          status: 'Active',
          createdAt: '2022-08-20'
        }
      ]
      
      setClients(sampleClients)
      setLoading(false)
    }

    loadClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      `${client.city}, ${client.state}`.toLowerCase().includes(searchLower)
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your client database and relationships
          </p>
        </div>
        
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-sm text-gray-500">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.status === 'Active').length}
                </p>
                <p className="text-sm text-gray-500">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.reduce((sum, c) => sum + c.activeClaims, 0)}
                </p>
                <p className="text-sm text-gray-500">Active Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => {
                    const lastContact = new Date(c.lastContact)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return lastContact >= weekAgo
                  }).length}
                </p>
                <p className="text-sm text-gray-500">Recent Contact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Client since {formatDate(client.createdAt)}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {client.city}, {client.state} {client.zipCode}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-6">
                        <div>
                          <span className="text-gray-600">Active Claims:</span>
                          <span className="ml-2 font-medium text-orange-600">{client.activeClaims}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Total Claims:</span>
                          <span className="ml-2 font-medium">{client.totalClaims}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Last Contact:</span>
                        <span className="ml-2 font-medium">{formatDate(client.lastContact)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No clients found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first client.'}
              </p>
              <Button asChild>
                <Link to="/clients/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Client
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}