'use client'

import { useAuthStore } from '@/stores/authStore'
// ... other imports

export default function LoginModal({ isOpen, onClose }: ModalProps) {
  const { setShowLoginModal, setShowSignupModal } = useAuthStore()
  
  const switchToSignup = () => {
    setShowLoginModal(false)  // TRIGGER 8
    setShowSignupModal(true)  // TRIGGER 9
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Login form content */}
      
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={switchToSignup}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign up
          </button>
        </span>
      </div>
    </Modal>
  )
}