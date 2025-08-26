// src/components/auth/ProtectedRoute.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div> 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])
  
  if (status === 'loading') {
    return <>{fallback}</>
  }
  
  if (!session) {
    return null
  }
  
  return <>{children}</>
}