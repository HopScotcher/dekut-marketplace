import { Metadata } from 'next'
import { Suspense } from 'react'
import RegisterForm from '@/components/auth/RegisterForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Register | Marketplace',
  description: 'Create your marketplace account',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Sign Up
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our marketplace community
          </p>
        </div>
        
        <Card>
          
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <RegisterForm />
            </Suspense>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/signin" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}