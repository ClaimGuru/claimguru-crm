/**
 * COMPREHENSIVE CLIENT DETAIL VIEW
 * 
 * A complete client information display component that shows all client data
 * in an organized, professional format with editing capabilities.
 * 
 * Features:
 * - Complete client information display
 * - Contact information and communication preferences
 * - Address and location details
 * - Policy information and claim history
 * - Emergency contacts and relationships
 * - Inline editing capabilities
 * - Communication history tracking
 * - Document attachments
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Camera,
  Paperclip,
  DollarSign,
  TrendingUp,
  Activity,
  UserPlus,
  Users
} from 'lucide-react';

interface ClientDetailViewProps {
  client: any;
  onUpdate?: (updatedClient: any) => void;
  onClose?: () => void;
  showEditMode?: boolean;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  onUpdate,
  onClose,
  showEditMode = false
}) => {
  const [isEditing, setIsEditing] = useState(showEditMode);
  const [editedClient, setEditedClient] = useState(client);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedClient(client);
  }, [client]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(editedClient);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressType: string, field: string, value: string) => {
    setEditedClient(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getClientTypeBadge = (type: string) => {
    const config = {
      individual: { color: 'bg-blue-100 text-blue-800', label: 'Individual' },
      business: { color: 'bg-purple-100 text-purple-800', label: 'Business' },
      organization: { color: 'bg-green-100 text-green-800', label: 'Organization' }
    };
    return config[type] || config.individual;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    return config[status] || config.active;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'address', label: 'Addresses', icon: MapPin },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'claims', label: 'Claims History', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Paperclip }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {client.client_type === 'business' ? (
                  <Building className="h-8 w-8" />
                ) : (
                  client.first_name?.[0] || client.business_name?.[0] || 'C'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.client_type === 'business' 
                    ? client.business_name 
                    : `${client.first_name} ${client.last_name}`
                  }
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getClientTypeBadge(client.client_type).color}>
                    {getClientTypeBadge(client.client_type).label}
                  </Badge>
                  <Badge className={getStatusBadge(client.status || 'active').color}>
                    {React.createElement(getStatusBadge(client.status || 'active').icon, { className: 'h-3 w-3 mr-1' })}
                    {(client.status || 'active').charAt(0).toUpperCase() + (client.status || 'active').slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Client since {formatDate(client.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Client
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
              {onClose && (
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Client Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Claims:</span>
                    <span className="font-semibold">{client.total_claims || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Claims:</span>
                    <span className="font-semibold">{client.active_claims || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Settled:</span>
                    <span className="font-semibold">{formatCurrency(client.total_settled || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Activity:</span>
                    <span className="font-semibold">{formatDate(client.last_activity || client.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.client_type === 'business' ? (
                    <>
                      <div>
                        <label className="text-sm text-gray-600">Business Name</label>
                        {isEditing ? (
                          <Input
                            value={editedClient.business_name || ''}
                            onChange={(e) => handleInputChange('business_name', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{client.business_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Tax ID</label>
                        {isEditing ? (
                          <Input
                            value={editedClient.tax_id || ''}
                            onChange={(e) => handleInputChange('tax_id', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{client.tax_id || 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Input
                              placeholder="First Name"
                              value={editedClient.first_name || ''}
                              onChange={(e) => handleInputChange('first_name', e.target.value)}
                            />
                            <Input
                              placeholder="Last Name"
                              value={editedClient.last_name || ''}
                              onChange={(e) => handleInputChange('last_name', e.target.value)}
                            />
                          </div>
                        ) : (
                          <p className="font-semibold">{client.first_name} {client.last_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Date of Birth</label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editedClient.date_of_birth || ''}
                            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold">{client.date_of_birth ? formatDate(client.date_of_birth) : 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-600">Client Number</label>
                    <p className="font-semibold font-mono">{client.client_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {/* Create new claim */}}
                  >
                    <FileText className="h-4 w-4" />
                    Create New Claim
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {/* Send communication */}}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {/* Schedule appointment */}}
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {/* View analytics */}}
                  >
                    <TrendingUp className="h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Primary Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold">{formatPhone(client.phone || '')}</p>
                      {client.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${client.phone}`}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Secondary Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.secondary_phone || ''}
                      onChange={(e) => handleInputChange('secondary_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold">{formatPhone(client.secondary_phone || 'Not provided')}</p>
                      {client.secondary_phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${client.secondary_phone}`}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email Address</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedClient.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="client@example.com"
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold">{client.email || 'Not provided'}</p>
                      {client.email && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${client.email}`}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Preferred Contact Method</label>
                  {isEditing ? (
                    <select
                      value={editedClient.preferred_contact_method || 'email'}
                      onChange={(e) => handleInputChange('preferred_contact_method', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="text">Text Message</option>
                      <option value="mail">Mail</option>
                    </select>
                  ) : (
                    <p className="font-semibold mt-1 capitalize">{client.preferred_contact_method || 'Email'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Emergency Contact Name</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.emergency_contact_name || ''}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold mt-1">{client.emergency_contact_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Relationship</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.emergency_contact_relationship || ''}
                      onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                      placeholder="Spouse, Parent, etc."
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold mt-1">{client.emergency_contact_relationship || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Emergency Contact Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.emergency_contact_phone || ''}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold">{formatPhone(client.emergency_contact_phone || 'Not provided')}</p>
                      {client.emergency_contact_phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${client.emergency_contact_phone}`}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Communication Preferences</label>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedClient.communication_preferences?.email_notifications || false}
                          onChange={(e) => handleInputChange('communication_preferences', {
                            ...editedClient.communication_preferences,
                            email_notifications: e.target.checked
                          })}
                        />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedClient.communication_preferences?.sms_notifications || false}
                          onChange={(e) => handleInputChange('communication_preferences', {
                            ...editedClient.communication_preferences,
                            sms_notifications: e.target.checked
                          })}
                        />
                        <span className="text-sm">SMS notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedClient.communication_preferences?.marketing_communications || false}
                          onChange={(e) => handleInputChange('communication_preferences', {
                            ...editedClient.communication_preferences,
                            marketing_communications: e.target.checked
                          })}
                        />
                        <span className="text-sm">Marketing communications</span>
                      </label>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        {client.communication_preferences?.email_notifications ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">Email notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {client.communication_preferences?.sms_notifications ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">SMS notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {client.communication_preferences?.marketing_communications ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">Marketing communications</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Mailing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Street Address</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.mailing_address?.street || ''}
                      onChange={(e) => handleAddressChange('mailing_address', 'street', e.target.value)}
                      placeholder="123 Main St"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold mt-1">{client.mailing_address?.street || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">City</label>
                    {isEditing ? (
                      <Input
                        value={editedClient.mailing_address?.city || ''}
                        onChange={(e) => handleAddressChange('mailing_address', 'city', e.target.value)}
                        placeholder="City"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-semibold mt-1">{client.mailing_address?.city || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    {isEditing ? (
                      <Input
                        value={editedClient.mailing_address?.state || ''}
                        onChange={(e) => handleAddressChange('mailing_address', 'state', e.target.value)}
                        placeholder="ST"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-semibold mt-1">{client.mailing_address?.state || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">ZIP Code</label>
                  {isEditing ? (
                    <Input
                      value={editedClient.mailing_address?.zip || ''}
                      onChange={(e) => handleAddressChange('mailing_address', 'zip', e.target.value)}
                      placeholder="12345"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold mt-1">{client.mailing_address?.zip || 'Not provided'}</p>
                  )}
                </div>

                {!isEditing && client.mailing_address?.street && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      const address = `${client.mailing_address.street}, ${client.mailing_address.city}, ${client.mailing_address.state} ${client.mailing_address.zip}`;
                      window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Map
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Physical Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedClient.same_as_mailing || false}
                      onChange={(e) => {
                        handleInputChange('same_as_mailing', e.target.checked);
                        if (e.target.checked) {
                          handleInputChange('physical_address', editedClient.mailing_address);
                        }
                      }}
                      disabled={!isEditing}
                    />
                    <span className="text-sm">Same as mailing address</span>
                  </label>
                </div>

                {!editedClient.same_as_mailing && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Street Address</label>
                      {isEditing ? (
                        <Input
                          value={editedClient.physical_address?.street || ''}
                          onChange={(e) => handleAddressChange('physical_address', 'street', e.target.value)}
                          placeholder="123 Main St"
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-semibold mt-1">{client.physical_address?.street || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">City</label>
                        {isEditing ? (
                          <Input
                            value={editedClient.physical_address?.city || ''}
                            onChange={(e) => handleAddressChange('physical_address', 'city', e.target.value)}
                            placeholder="City"
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold mt-1">{client.physical_address?.city || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">State</label>
                        {isEditing ? (
                          <Input
                            value={editedClient.physical_address?.state || ''}
                            onChange={(e) => handleAddressChange('physical_address', 'state', e.target.value)}
                            placeholder="ST"
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold mt-1">{client.physical_address?.state || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">ZIP Code</label>
                      {isEditing ? (
                        <Input
                          value={editedClient.physical_address?.zip || ''}
                          onChange={(e) => handleAddressChange('physical_address', 'zip', e.target.value)}
                          placeholder="12345"
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-semibold mt-1">{client.physical_address?.zip || 'Not provided'}</p>
                      )}
                    </div>

                    {!isEditing && client.physical_address?.street && (
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                        onClick={() => {
                          const address = `${client.physical_address.street}, ${client.physical_address.city}, ${client.physical_address.state} ${client.physical_address.zip}`;
                          window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Map
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance Details</h3>
                <p className="text-gray-600 mb-4">
                  Insurance information will be populated from claims and policies
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Insurance Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claims History Tab */}
        {activeTab === 'claims' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Claims History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claims Yet</h3>
                <p className="text-gray-600 mb-4">
                  Claims associated with this client will appear here
                </p>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Communication History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Communications Yet</h3>
                <p className="text-gray-600 mb-4">
                  Communication history with this client will appear here
                </p>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                Document Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Paperclip className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-600 mb-4">
                  Documents related to this client will appear here
                </p>
                <Button>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDetailView;