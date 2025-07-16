/**
 * COMPREHENSIVE CLAIM DETAIL VIEW
 * 
 * A complete claim information display component that shows all claim data
 * in an organized, professional format with editing capabilities.
 * 
 * Features:
 * - Complete claim information display
 * - Loss details and circumstances
 * - Financial information and estimates
 * - Document management and photo gallery
 * - Timeline and activity tracking
 * - Vendor and expert assignments
 * - Settlement tracking and history
 * - Communication log
 * - AI insights and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  FileText, 
  Home, 
  Camera, 
  DollarSign, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Save,
  X,
  Eye,
  Download,
  Upload,
  MessageSquare,
  Users,
  TrendingUp,
  Activity,
  Paperclip,
  ExternalLink,
  Brain,
  Target,
  Zap,
  Award,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface ClaimDetailViewProps {
  claim: any;
  client?: any;
  onUpdate?: (updatedClaim: any) => void;
  onClose?: () => void;
  showEditMode?: boolean;
}

export const ClaimDetailView: React.FC<ClaimDetailViewProps> = ({
  claim,
  client,
  onUpdate,
  onClose,
  showEditMode = false
}) => {
  const [isEditing, setIsEditing] = useState(showEditMode);
  const [editedClaim, setEditedClaim] = useState(claim);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedClaim(claim);
  }, [claim]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(editedClaim);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating claim:', error);
      alert('Error updating claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedClaim(claim);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedClaim(prev => ({
      ...prev,
      [field]: value
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

  const getStatusBadge = (status: string) => {
    const config = {
      new: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      in_progress: { color: 'bg-orange-100 text-orange-800', icon: Activity },
      under_review: { color: 'bg-purple-100 text-purple-800', icon: Eye },
      negotiating: { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      settled: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      denied: { color: 'bg-red-100 text-red-800', icon: X }
    };
    return config[status] || config.new;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { color: 'bg-green-100 text-green-800' },
      medium: { color: 'bg-yellow-100 text-yellow-800' },
      high: { color: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'bg-red-100 text-red-800' }
    };
    return config[priority] || config.medium;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'loss-details', label: 'Loss Details', icon: Home },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {claim.file_number || `Claim #${claim.id?.slice(0, 8)}`}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatusBadge(claim.claim_status || 'new').color}>
                    {React.createElement(getStatusBadge(claim.claim_status || 'new').icon, { className: 'h-3 w-3 mr-1' })}
                    {(claim.claim_status || 'new').charAt(0).toUpperCase() + (claim.claim_status || 'new').slice(1).replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityBadge(claim.priority || 'medium').color}>
                    {(claim.priority || 'medium').charAt(0).toUpperCase() + (claim.priority || 'medium').slice(1)} Priority
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {formatDate(claim.created_at)}
                  </span>
                </div>
                {client && (
                  <p className="text-lg text-gray-600 mt-1">
                    {client.client_type === 'business' ? client.business_name : `${client.first_name} ${client.last_name}`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Claim
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Loss</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(claim.estimated_loss_value || 0)}
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
                <p className="text-sm font-medium text-gray-600">Days Open</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(claim.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Settlement Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(claim.settlement_amount || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {claim.documents?.length || 0}
                </p>
              </div>
              <Paperclip className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Claim Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Claim Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">File Number</label>
                      <p className="font-semibold font-mono">{claim.file_number}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Carrier Claim Number</label>
                      <p className="font-semibold">{claim.carrier_claim_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date of Loss</label>
                      <p className="font-semibold">{claim.date_of_loss ? formatDate(claim.date_of_loss) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date Reported</label>
                      <p className="font-semibold">{claim.date_reported ? formatDate(claim.date_reported) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Cause of Loss</label>
                      <p className="font-semibold">{claim.cause_of_loss || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Settlement Status</label>
                      <p className="font-semibold capitalize">{claim.settlement_status || 'Pending'}</p>
                    </div>
                  </div>

                  {claim.loss_description && (
                    <div>
                      <label className="text-sm text-gray-600">Loss Description</label>
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {claim.loss_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {claim.property ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Property Address</label>
                        <p className="font-semibold">
                          {claim.property.address_line_1}
                          {claim.property.address_line_2 && `, ${claim.property.address_line_2}`}
                        </p>
                        <p className="text-gray-600">
                          {claim.property.city}, {claim.property.state} {claim.property.zip_code}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => {
                          const address = `${claim.property.address_line_1}, ${claim.property.city}, ${claim.property.state} ${claim.property.zip_code}`;
                          window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Map
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">Property information not available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Information */}
              {client && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-semibold">
                        {client.client_type === 'business' 
                          ? client.business_name 
                          : `${client.first_name} ${client.last_name}`
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{client.phone}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `tel:${client.phone}`}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{client.email}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${client.email}`}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      View Client Profile
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Documents
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Update
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Claim created</p>
                        <p className="text-xs text-gray-500">{formatDate(claim.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Initial assessment completed</p>
                        <p className="text-xs text-gray-500">System automated</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Awaiting documentation</p>
                        <p className="text-xs text-gray-500">Pending action</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Loss Details Tab */}
        {activeTab === 'loss-details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Loss Details & Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Loss
                      </label>
                      <Input
                        type="date"
                        value={editedClaim.date_of_loss || ''}
                        onChange={(e) => handleInputChange('date_of_loss', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cause of Loss
                      </label>
                      <Input
                        value={editedClaim.cause_of_loss || ''}
                        onChange={(e) => handleInputChange('cause_of_loss', e.target.value)}
                        placeholder="e.g., Wind, Hail, Fire, Water"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loss Description
                    </label>
                    <textarea
                      value={editedClaim.loss_description || ''}
                      onChange={(e) => handleInputChange('loss_description', e.target.value)}
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the circumstances and details of the loss..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Date of Loss</label>
                      <p className="font-semibold text-lg">{claim.date_of_loss ? formatDate(claim.date_of_loss) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Cause of Loss</label>
                      <p className="font-semibold text-lg">{claim.cause_of_loss || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Weather Conditions</label>
                      <p className="font-semibold text-lg">{claim.weather_conditions || 'Not recorded'}</p>
                    </div>
                  </div>

                  {claim.loss_description && (
                    <div>
                      <label className="text-sm text-gray-600">Loss Description</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900 leading-relaxed">{claim.loss_description}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Section */}
                  {claim.ai_analysis && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                      <h4 className="flex items-center gap-2 font-semibold text-purple-900 mb-4">
                        <Brain className="h-5 w-5" />
                        AI Loss Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-purple-800">Severity Assessment:</p>
                          <p className="text-purple-700">{claim.ai_analysis.severity || 'Moderate'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">Estimated Timeline:</p>
                          <p className="text-purple-700">{claim.ai_analysis.timeline || '8-12 weeks'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">Complexity Score:</p>
                          <p className="text-purple-700">{claim.ai_analysis.complexity || '6/10'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">Settlement Probability:</p>
                          <p className="text-purple-700">{claim.ai_analysis.settlement_probability || '85%'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm text-green-600 font-medium">Estimated Loss</label>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(claim.estimated_loss_value || 0)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="text-sm text-blue-600 font-medium">Settlement Amount</label>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(claim.settlement_amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deductible:</span>
                    <span className="font-semibold">{formatCurrency(claim.deductible || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Contract Fee:</span>
                    <span className="font-semibold">
                      {claim.contract_fee_type === 'percentage' 
                        ? `${claim.contract_fee_amount || 0}%`
                        : formatCurrency(claim.contract_fee_amount || 0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expenses:</span>
                    <span className="font-semibold">{formatCurrency(claim.total_expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net to Client:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((claim.settlement_amount || 0) - (claim.total_expenses || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Payment history will appear here once settlements are processed
                  </p>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                Document Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Paperclip className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-600 mb-4">
                  Upload photos, estimates, correspondence, and other claim-related documents
                </p>
                <div className="flex justify-center gap-3">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Claim Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-16 bg-gray-200"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Claim Created</h4>
                        <p className="text-sm text-gray-600">Initial claim intake completed</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(claim.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-16 bg-gray-200"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">AI Analysis Completed</h4>
                        <p className="text-sm text-gray-600">Automated damage assessment and settlement prediction</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(claim.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Awaiting Documentation</h4>
                        <p className="text-sm text-gray-600">Pending additional documents and photos</p>
                      </div>
                      <span className="text-sm text-gray-500">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Assigned Vendors & Experts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vendors Assigned</h3>
                <p className="text-gray-600 mb-4">
                  Assign contractors, adjusters, and other professionals to this claim
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Assign Vendors
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
                Communication Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Communications Yet</h3>
                <p className="text-gray-600 mb-4">
                  All emails, calls, and messages related to this claim will appear here
                </p>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="flex items-center gap-2 font-semibold text-purple-900 mb-3">
                      <Target className="h-4 w-4" />
                      Settlement Prediction
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Predicted Amount:</span>
                        <span className="font-semibold text-purple-900">{formatCurrency(claim.ai_prediction?.settlement || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Confidence:</span>
                        <span className="font-semibold text-purple-900">{claim.ai_prediction?.confidence || '87%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-purple-700">Timeline:</span>
                        <span className="font-semibold text-purple-900">{claim.ai_prediction?.timeline || '8-12 weeks'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
                      <Award className="h-4 w-4" />
                      Risk Assessment
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Complexity:</span>
                        <span className="font-semibold text-blue-900">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Fraud Risk:</span>
                        <span className="font-semibold text-green-900">Low</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Coverage Risk:</span>
                        <span className="font-semibold text-blue-900">Low</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Schedule professional damage assessment within 48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Request additional photos of roof damage for better evaluation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Contact carrier within 24 hours to expedite processing</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetailView;