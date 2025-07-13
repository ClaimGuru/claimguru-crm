import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { X, Share, Link, Mail, Users, Shield, Calendar, Copy, Check } from 'lucide-react'

interface DocumentShareModalProps {
  document: any
  isOpen: boolean
  onClose: () => void
}

export function DocumentShareModal({ document, isOpen, onClose }: DocumentShareModalProps) {
  const [shareMethod, setShareMethod] = useState<'link' | 'email' | 'internal'>('link')
  const [permissions, setPermissions] = useState<'view' | 'download' | 'edit'>('view')
  const [expirationDays, setExpirationDays] = useState<number>(30)
  const [requireAuth, setRequireAuth] = useState(true)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [message, setMessage] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [generateLink, setGenerateLink] = useState('')

  if (!isOpen) return null

  const handleGenerateLink = () => {
    // Generate secure sharing link
    const link = `https://claimguru.ai/shared/${document.id}?token=${Math.random().toString(36).substring(7)}`
    setGenerateLink(link)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generateLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSendEmail = () => {
    console.log('Sending email to:', emailRecipients)
    // Implement email sharing logic
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Share className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Document</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sharing Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShareMethod('link')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  shareMethod === 'link'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Link className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Share Link</div>
                <div className="text-xs text-gray-600">Generate secure link</div>
              </button>
              
              <button
                onClick={() => setShareMethod('email')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  shareMethod === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Mail className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Send Email</div>
                <div className="text-xs text-gray-600">Email directly</div>
              </button>
              
              <button
                onClick={() => setShareMethod('internal')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  shareMethod === 'internal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Team Access</div>
                <div className="text-xs text-gray-600">Internal sharing</div>
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permission Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'view', label: 'View Only', desc: 'Can view document' },
                { key: 'download', label: 'Download', desc: 'Can view and download' },
                { key: 'edit', label: 'Edit', desc: 'Can view, download, and edit' }
              ].map(perm => (
                <button
                  key={perm.key}
                  onClick={() => setPermissions(perm.key as any)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    permissions === perm.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm">{perm.label}</div>
                  <div className="text-xs text-gray-600">{perm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Security Settings</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration
                </label>
                <select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={0}>Never expires</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireAuth"
                  checked={requireAuth}
                  onChange={(e) => setRequireAuth(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireAuth" className="ml-2 text-sm text-gray-700">
                  Require authentication
                </label>
              </div>
            </div>
          </div>

          {/* Share Link */}
          {shareMethod === 'link' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Secure Share Link
                </label>
                {!generateLink && (
                  <Button size="sm" onClick={handleGenerateLink}>
                    Generate Link
                  </Button>
                )}
              </div>
              
              {generateLink && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generateLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Recipients
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a personal message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Internal Team Sharing */}
          {shareMethod === 'internal' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                This document will be accessible to all team members with appropriate permissions.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Team Access Enabled</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  All active team members can access this document based on their role permissions.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (shareMethod === 'email') {
                  handleSendEmail()
                } else {
                  onClose()
                }
              }}
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              {shareMethod === 'email' ? 'Send Email' : 'Share Document'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
