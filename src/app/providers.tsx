"use client";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from 'sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


export function Providers({ children} : { children: React.ReactNode}){
    return(
        <QueryClientProvider client={queryClient}>
            <Toaster position='top-center' richColors/>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false}/>}
        </QueryClientProvider>
    )
}