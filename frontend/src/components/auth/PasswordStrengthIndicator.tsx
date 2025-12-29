import { getPasswordStrength } from '@/lib/validations'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export default function PasswordStrengthIndicator({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const { score, feedback, color } = getPasswordStrength(password)
  
  if (!password) return null

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium min-w-fit">
          {feedback}
        </span>
      </div>
      
      <div className="mt-1 text-xs text-gray-500">
        <p>Password must contain:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
            At least 8 characters
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
            One lowercase letter
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
            One uppercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
            One number
          </li>
          <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
            One special character
          </li>
        </ul>
      </div>
    </div>
  )
}