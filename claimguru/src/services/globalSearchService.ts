import { supabase } from '../lib/supabase'
import type { Claim, Client, Document } from '../lib/supabase'

export interface SearchResult {
  id: string
  type: 'claim' | 'client' | 'document'
  title: string
  subtitle: string
  description?: string
  url: string
  score?: number
  data: any
}

export interface SearchFilters {
  type?: string
  status?: string
  date_from?: string
  date_to?: string
  [key: string]: any
}

export interface SearchOptions {
  limit?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

class GlobalSearchService {
  private async searchClaims(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('claims')
        .select(`
          id,
          file_number,
          carrier_claim_number,
          cause_of_loss,
          loss_description,
          claim_status,
          date_of_loss,
          estimated_loss_value,
          created_at,
          clients!inner(
            id,
            first_name,
            last_name,
            business_name,
            client_type
          )
        `)

      // Apply text search across relevant fields
      if (query) {
        queryBuilder = queryBuilder.or(`
          file_number.ilike.%${query}%,
          carrier_claim_number.ilike.%${query}%,
          cause_of_loss.ilike.%${query}%,
          loss_description.ilike.%${query}%
        `)
      }

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        queryBuilder = queryBuilder.eq('claim_status', filters.status)
      }

      if (filters.date_from) {
        queryBuilder = queryBuilder.gte('date_of_loss', filters.date_from)
      }

      if (filters.date_to) {
        queryBuilder = queryBuilder.lte('date_of_loss', filters.date_to)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const sortDirection = options.sortDirection || 'desc'
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortDirection === 'asc' })

      // Apply limit
      const limit = options.limit || 10
      queryBuilder = queryBuilder.limit(limit)

      const { data: claims, error } = await queryBuilder

      if (error) {
        console.error('Error searching claims:', error)
        return []
      }

      return (claims || []).map((claim: any) => {
        const client = claim.clients
        const clientName = client?.client_type === 'business' 
          ? client.business_name 
          : `${client?.first_name || ''} ${client?.last_name || ''}`.trim()
        
        return {
          id: claim.id,
          type: 'claim' as const,
          title: claim.file_number || `Claim #${claim.id.slice(0, 8)}`,
          subtitle: `${claim.cause_of_loss || 'General Loss'} • ${clientName}`,
          description: claim.loss_description,
          url: `/claims?id=${claim.id}`,
          data: claim
        }
      })
    } catch (error) {
      console.error('Error in searchClaims:', error)
      return []
    }
  }

  private async searchClients(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('clients')
        .select(`
          id,
          client_type,
          first_name,
          last_name,
          business_name,
          primary_email,
          primary_phone,
          city,
          state,
          client_status,
          created_at
        `)

      // Apply text search across relevant fields
      if (query) {
        queryBuilder = queryBuilder.or(`
          first_name.ilike.%${query}%,
          last_name.ilike.%${query}%,
          business_name.ilike.%${query}%,
          primary_email.ilike.%${query}%,
          primary_phone.ilike.%${query}%
        `)
      }

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        queryBuilder = queryBuilder.eq('client_status', filters.status)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const sortDirection = options.sortDirection || 'desc'
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortDirection === 'asc' })

      // Apply limit
      const limit = options.limit || 10
      queryBuilder = queryBuilder.limit(limit)

      const { data: clients, error } = await queryBuilder

      if (error) {
        console.error('Error searching clients:', error)
        return []
      }

      return (clients || []).map((client: any) => {
        const name = client.client_type === 'business' 
          ? client.business_name 
          : `${client.first_name || ''} ${client.last_name || ''}`.trim()
        
        const location = [client.city, client.state].filter(Boolean).join(', ')
        const contact = client.primary_email || client.primary_phone || ''
        
        return {
          id: client.id,
          type: 'client' as const,
          title: name,
          subtitle: `${client.client_type === 'business' ? 'Business' : 'Individual'} Client${location ? ` • ${location}` : ''}`,
          description: contact,
          url: `/clients?id=${client.id}`,
          data: client
        }
      })
    } catch (error) {
      console.error('Error in searchClients:', error)
      return []
    }
  }

  private async searchDocuments(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('documents')
        .select(`
          id,
          file_name,
          document_type,
          document_category,
          description,
          ai_extracted_text,
          ai_summary,
          claim_id,
          client_id,
          created_at,
          file_size,
          mime_type
        `)

      // Apply text search across relevant fields
      if (query) {
        queryBuilder = queryBuilder.or(`
          file_name.ilike.%${query}%,
          document_type.ilike.%${query}%,
          description.ilike.%${query}%,
          ai_extracted_text.ilike.%${query}%,
          ai_summary.ilike.%${query}%
        `)
      }

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        queryBuilder = queryBuilder.eq('document_type', filters.type)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at'
      const sortDirection = options.sortDirection || 'desc'
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortDirection === 'asc' })

      // Apply limit
      const limit = options.limit || 10
      queryBuilder = queryBuilder.limit(limit)

      const { data: documents, error } = await queryBuilder

      if (error) {
        console.error('Error searching documents:', error)
        return []
      }

      return (documents || []).map((doc: any) => {
        const fileSize = doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''
        const category = doc.document_category || doc.document_type
        
        return {
          id: doc.id,
          type: 'document' as const,
          title: doc.file_name,
          subtitle: `${category}${fileSize ? ` • ${fileSize}` : ''}`,
          description: doc.description || doc.ai_summary || 'Document',
          url: `/documents?id=${doc.id}`,
          data: doc
        }
      })
    } catch (error) {
      console.error('Error in searchDocuments:', error)
      return []
    }
  }

  public async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // If no query provided, return empty results
      if (!query.trim()) {
        return []
      }

      const searchPromises: Promise<SearchResult[]>[] = []
      
      // Determine which types to search based on filters
      const searchTypes = filters.type && filters.type !== 'all' 
        ? [filters.type] 
        : ['claims', 'clients', 'documents']

      // Execute searches in parallel
      if (searchTypes.includes('claims')) {
        searchPromises.push(this.searchClaims(query, filters, { ...options, limit: Math.ceil((options.limit || 10) / searchTypes.length) }))
      }
      
      if (searchTypes.includes('clients')) {
        searchPromises.push(this.searchClients(query, filters, { ...options, limit: Math.ceil((options.limit || 10) / searchTypes.length) }))
      }
      
      if (searchTypes.includes('documents')) {
        searchPromises.push(this.searchDocuments(query, filters, { ...options, limit: Math.ceil((options.limit || 10) / searchTypes.length) }))
      }

      const results = await Promise.all(searchPromises)
      
      // Combine and flatten results
      const combinedResults = results.flat()
      
      // Sort by relevance (for now, just by creation date)
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.data.created_at || 0)
        const dateB = new Date(b.data.created_at || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      // Apply final limit
      return combinedResults.slice(0, options.limit || 10)
      
    } catch (error) {
      console.error('Error in global search:', error)
      return []
    }
  }

  public async searchByType(
    type: 'claims' | 'clients' | 'documents',
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    switch (type) {
      case 'claims':
        return this.searchClaims(query, filters, options)
      case 'clients':
        return this.searchClients(query, filters, options)
      case 'documents':
        return this.searchDocuments(query, filters, options)
      default:
        return []
    }
  }

  // Get recent activity across all entities
  public async getRecentActivity(limit: number = 5): Promise<SearchResult[]> {
    try {
      const promises = [
        this.searchClaims('', {}, { limit: Math.ceil(limit / 3), sortBy: 'updated_at' }),
        this.searchClients('', {}, { limit: Math.ceil(limit / 3), sortBy: 'updated_at' }),
        this.searchDocuments('', {}, { limit: Math.ceil(limit / 3), sortBy: 'updated_at' })
      ]

      const results = await Promise.all(promises)
      const combined = results.flat()
      
      // Sort by updated_at or created_at
      combined.sort((a, b) => {
        const dateA = new Date(a.data.updated_at || a.data.created_at || 0)
        const dateB = new Date(b.data.updated_at || b.data.created_at || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      return combined.slice(0, limit)
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }
}

export const globalSearchService = new GlobalSearchService()
export default globalSearchService
