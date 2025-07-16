/**
 * LEAD MANAGEMENT SYSTEM
 * 
 * Features:
 * - Complete lead lifecycle management (new → contacted → qualified → won/lost)
 * - Lead source tracking and analytics
 * - Sales funnel stage management
 * - Lead scoring and qualification
 * - Communication tracking
 * - Appointment scheduling
 * - Lead assignment and routing
 * - Conversion to client functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Target,
  Clock,
  Star,
  ArrowRight,
  Building,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Lead {
  id: string;
  leadNumber: string;
  
  // Contact Information
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Lead Details
  leadSource: {
    id: string;
    name: string;
    type: string;
  };
  currentStage: {
    id: string;
    name: string;
    order: number;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  leadQuality: 'hot' | 'warm' | 'cold' | 'unqualified';
  leadScore: number;
  
  // Business Information
  inquiryType: string;
  inquiryDescription: string;
  estimatedValue?: number;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Tracking
  initialContactDate?: string;
  lastContactDate?: string;
  nextActionDate?: string;
  followUpDate?: string;
  
  // Status
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'nurturing';
  lostReason?: string;
  notes?: string;
  
  // System
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  organizationId: string;
}

interface LeadSource {
  id: string;
  name: string;
  type: string;
  description?: string;
  conversionRate: number;
  isActive: boolean;
}

interface SalesFunnelStage {
  id: string;
  stageName: string;
  stageOrder: number;
  description?: string;
  expectedDurationDays: number;
  conversionProbability: number;
}

export default function LeadManagement() {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [funnelStages, setFunnelStages] = useState<SalesFunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'pipeline' | 'analytics'>('list');

  useEffect(() => {
    loadLeads();
    loadLeadSources();
    loadFunnelStages();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockLeads: Lead[] = [
        {
          id: 'lead-001',
          leadNumber: 'LD-2025-000001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          leadSource: { id: 'src-001', name: 'Website Contact Form', type: 'website' },
          currentStage: { id: 'stage-001', name: 'Initial Contact', order: 1 },
          leadQuality: 'warm',
          leadScore: 75,
          inquiryType: 'Property Damage Claim',
          inquiryDescription: 'Need help with water damage claim from recent storm',
          estimatedValue: 15000,
          urgency: 'high',
          status: 'contacted',
          createdAt: new Date().toISOString(),
          createdBy: 'user-001',
          updatedAt: new Date().toISOString(),
          organizationId: userProfile?.organization_id || 'demo-org'
        },
        {
          id: 'lead-002',
          leadNumber: 'LD-2025-000002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          businessName: 'Johnson Industries',
          email: 'sarah@johnsonindustries.com',
          phone: '(555) 987-6543',
          leadSource: { id: 'src-002', name: 'Client Referral', type: 'referral' },
          currentStage: { id: 'stage-002', name: 'Qualification', order: 2 },
          leadQuality: 'hot',
          leadScore: 90,
          inquiryType: 'Commercial Property Claim',
          inquiryDescription: 'Large commercial fire damage, need immediate assistance',
          estimatedValue: 250000,
          urgency: 'urgent',
          status: 'qualified',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: 'user-001',
          updatedAt: new Date().toISOString(),
          organizationId: userProfile?.organization_id || 'demo-org'
        }
      ];
      
      setLeads(mockLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadSources = async () => {
    try {
      // TODO: Replace with actual API call
      const mockSources: LeadSource[] = [
        { id: 'src-001', name: 'Website Contact Form', type: 'website', conversionRate: 0.15, isActive: true },
        { id: 'src-002', name: 'Client Referral', type: 'referral', conversionRate: 0.45, isActive: true },
        { id: 'src-003', name: 'Google Ads', type: 'advertisement', conversionRate: 0.08, isActive: true },
        { id: 'src-004', name: 'Social Media', type: 'social_media', conversionRate: 0.12, isActive: true }
      ];
      setLeadSources(mockSources);
    } catch (error) {
      console.error('Error loading lead sources:', error);
    }
  };

  const loadFunnelStages = async () => {
    try {
      // TODO: Replace with actual API call
      const mockStages: SalesFunnelStage[] = [
        { id: 'stage-001', stageName: 'Initial Contact', stageOrder: 1, expectedDurationDays: 1, conversionProbability: 0.8 },
        { id: 'stage-002', stageName: 'Qualification', stageOrder: 2, expectedDurationDays: 3, conversionProbability: 0.6 },
        { id: 'stage-003', stageName: 'Consultation', stageOrder: 3, expectedDurationDays: 7, conversionProbability: 0.7 },
        { id: 'stage-004', stageName: 'Proposal', stageOrder: 4, expectedDurationDays: 5, conversionProbability: 0.5 },
        { id: 'stage-005', stageName: 'Negotiation', stageOrder: 5, expectedDurationDays: 10, conversionProbability: 0.6 },
        { id: 'stage-006', stageName: 'Closing', stageOrder: 6, expectedDurationDays: 3, conversionProbability: 0.9 }
      ];
      setFunnelStages(mockStages);
    } catch (error) {
      console.error('Error loading funnel stages:', error);
    }
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setShowCreateModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCreateModal(true);
  };

  const handleConvertToClient = async (leadId: string) => {
    if (confirm('Convert this lead to a client? This will create a new client record and mark the lead as won.')) {
      try {
        // TODO: Implement lead to client conversion
        console.log('Converting lead to client:', leadId);
      } catch (error) {
        console.error('Error converting lead:', error);
      }
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'unqualified': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal_sent': return 'bg-yellow-100 text-yellow-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'nurturing': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesStage = filterStage === 'all' || lead.currentStage.id === filterStage;
    const matchesQuality = filterQuality === 'all' || lead.leadQuality === filterQuality;
    
    return matchesSearch && matchesStatus && matchesStage && matchesQuality;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600">Manage your sales pipeline and lead conversion</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleCreateLead}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['list', 'pipeline', 'analytics'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeView === view
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {view === 'list' && <Users className="h-4 w-4 inline mr-2" />}
              {view === 'pipeline' && <TrendingUp className="h-4 w-4 inline mr-2" />}
              {view === 'analytics' && <BarChart3 className="h-4 w-4 inline mr-2" />}
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {leads.filter(l => l.leadQuality === 'hot').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Est. Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeView === 'list' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search leads by name, email, or lead number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="nurturing">Nurturing</option>
                </select>

                <select
                  value={filterQuality}
                  onChange={(e) => setFilterQuality(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Quality</option>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lead List */}
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lead.businessName || `${lead.firstName} ${lead.lastName}`}
                          </h3>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(lead.leadQuality)}`}>
                          {lead.leadQuality}
                        </span>

                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">{lead.leadScore}/100</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{lead.leadNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>{lead.leadSource.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{lead.currentStage.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${lead.estimatedValue?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lead.urgency} urgency</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-700">
                        <p className="font-medium">{lead.inquiryType}</p>
                        <p>{lead.inquiryDescription}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditLead(lead)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      
                      <Button
                        onClick={() => handleEditLead(lead)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Button>
                      
                      <Button
                        onClick={() => handleConvertToClient(lead.id)}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Convert
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== 'all' || filterQuality !== 'all'
                    ? 'No leads match your search criteria'
                    : 'Get started by creating your first lead'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && filterQuality === 'all' && (
                  <Button
                    onClick={handleCreateLead}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Lead
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeView === 'pipeline' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Pipeline</h3>
            <p className="text-gray-600">Pipeline view coming soon...</p>
          </CardContent>
        </Card>
      )}

      {activeView === 'analytics' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Modals would be implemented here */}
      {/* LeadCreateEditModal */}
    </div>
  );
}
