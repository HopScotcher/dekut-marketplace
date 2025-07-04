import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
}