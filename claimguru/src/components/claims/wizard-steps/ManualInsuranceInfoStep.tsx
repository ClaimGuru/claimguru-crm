import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Shield, DollarSign, Plus, X, Calendar } from 'lucide-react';

interface Coverage {
  id: string;
  type: string;
  limit: number;
}

interface Deductible {
  id: string;
  type: string;
  amount: number;
  isPercentage: boolean;
  percentageOf?: string;
}

interface PriorPayment {
  id: string;
  amount: number;
  date: string;
  description: string;
}

interface ManualInsuranceInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const ManualInsuranceInfoStep: React.FC<ManualInsuranceInfoStepProps> = ({
  data,
  onUpdate
}) => {
  const [insuranceCarrier, setInsuranceCarrier] = useState(data.insuranceCarrier || {});
  const [policyDetails, setPolicyDetails] = useState(data.policyDetails || {});
  const [coverages, setCoverages] = useState<Coverage[]>(data.coverages || []);
  const [deductibles, setDeductibles] = useState<Deductible[]>(data.deductibles || []);
  const [priorPayments, setPriorPayments] = useState<PriorPayment[]>(data.priorPayments || []);
  const [isForcedPlaced, setIsForcedPlaced] = useState(false);

  // Update parent data whenever local state changes
  useEffect(() => {
    onUpdate({
      ...data,
      insuranceCarrier,
      policyDetails,
      coverages,
      deductibles,
      priorPayments
    });
  }, [insuranceCarrier, policyDetails, coverages, deductibles, priorPayments]);

  // Coverage Management
  const addCoverage = () => {
    const newCoverage: Coverage = {
      id: Date.now().toString(),
      type: '',
      limit: 0
    };
    setCoverages([...coverages, newCoverage]);
  };

  const updateCoverage = (id: string, field: keyof Coverage, value: any) => {
    setCoverages(coverages.map(coverage => 
      coverage.id === id ? { ...coverage, [field]: value } : coverage
    ));
  };

  const removeCoverage = (id: string) => {
    setCoverages(coverages.filter(coverage => coverage.id !== id));
  };

  // Deductible Management
  const addDeductible = () => {
    const newDeductible: Deductible = {
      id: Date.now().toString(),
      type: '',
      amount: 0,
      isPercentage: false
    };
    setDeductibles([...deductibles, newDeductible]);
  };

  const updateDeductible = (id: string, field: keyof Deductible, value: any) => {
    setDeductibles(deductibles.map(deductible => 
      deductible.id === id ? { ...deductible, [field]: value } : deductible
    ));
  };

  const removeDeductible = (id: string) => {
    setDeductibles(deductibles.filter(deductible => deductible.id !== id));
  };

  // Prior Payment Management
  const addPriorPayment = () => {
    const newPayment: PriorPayment = {
      id: Date.now().toString(),
      amount: 0,
      date: '',
      description: ''
    };
    setPriorPayments([...priorPayments, newPayment]);
  };

  const updatePriorPayment = (id: string, field: keyof PriorPayment, value: any) => {
    setPriorPayments(priorPayments.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ));
  };

  const removePriorPayment = (id: string) => {
    setPriorPayments(priorPayments.filter(payment => payment.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Insurance Carrier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Carrier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Carrier *</label>
              <select
                value={insuranceCarrier.name || ''}
                onChange={(e) => setInsuranceCarrier({
                  ...insuranceCarrier,
                  name: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select carrier</option>
                <option value="State Farm">State Farm</option>
                <option value="Allstate">Allstate</option>
                <option value="GEICO">GEICO</option>
                <option value="Progressive">Progressive</option>
                <option value="USAA">USAA</option>
                <option value="Farmers">Farmers</option>
                <option value="Liberty Mutual">Liberty Mutual</option>
                <option value="Nationwide">Nationwide</option>
                <option value="American Family">American Family</option>
                <option value="Travelers">Travelers</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Policy Number *</label>
              <Input
                value={policyDetails.policyNumber || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  policyNumber: e.target.value
                })}
                placeholder="Enter policy number"
                required
              />
            </div>
          </div>

          {/* Forced Placed Policy */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isForcedPlaced}
                onChange={(e) => setIsForcedPlaced(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">This is a forced-placed policy</span>
            </label>
          </div>

          {/* Agent Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agent Name</label>
              <Input
                value={insuranceCarrier.agentName || ''}
                onChange={(e) => setInsuranceCarrier({
                  ...insuranceCarrier,
                  agentName: e.target.value
                })}
                placeholder="Agent name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Agent Phone</label>
              <Input
                type="tel"
                value={insuranceCarrier.agentPhone || ''}
                onChange={(e) => setInsuranceCarrier({
                  ...insuranceCarrier,
                  agentPhone: e.target.value
                })}
                placeholder="Agent phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Policy Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Effective Date *</label>
              <Input
                type="date"
                value={policyDetails.effectiveDate || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  effectiveDate: e.target.value
                })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiration Date *</label>
              <Input
                type="date"
                value={policyDetails.expirationDate || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  expirationDate: e.target.value
                })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Policy Type</label>
              <select
                value={policyDetails.policyType || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  policyType: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select type</option>
                <option value="Homeowners">Homeowners</option>
                <option value="Renters">Renters</option>
                <option value="Condo">Condo</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Coverage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coverages.map((coverage) => (
            <div key={coverage.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <select
                  value={coverage.type}
                  onChange={(e) => updateCoverage(coverage.id, 'type', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select coverage type</option>
                  <option value="Dwelling">Dwelling (Coverage A)</option>
                  <option value="Other Structures">Other Structures (Coverage B)</option>
                  <option value="Personal Property">Personal Property (Coverage C)</option>
                  <option value="Loss of Use">Loss of Use (Coverage D)</option>
                  <option value="Personal Liability">Personal Liability</option>
                  <option value="Medical Payments">Medical Payments</option>
                </select>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={coverage.limit || ''}
                  onChange={(e) => updateCoverage(coverage.id, 'limit', parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    // Clear field on first digit input if current value is 0
                    if (coverage.limit === 0 && /\d/.test(e.key)) {
                      updateCoverage(coverage.id, 'limit', '');
                    }
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <Button
                onClick={() => removeCoverage(coverage.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            onClick={addCoverage}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Coverage
          </Button>
        </CardContent>
      </Card>

      {/* Deductibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deductibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deductibles.map((deductible) => (
            <div key={deductible.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <select
                  value={deductible.type}
                  onChange={(e) => updateDeductible(deductible.id, 'type', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select deductible type</option>
                  <option value="All Other Perils">All Other Perils</option>
                  <option value="Wind/Hail">Wind/Hail</option>
                  <option value="Hurricane">Hurricane</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Flood">Flood</option>
                </select>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={deductible.amount || ''}
                  onChange={(e) => updateDeductible(deductible.id, 'amount', parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    // Clear field on first digit input if current value is 0
                    if (deductible.amount === 0 && /\d/.test(e.key)) {
                      updateDeductible(deductible.id, 'amount', '');
                    }
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={deductible.isPercentage}
                    onChange={(e) => updateDeductible(deductible.id, 'isPercentage', e.target.checked)}
                  />
                  <span className="text-sm">%</span>
                </label>
              </div>
              <Button
                onClick={() => removeDeductible(deductible.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            onClick={addDeductible}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Deductible
          </Button>
        </CardContent>
      </Card>

      {/* Prior Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Prior Payments (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {priorPayments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <Input
                  value={payment.description}
                  onChange={(e) => updatePriorPayment(payment.id, 'description', e.target.value)}
                  placeholder="Payment description"
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={payment.amount || ''}
                  onChange={(e) => updatePriorPayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    // Clear field on first digit input if current value is 0
                    if (payment.amount === 0 && /\d/.test(e.key)) {
                      updatePriorPayment(payment.id, 'amount', '');
                    }
                  }}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="w-36">
                <Input
                  type="date"
                  value={payment.date}
                  onChange={(e) => updatePriorPayment(payment.id, 'date', e.target.value)}
                />
              </div>
              <Button
                onClick={() => removePriorPayment(payment.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            onClick={addPriorPayment}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Prior Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};