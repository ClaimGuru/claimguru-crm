import React from 'react'
import { Button } from '../ui/Button'
import { FileText, Plus } from 'lucide-react'

interface ClientCreateClaimButtonProps {
  client: any
  onCreateClaim: (client: any) => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ClientCreateClaimButton({ 
  client, 
  onCreateClaim, 
  variant = 'outline',
  size = 'sm',
  className = ''
}: ClientCreateClaimButtonProps) {
  const clientName = client.client_type === 'residential' 
    ? `${client.first_name} ${client.last_name}`.trim()
    : client.business_name

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => onCreateClaim(client)}
      className={`flex items-center gap-1 ${className}`}
      title={`Create new claim for ${clientName}`}
    >
      <FileText className="h-4 w-4" />
      <Plus className="h-3 w-3" />
      New Claim
    </Button>
  )
}
