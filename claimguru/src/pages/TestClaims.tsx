import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SimpleTestWizard } from '../components/claims/SimpleTestWizard'
import { Plus } from 'lucide-react'

export function TestClaims() {
  const [showTestWizard, setShowTestWizard] = useState(false)

  const handleTestWizardComplete = (data: any) => {
    console.log('Test wizard completed with data:', data)
    alert('Test wizard completed successfully!')
    setShowTestWizard(false)
  }

  const handleTestWizardCancel = () => {
    setShowTestWizard(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Claims Page</h1>
        <p className="text-gray-600">
          Testing simplified wizard functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowTestWizard(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Open Test Wizard
          </Button>
        </CardContent>
      </Card>

      {/* Test Wizard */}
      {showTestWizard && (
        <SimpleTestWizard
          onComplete={handleTestWizardComplete}
          onCancel={handleTestWizardCancel}
        />
      )}
    </div>
  )
}