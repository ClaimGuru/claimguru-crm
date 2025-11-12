/**
 * Invoice PDF Generation Service
 * Creates professional PDF invoices using jsPDF
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../lib/supabase'

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  claimNumber?: string
  
  // From (Your Company)
  from: {
    companyName: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email: string
    logo?: string
  }
  
  // To (Client)
  to: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  
  // Invoice Items
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  
  // Totals
  subtotal: number
  tax?: number
  taxRate?: number
  total: number
  
  // Additional
  notes?: string
  terms?: string
}

class InvoiceService {
  private static instance: InvoiceService

  private constructor() {}

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService()
    }
    return InvoiceService.instance
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(data: InvoiceData): Promise<Blob> {
    const doc = new jsPDF()
    
    // Set font
    doc.setFont('helvetica')
    
    // Header - Company Logo and Info
    let yPos = 20
    
    // Company Name (Large)
    doc.setFontSize(24)
    doc.setTextColor(30, 64, 175) // Blue
    doc.text(data.from.companyName, 20, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(data.from.address, 20, yPos)
    yPos += 5
    doc.text(`${data.from.city}, ${data.from.state} ${data.from.zip}`, 20, yPos)
    yPos += 5
    doc.text(`Phone: ${data.from.phone}`, 20, yPos)
    yPos += 5
    doc.text(`Email: ${data.from.email}`, 20, yPos)
    
    // Invoice Title
    doc.setFontSize(28)
    doc.setTextColor(0, 0, 0)
    doc.text('INVOICE', 150, 30)
    
    // Invoice Details (Right Side)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Invoice #: ${data.invoiceNumber}`, 150, 40)
    doc.text(`Date: ${data.invoiceDate}`, 150, 45)
    doc.text(`Due Date: ${data.dueDate}`, 150, 50)
    if (data.claimNumber) {
      doc.text(`Claim #: ${data.claimNumber}`, 150, 55)
    }
    
    // Bill To Section
    yPos = 70
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Bill To:', 20, yPos)
    
    yPos += 7
    doc.setFontSize(11)
    doc.text(data.to.name, 20, yPos)
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(data.to.address, 20, yPos)
    yPos += 5
    doc.text(`${data.to.city}, ${data.to.state} ${data.to.zip}`, 20, yPos)
    
    // Items Table
    yPos += 15
    
    const tableData = data.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.rate.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    })
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    // Totals Section (Right Aligned)
    const rightX = 150
    let totalsY = finalY
    
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    
    // Subtotal
    doc.text('Subtotal:', rightX, totalsY, { align: 'right' })
    doc.text(`$${data.subtotal.toFixed(2)}`, rightX + 40, totalsY, { align: 'right' })
    
    // Tax (if applicable)
    if (data.tax && data.tax > 0) {
      totalsY += 7
      doc.text(`Tax (${data.taxRate}%):`, rightX, totalsY, { align: 'right' })
      doc.text(`$${data.tax.toFixed(2)}`, rightX + 40, totalsY, { align: 'right' })
    }
    
    // Total (Bold and larger)
    totalsY += 10
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Total:', rightX, totalsY, { align: 'right' })
    doc.text(`$${data.total.toFixed(2)}`, rightX + 40, totalsY, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    
    // Notes Section
    if (data.notes) {
      totalsY += 20
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Notes:', 20, totalsY)
      totalsY += 7
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      
      // Wrap text
      const splitNotes = doc.splitTextToSize(data.notes, 170)
      doc.text(splitNotes, 20, totalsY)
      totalsY += (splitNotes.length * 5)
    }
    
    // Terms Section
    if (data.terms) {
      totalsY += 10
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Payment Terms:', 20, totalsY)
      totalsY += 7
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      
      const splitTerms = doc.splitTextToSize(data.terms, 170)
      doc.text(splitTerms, 20, totalsY)
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text(
      'Thank you for your business!',
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 15,
      { align: 'center' }
    )
    
    // Return PDF as Blob
    return doc.output('blob')
  }

  /**
   * Save invoice to database
   */
  async saveInvoice(invoiceData: InvoiceData, organizationId: string, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          organization_id: organizationId,
          invoice_number: invoiceData.invoiceNumber,
          invoice_date: invoiceData.invoiceDate,
          due_date: invoiceData.dueDate,
          claim_number: invoiceData.claimNumber,
          client_name: invoiceData.to.name,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax || 0,
          tax_rate: invoiceData.taxRate || 0,
          total: invoiceData.total,
          notes: invoiceData.notes,
          terms: invoiceData.terms,
          status: 'draft',
          created_by: userId,
          invoice_data: invoiceData // Store full data as JSONB
        })
        .select('id')
        .single()

      if (error) throw error

      return data.id
    } catch (error: any) {
      console.error('Error saving invoice:', error)
      throw error
    }
  }

  /**
   * Generate and download invoice
   */
  async downloadInvoice(invoiceData: InvoiceData): Promise<void> {
    const blob = await this.generateInvoicePDF(invoiceData)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceData.invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Generate invoice from claim data
   */
  async generateFromClaim(claimId: string, organizationId: string): Promise<InvoiceData> {
    try {
      // Fetch claim details
      const { data: claim, error } = await supabase
        .from('claims')
        .select(`
          *,
          clients(*),
          organizations(*)
        `)
        .eq('id', claimId)
        .eq('organization_id', organizationId)
        .single()

      if (error) throw error

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`
      const today = new Date().toISOString().split('T')[0]
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)

      // Build invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: today,
        dueDate: dueDate.toISOString().split('T')[0],
        claimNumber: claim.claim_number || claim.file_number,
        
        from: {
          companyName: claim.organizations.name,
          address: claim.organizations.address_line_1 || '',
          city: claim.organizations.city || '',
          state: claim.organizations.state || '',
          zip: claim.organizations.zip_code || '',
          phone: claim.organizations.phone || '',
          email: claim.organizations.email || ''
        },
        
        to: {
          name: claim.clients.business_name || 
                `${claim.clients.first_name} ${claim.clients.last_name}`,
          address: claim.clients.address_line_1 || '',
          city: claim.clients.city || '',
          state: claim.clients.state || '',
          zip: claim.clients.zip_code || ''
        },
        
        items: [
          {
            description: `Insurance Claim Services - ${claim.claim_type}`,
            quantity: 1,
            rate: claim.estimated_value || 0,
            amount: claim.estimated_value || 0
          }
        ],
        
        subtotal: claim.estimated_value || 0,
        tax: 0,
        taxRate: 0,
        total: claim.estimated_value || 0,
        
        notes: 'Thank you for choosing our services.',
        terms: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.'
      }

      return invoiceData
    } catch (error: any) {
      console.error('Error generating invoice from claim:', error)
      throw error
    }
  }
}

export const invoiceService = InvoiceService.getInstance()
export default invoiceService
