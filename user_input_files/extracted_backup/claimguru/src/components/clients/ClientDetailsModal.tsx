import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  X, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  User, 
  Calendar,
  FileText,
  Plus,
  Eye,
  DollarSign
} from 'lucide-react'
import type { Client } from '../../lib/supabase'

interface ClientDetailsModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEdit: (client: Client) => void
  onCreateClaim: (client: Client) => void
  claims?: any[]
}

export function ClientDetailsModal({ 
  client, 
  isOpen, 
  onClose, 
  onEdit, 
  onCreateClaim, 
  claims = [] 
}: ClientDetailsModalProps) {
  if (!isOpen || !client) return null

  const clientClaims = claims.filter(claim => claim.client_id === client.id)
  const activeClaims = clientClaims.filter(claim => 
    claim.claim_status !== 'closed' && claim.claim_status !== 'settled'
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {client.client_type === 'commercial' ? (
                <Building className="h-6 w-6 text-blue-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {client.first_name} {client.last_name}
              </h2>
              {client.business_name && (
                <p className="text-gray-600">{client.business_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(client)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Client
            </Button>
            <Button
              onClick={() => onCreateClaim(client)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Claim
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.primary_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{client.primary_email}</p>
                    </div>
                  </div>
                )}
                {client.primary_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{client.primary_phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Type</p>
                    <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                      client.client_type === 'commercial' 
                        ? 'text-purple-600 bg-purple-100'
                        : 'text-blue-600 bg-blue-100'
                    }`}>
                      {client.client_type?.charAt(0).toUpperCase() + client.client_type?.slice(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {(client.address_line_1 || client.city || client.state) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {client.address_line_1 && (
                      <p className="text-sm text-gray-900">{client.address_line_1}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {[client.city, client.state, client.zip_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {client.country && client.country !== 'United States' && (
                      <p className="text-sm text-gray-600">{client.country}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Claims Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Claims Summary
                  </div>
                  <Button
                    onClick={() => onCreateClaim(client)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Claim
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Claims</p>
                        <p className="text-2xl font-bold text-blue-900">{clientClaims.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Active Claims</p>
                        <p className="text-2xl font-bold text-green-900">{activeClaims.length}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">Total Value</p>
                        <p className="text-2xl font-bold text-purple-900">
                          ${clientClaims.reduce((sum, claim) => sum + (claim.estimated_settlement || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Claims List */}
                {clientClaims.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recent Claims</h4>
                    {clientClaims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{claim.claim_number}</p>
                          <p className="text-sm text-gray-600">{claim.property_address}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm px-2 py-1 rounded-full ${
                            claim.claim_status === 'open' ? 'bg-blue-100 text-blue-800' :
                            claim.claim_status === 'settled' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {claim.claim_status}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ${(claim.estimated_settlement || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {clientClaims.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{clientClaims.length - 5} more claims
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No claims yet for this client</p>
                    <Button 
                      onClick={() => onCreateClaim(client)}
                      className="mt-2"
                      size="sm"
                    >
                      Create First Claim
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Client History */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Client History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Client created on {new Date(client.created_at).toLocaleDateString()}</span>
                  </div>
                  {client.updated_at && client.updated_at !== client.created_at && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Last updated on {new Date(client.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
