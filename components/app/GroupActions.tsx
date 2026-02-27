'use client'

import { useState } from 'react'
import { UserPlus, RefreshCw } from 'lucide-react'
import InviteModal from './InviteModal'

interface GroupActionsProps {
  groupId: string
  onMemberAdded?: () => void
}

export default function GroupActions({ groupId, onMemberAdded }: GroupActionsProps) {
  const [showInvite, setShowInvite] = useState(false)

  const handleSuccess = () => {
    onMemberAdded?.()
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => window.location.reload()}
          title="Rafraîchir"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-muted hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <UserPlus size={15} />
          Inviter un proche
        </button>
      </div>

      {showInvite && (
        <InviteModal
          groupId={groupId}
          onClose={() => setShowInvite(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
