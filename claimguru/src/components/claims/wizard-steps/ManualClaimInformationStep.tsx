import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { 
  FileText, 
  Calendar, 
  Home,
  Camera,
  DollarSign,
  MapPin
} from 'lucide-react';

interface ManualClaimInformationStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ManualClaimInformationStep({ data, onUpdate }: ManualClaimInformationStepProps) {
  const [lossDetails, setLossDetails] = useState({
    reasonForLoss: data.lossDetails?.reasonForLoss || '',
    dateOfLoss: data.lossDetails?.dateOfLoss || '',
    timeOfLoss: data.lossDetails?.timeOfLoss || '',
    causeOfLoss: data.lossDetails?.causeOfLoss || '',
    severity: data.lossDetails?.severity || '',
    lossDescription: data.lossDetails?.lossDescription || '',

    isFEMA: data.lossDetails?.isFEMA || false,
    isHabitable: data.lossDetails?.isHabitable || true,
    alternativeLiving: data.lossDetails?.alternativeLiving || '',
    monthlyLivingCost: data.lossDetails?.monthlyLivingCost || '',
    stateOfEmergency: data.lossDetails?.stateOfEmergency || false,
    personalPropertyDamage: data.lossDetails?.personalPropertyDamage || false,
    otherStructuresDamage: data.lossDetails?.otherStructuresDamage || false,
    estimatedDamages: data.lossDetails?.estimatedDamages || '',
    lossLocation: data.lossDetails?.lossLocation || '',
    weatherConditions: data.lossDetails?.weatherConditions || '',
    policeCalled: data.lossDetails?.policeCalled || false,
    policeReportNumber: data.lossDetails?.policeReportNumber || '',
    emergencyMitigationRequired: data.lossDetails?.emergencyMitigationRequired || false,
    mitigationDescription: data.lossDetails?.mitigationDescription || ''
  });

  const handleInputChange = (field: string, value: any) => {
    const updatedLossDetails = { ...lossDetails, [field]: value };
    setLossDetails(updatedLossDetails);
    
    // Update parent component immediately when data changes
    onUpdate({
      ...data,
      lossDetails: updatedLossDetails,
      personalPropertyDamage: updatedLossDetails.personalPropertyDamage,
      otherStructuresDamage: updatedLossDetails.otherStructuresDamage
    });
  };

  const reasonOptions = [
    'New Claim',
    'Supplement',
    'Denial Review',
    'Appraisal',
    'Loss Consulting',
    'Expert Witness',
    'Re-inspection'
  ];

  const causeOfLossOptions = [
    'Wind',
    'Hail',
    'Water Damage',
    'Fire',
    'Lightning',
    'Theft',
    'Vandalism',
    'Tornado',
    'Hurricane',
    'Flood',
    'Earthquake',
    'Frozen Pipes',
    'Sewer Backup',
    'Other'
  ];

  const severityOptions = [
    'Minor',
    'Moderate', 
    'Major',
    'Total Loss'
  ];

  return (
    <div className="space-y-6">
      {/* Loss Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Loss Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Reason for Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Loss *
              </label>
              <select
                value={lossDetails.reasonForLoss}
                onChange={(e) => handleInputChange('reasonForLoss', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select reason</option>
                {reasonOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Date of Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Loss *
              </label>
              <Input
                type="date"
                value={lossDetails.dateOfLoss}
                onChange={(e) => handleInputChange('dateOfLoss', e.target.value)}
                required
              />
            </div>

            {/* Time of Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Loss
              </label>
              <Input
                type="time"
                value={lossDetails.timeOfLoss}
                onChange={(e) => handleInputChange('timeOfLoss', e.target.value)}
              />
            </div>

            {/* Cause of Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause of Loss *
              </label>
              <select
                value={lossDetails.causeOfLoss}
                onChange={(e) => handleInputChange('causeOfLoss', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select cause</option>
                {causeOfLossOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Severity
              </label>
              <select
                value={lossDetails.severity}
                onChange={(e) => handleInputChange('severity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select severity</option>
                {severityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>


          </div>

          {/* Loss Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loss Description *
            </label>
            <textarea
              value={lossDetails.lossDescription}
              onChange={(e) => handleInputChange('lossDescription', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Please provide a detailed description of the loss/damage..."
              required
            />
          </div>

          {/* Additional Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Damages ($)
              </label>
              <Input
                type="number"
                value={lossDetails.estimatedDamages}
                onChange={(e) => handleInputChange('estimatedDamages', e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  // Clear field on first digit input if current value is 0
                  if (lossDetails.estimatedDamages === '0' && /\d/.test(e.key)) {
                    handleInputChange('estimatedDamages', '');
                  }
                }}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loss Location
              </label>
              <Input
                type="text"
                value={lossDetails.lossLocation}
                onChange={(e) => handleInputChange('lossLocation', e.target.value)}
                placeholder="e.g., Kitchen, Living Room, Roof"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weather Conditions
              </label>
              <Input
                type="text"
                value={lossDetails.weatherConditions}
                onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                placeholder="Weather at time of loss"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police Report Number
              </label>
              <Input
                type="text"
                value={lossDetails.policeReportNumber}
                onChange={(e) => handleInputChange('policeReportNumber', e.target.value)}
                placeholder="Enter report number if applicable"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Home className="h-6 w-6 text-green-600" />
            Property Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Checkboxes for various conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.isFEMA}
                onChange={(e) => handleInputChange('isFEMA', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">FEMA Declared Disaster</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.stateOfEmergency}
                onChange={(e) => handleInputChange('stateOfEmergency', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">State of Emergency Declared</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.policeCalled}
                onChange={(e) => handleInputChange('policeCalled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Police Called</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.emergencyMitigationRequired}
                onChange={(e) => handleInputChange('emergencyMitigationRequired', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Emergency Mitigation Required</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!lossDetails.isHabitable}
                onChange={(e) => handleInputChange('isHabitable', !e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Property Uninhabitable</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.personalPropertyDamage}
                onChange={(e) => handleInputChange('personalPropertyDamage', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Personal Property Damage</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lossDetails.otherStructuresDamage}
                onChange={(e) => handleInputChange('otherStructuresDamage', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Other Structures Damage</span>
            </label>
          </div>

          {/* Alternative Living Arrangements */}
          {!lossDetails.isHabitable && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Alternative Living Arrangements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Living Situation
                  </label>
                  <Input
                    type="text"
                    value={lossDetails.alternativeLiving}
                    onChange={(e) => handleInputChange('alternativeLiving', e.target.value)}
                    placeholder="e.g., Hotel, Relative's house"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Living Cost ($)
                  </label>
                  <Input
                    type="number"
                    value={lossDetails.monthlyLivingCost}
                    onChange={(e) => handleInputChange('monthlyLivingCost', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      // Clear field on first digit input if current value is 0
                      if (lossDetails.monthlyLivingCost === '0' && /\d/.test(e.key)) {
                        handleInputChange('monthlyLivingCost', '');
                      }
                    }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Mitigation Description */}
          {lossDetails.emergencyMitigationRequired && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mitigation Description
              </label>
              <textarea
                value={lossDetails.mitigationDescription}
                onChange={(e) => handleInputChange('mitigationDescription', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe emergency mitigation measures taken or needed..."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}