import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Users } from 'lucide-react'

interface PersonnelAssignmentStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const PersonnelAssignmentStep: React.FC<PersonnelAssignmentStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Personnel Assignment</span>
          </CardTitle>
          <p className="text-gray-600">
            Assign team members to this claim. AI recommends optimal assignments based on expertise, workload, and claim complexity.
          </p>
        </CardHeader>
      </Card>

      {/* Placeholder Content */}
      <Card>
        <CardContent className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Personnel Assignment Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            Advanced AI-powered team assignment features are being implemented.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div></div>
        <Button onClick={onComplete}>
          Continue to Next Step
        </Button>
      </div>
    </div>
  )
}
