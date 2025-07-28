import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Switch } from '../../ui/Switch'
import { 
  CheckCircle, 
  FileText, 
  Users, 
  Shield, 
  Home, 
  Building2, 
  DollarSign, 
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Download,
  Send
} from 'lucide-react'

interface IntakeReviewCompletionStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export function IntakeReviewCompletionStep({ data, onUpdate, onComplete }: IntakeReviewCompletionStepProps) {
  const [stepData, setStepData] = useState({
    doThisLater: data.doThisLater || false,
    generateContracts: data.generateContracts || true,
    generateIntakeDocuments: data.generateIntakeDocuments || true,
    notifyClient: data.notifyClient || true,
    createCalendarEvents: data.createCalendarEvents || true,
    assignTasks: data.assignTasks || true,
    reviewComplete: data.reviewComplete || false
  })

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const handleComplete = () => {
    if (!stepData.reviewComplete) {
      alert('Please confirm that you have reviewed all information before completing the intake.')
      return
    }
    
    const completionData = {
      ...stepData,
      completedAt: new Date().toISOString(),
      completedBy: 'Current User', // This would come from auth context
      status: 'completed'
    }
    
    onUpdate(completionData)
    onComplete?.()
  }

  const getSummaryStats = () => {
    const stats = {
      totalFields: 0,
      completedFields: 0,
      sections: [
        { name: 'Client Information', completed: !!(data.firstName || data.businessName) },
        { name: 'Insurer Information', completed: !!data.insurerName },
        { name: 'Policy Information', completed: !!data.effectiveDate },
        { name: 'Loss Information', completed: !!data.lossDate },
        { name: 'Mortgage Lenders', completed: data.mortgageLenders?.length > 0 },
        { name: 'Referral Source', completed: !!data.referralType },
        { name: 'Building Information', completed: !!data.buildingType },
        { name: 'Office Tasks', completed: data.automaticTasks?.length > 0 }
      ]
    }
    
    stats.totalFields = stats.sections.length
    stats.completedFields = stats.sections.filter(s => s.completed).length
    
    return stats
  }

  const stats = getSummaryStats()
  const completionPercentage = Math.round((stats.completedFields / stats.totalFields) * 100)

  return (
    <div className="space-y-6">
      {/* Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Intake Review & Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Progress</span>
              <span className="text-sm text-gray-500">
                {stats.completedFields} of {stats.totalFields} sections complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completionPercentage}% Complete
            </p>
          </div>

          {/* "Do This Later" Option */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Switch
                checked={stepData.doThisLater}
                onChange={(checked) => updateField('doThisLater', checked)}
              />
              <div>
                <h4 className="font-medium text-yellow-800">Do This Later</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Save current progress and complete the remaining sections (Pages 7-11) at a later time.
                  You can return to finish building information, mortgage details, and other optional sections.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Section Completion Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.sections.map((section, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${
                  section.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={`text-sm font-medium ${
                  section.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {section.name}
                </span>
                {section.completed && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Information Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Client Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1 pl-6">
                <p><strong>Type:</strong> {data.clientType === 'individual' ? 'Individual/Residential' : 'Business/Commercial'}</p>
                {data.clientType === 'individual' ? (
                  <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                ) : (
                  <>
                    <p><strong>Business:</strong> {data.businessName}</p>
                    <p><strong>Contact:</strong> {data.pointOfContactFirstName} {data.pointOfContactLastName}</p>
                  </>
                )}
                <p><strong>Email:</strong> {data.primaryEmail}</p>
                <p><strong>Phone:</strong> {data.phoneNumbers?.[0]?.number}</p>
              </div>
            </div>

            {/* Policy Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Policy Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1 pl-6">
                <p><strong>Insurer:</strong> {data.insurerName}</p>
                <p><strong>Effective Date:</strong> {data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : 'Not specified'}</p>
                <p><strong>Policy Type:</strong> {data.policyType}</p>
                <p><strong>Coverage A:</strong> {data.coverageA}</p>
              </div>
            </div>

            {/* Loss Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Loss Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1 pl-6">
                <p><strong>Date:</strong> {data.lossDate ? new Date(data.lossDate).toLocaleDateString() : 'Not specified'}</p>
                <p><strong>Cause:</strong> {data.reasonForLoss}</p>
                <p><strong>Severity:</strong> {data.lossSeverity}</p>
                <p><strong>Weather Related:</strong> {data.isWeatherRelated ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tasks Summary
              </h4>
              <div className="text-sm text-gray-600 space-y-1 pl-6">
                <p><strong>Automatic Tasks:</strong> {data.automaticTasks?.filter((t: any) => t.status !== 'completed').length || 0} active</p>
                <p><strong>Custom Tasks:</strong> {data.customTasks?.length || 0}</p>
                <p><strong>Mortgage Lenders:</strong> {data.mortgageLenders?.length || 0}</p>
                <p><strong>Personnel:</strong> {data.personnel?.length || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Contracts & Intake Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.generateContracts}
              onChange={(checked) => updateField('generateContracts', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Generate Client Contracts</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.generateIntakeDocuments}
              onChange={(checked) => updateField('generateIntakeDocuments', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Generate Intake Documentation</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.notifyClient}
              onChange={(checked) => updateField('notifyClient', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Send Client Notification</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.createCalendarEvents}
              onChange={(checked) => updateField('createCalendarEvents', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Create Calendar Events</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.assignTasks}
              onChange={(checked) => updateField('assignTasks', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Assign Tasks to Team</span>
          </div>
        </CardContent>
      </Card>

      {/* Final Review Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Final Review Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Before Completing:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review all entered information for accuracy</li>
                <li>• Verify client contact details are correct</li>
                <li>• Confirm policy information matches the actual policy</li>
                <li>• Ensure loss details are complete and accurate</li>
                <li>• Check that all required documents will be generated</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.reviewComplete}
                onChange={(checked) => updateField('reviewComplete', checked)}
              />
              <span className="text-sm font-medium text-gray-700">
                I have reviewed all information and confirm it is accurate and complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {stepData.doThisLater ? (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  Progress will be saved. You can complete remaining sections later.
                </span>
              ) : (
                <span>Ready to complete intake and generate documents.</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Save Draft
              </Button>
              
              <Button
                type="button"
                onClick={handleComplete}
                disabled={!stepData.reviewComplete && !stepData.doThisLater}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                {stepData.doThisLater ? 'Save Progress' : 'Complete Intake'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntakeReviewCompletionStep