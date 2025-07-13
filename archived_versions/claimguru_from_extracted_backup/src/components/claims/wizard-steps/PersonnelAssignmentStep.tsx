import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  Users, 
  Brain, 
  Star, 
  Clock, 
  Award, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  UserCheck,
  Briefcase,
  Calendar,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react'
import { enhancedClaimWizardAI } from '../../../services/enhancedClaimWizardAI'

interface TeamMember {
  id: string
  name: string
  role: 'adjuster' | 'manager' | 'inspector' | 'attorney' | 'specialist' | 'coordinator'
  email: string
  phone?: string
  expertise: string[]
  workloadCapacity: number
  currentWorkload: number
  averageClaimValue: number
  successRate: number
  yearsExperience: number
  certifications: string[]
  territoryExpertise: string[]
  languageSkills: string[]
  isAvailable: boolean
  hourlyRate?: number
}

interface Assignment {
  memberId: string
  role: 'primary' | 'secondary' | 'consultant' | 'reviewer'
  responsibilities: string[]
  estimatedHours: number
  startDate: string
  priority: 'low' | 'medium' | 'high'
  notificationPreferences: {
    email: boolean
    sms: boolean
    inApp: boolean
  }
}

interface AIRecommendation {
  memberId: string
  member: TeamMember
  score: number
  reasoning: string[]
  estimatedCompletionTime: string
  riskFactors: string[]
  advantages: string[]
  recommendedRole: 'primary' | 'secondary' | 'consultant'
}

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
  const [assignments, setAssignments] = useState<Assignment[]>(
    data.personnelAssignments || []
  )
  const [availableTeam, setAvailableTeam] = useState<TeamMember[]>([
    // Demo team members - in production this would come from API
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'adjuster',
      email: 'sarah.johnson@claimguru.com',
      phone: '(555) 123-4567',
      expertise: ['Water Damage', 'Fire Claims', 'Commercial Property'],
      workloadCapacity: 100,
      currentWorkload: 75,
      averageClaimValue: 125000,
      successRate: 95,
      yearsExperience: 8,
      certifications: ['CPCU', 'AIC'],
      territoryExpertise: ['Texas', 'Louisiana'],
      languageSkills: ['English', 'Spanish'],
      isAvailable: true,
      hourlyRate: 85
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'manager',
      email: 'michael.chen@claimguru.com',
      phone: '(555) 234-5678',
      expertise: ['Large Loss', 'Complex Claims', 'Litigation Management'],
      workloadCapacity: 100,
      currentWorkload: 60,
      averageClaimValue: 350000,
      successRate: 98,
      yearsExperience: 12,
      certifications: ['CPCU', 'ARM', 'JD'],
      territoryExpertise: ['Texas', 'Oklahoma', 'Arkansas'],
      languageSkills: ['English', 'Mandarin'],
      isAvailable: true,
      hourlyRate: 125
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'inspector',
      email: 'emily.rodriguez@claimguru.com',
      phone: '(555) 345-6789',
      expertise: ['Property Inspection', 'Damage Assessment', 'Forensic Investigation'],
      workloadCapacity: 100,
      currentWorkload: 45,
      averageClaimValue: 85000,
      successRate: 92,
      yearsExperience: 6,
      certifications: ['AIC', 'HAAG Certified'],
      territoryExpertise: ['Texas', 'New Mexico'],
      languageSkills: ['English', 'Spanish'],
      isAvailable: true,
      hourlyRate: 75
    }
  ])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    onUpdate({
      ...data,
      personnelAssignments: assignments
    })
  }, [assignments, data, onUpdate])

  const generateAIRecommendations = async () => {
    setIsGeneratingRecommendations(true)
    try {
      const aiRecommendations = await enhancedClaimWizardAI.generatePersonnelRecommendations({
        claimData: data,
        availableTeam,
        organizationPolicies: data.organizationPolicies,
        currentWorkloads: availableTeam.map(member => ({
          memberId: member.id,
          currentLoad: member.currentWorkload,
          capacity: member.workloadCapacity
        }))
      })
      
      setRecommendations(aiRecommendations)
      setShowRecommendations(true)
    } catch (error) {
      console.error('Failed to generate personnel recommendations:', error)
      // Generate mock recommendations for demo
      const mockRecommendations: AIRecommendation[] = availableTeam
        .filter(member => member.isAvailable)
        .map(member => ({
          memberId: member.id,
          member,
          score: Math.floor(Math.random() * 30) + 70, // 70-100 score
          reasoning: [
            `${member.expertise.length} relevant expertise areas`,
            `${100 - member.currentWorkload}% available capacity`,
            `${member.successRate}% historical success rate`,
            `${member.yearsExperience} years experience in field`
          ],
          estimatedCompletionTime: `${Math.floor(Math.random() * 10) + 15} days`,
          riskFactors: member.currentWorkload > 80 ? ['High current workload'] : [],
          advantages: [
            ...member.expertise.slice(0, 2),
            `${member.successRate}% success rate`,
            `Located in claim territory`
          ],
          recommendedRole: (member.role === 'manager' ? 'consultant' : 
                          member.currentWorkload < 50 ? 'primary' : 'secondary') as 'primary' | 'secondary' | 'consultant'
        }))
        .sort((a, b) => b.score - a.score)
      
      setRecommendations(mockRecommendations)
      setShowRecommendations(true)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const assignMember = (recommendation: AIRecommendation, role: 'primary' | 'secondary' | 'consultant' = 'primary') => {
    const newAssignment: Assignment = {
      memberId: recommendation.memberId,
      role,
      responsibilities: getDefaultResponsibilities(role),
      estimatedHours: role === 'primary' ? 40 : role === 'secondary' ? 20 : 10,
      startDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      notificationPreferences: {
        email: true,
        sms: false,
        inApp: true
      }
    }

    setAssignments(prev => [...prev, newAssignment])
    
    // Update team member workload
    setAvailableTeam(prev => prev.map(member => 
      member.id === recommendation.memberId
        ? { ...member, currentWorkload: member.currentWorkload + (newAssignment.estimatedHours / 8) * 10 }
        : member
    ))
  }

  const getDefaultResponsibilities = (role: string): string[] => {
    switch (role) {
      case 'primary':
        return [
          'Lead claim investigation',
          'Client communication',
          'Damage assessment coordination',
          'Settlement negotiation',
          'Final reporting'
        ]
      case 'secondary':
        return [
          'Assist with documentation',
          'Support field inspections',
          'Research and analysis',
          'Administrative tasks'
        ]
      case 'consultant':
        return [
          'Expert review and guidance',
          'Strategic recommendations',
          'Quality assurance',
          'Escalation handling'
        ]
      default:
        return []
    }
  }

  const removeAssignment = (memberId: string) => {
    const assignment = assignments.find(a => a.memberId === memberId)
    if (assignment) {
      setAssignments(prev => prev.filter(a => a.memberId !== memberId))
      
      // Update team member workload
      setAvailableTeam(prev => prev.map(member => 
        member.id === memberId
          ? { ...member, currentWorkload: member.currentWorkload - (assignment.estimatedHours / 8) * 10 }
          : member
      ))
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'adjuster': return User
      case 'manager': return Shield
      case 'inspector': return Target
      case 'attorney': return Briefcase
      case 'specialist': return Star
      default: return User
    }
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600 bg-red-100'
    if (workload >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

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

      {/* Current Assignments */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const member = availableTeam.find(m => m.id === assignment.memberId)
                if (!member) return null
                const RoleIcon = getRoleIcon(member.role)
                
                return (
                  <div key={assignment.memberId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <RoleIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role} • {assignment.role}</p>
                        <p className="text-xs text-gray-500">{assignment.estimatedHours} hours estimated</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAssignment(assignment.memberId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Personnel Recommendations
            </span>
            <Button
              onClick={generateAIRecommendations}
              disabled={isGeneratingRecommendations}
              className="flex items-center gap-2"
            >
              {isGeneratingRecommendations ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Generate Recommendations
            </Button>
          </CardTitle>
        </CardHeader>
        {showRecommendations && (
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const RoleIcon = getRoleIcon(rec.member.role)
                const isAssigned = assignments.some(a => a.memberId === rec.memberId)
                
                return (
                  <div key={rec.memberId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <RoleIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            {rec.member.name}
                            <span className="text-sm font-normal text-gray-500">
                              ({rec.member.role})
                            </span>
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {rec.score}/100 match
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getWorkloadColor(rec.member.currentWorkload)}`}>
                              {rec.member.currentWorkload}% workload
                            </span>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {rec.estimatedCompletionTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!isAssigned && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => assignMember(rec, 'primary')}
                              className="text-xs"
                            >
                              Assign Primary
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => assignMember(rec, 'secondary')}
                              className="text-xs"
                            >
                              Assign Secondary
                            </Button>
                          </>
                        )}
                        {isAssigned && (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-1">Advantages</h5>
                        <ul className="space-y-1">
                          {rec.advantages.map((advantage, idx) => (
                            <li key={idx} className="text-green-700 flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-800 mb-1">AI Reasoning</h5>
                        <ul className="space-y-1">
                          {rec.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-gray-600 flex items-start gap-1">
                              <BarChart3 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {rec.riskFactors.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <h5 className="font-medium text-yellow-800 mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Risk Factors
                        </h5>
                        <ul className="text-sm text-yellow-700">
                          {rec.riskFactors.map((risk, idx) => (
                            <li key={idx}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        )}
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
