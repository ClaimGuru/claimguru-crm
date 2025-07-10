import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Client } from '../lib/supabase'

export function useClients() {
  const { userProfile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClients()
    }
  }, [userProfile?.organization_id])

  async function loadClients() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setClients(data || [])
    } catch (error: any) {
      console.error('Error loading clients:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function createClient(clientData: Partial<Client>) {
    if (!userProfile?.organization_id || !userProfile?.id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const newClient = {
        ...clientData,
        organization_id: userProfile.organization_id,
        created_by: userProfile.id,
        client_type: clientData.client_type || 'individual',
        is_policyholder: clientData.is_policyholder || true,
        country: clientData.country || 'US',
        mailing_same_as_address: clientData.mailing_same_as_address || true
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single()

      if (error) {
        throw error
      }

      setClients(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ))
      return data
    } catch (error: any) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  async function deleteClient(id: string) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        throw error
      }

      setClients(prev => prev.filter(client => client.id !== id))
    } catch (error: any) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: loadClients
  }
}