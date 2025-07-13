import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { X, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CreateClaimModalProps {
  client: any
  isOpen: boolean
  onClose: () => void
}

export function CreateClaimModal({ client, isOpen, onClose }: CreateClaimModalProps) {
  const navigate = useNavigate()

  if (!isOpen || !client) return null

  const handleCreateClaim = () => {
    // Store client data in localStorage for the claim form to use
    localStorage.setItem('preloadedClient', JSON.stringify({
      id: client.id,
      name: client.client_type === 'residential' 
        ? `${client.first_name} ${client.last_name}`.trim()
        : client.business_name,
      email: client.primary_email,
      phone: client.primary_phone,
      address: client.address_line_1,
      city: client.city,
      state: client.state,
      zip_code: client.zip_code,
      client_type: client.client_type,
      lead_source: client.lead_source,
      lead_source_details: client.lead_source_details
    }))
    
    onClose()
    navigate('/claims')
  }

  const handleViewClient = () => {
    onClose()
    // The client details will remain accessible through the parent component
  }

  const clientName = client.client_type === 'residential' 
    ? `${client.first_name} ${client.last_name}`.trim()
    : client.business_name

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Client Created Successfully!
              </h2>
              <p className="text-sm text-gray-600">
                {clientName} has been added to your CRM
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              What's Next?
            </h3>
            <p className="text-gray-600 mb-6">
              Would you like to create a claim for {clientName}?
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCreateClaim}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Create Claim for {clientName}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline"
              onClick={handleViewClient}
              className="w-full"
            >
              View Client Details
            </Button>

            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-600"
            >
              Continue to Clients List
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Streamlined Workflow
                </p>
                <p className="text-xs text-blue-700">
                  Your client information will be automatically populated in the new claim form to save you time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
