import { Button } from '@/components/ui/button';
import { Package, Search, ShoppingCart } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'search' | 'cart' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction 
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'products':
        return {
          icon: <Package className="h-12 w-12 text-gray-400" />,
          title: 'No Products Found',
          description: 'There are no products available at the moment.',
          actionLabel: 'Browse Categories'
        };
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: 'No Search Results',
          description: 'We couldn\'t find any products matching your search.',
          actionLabel: 'Clear Search'
        };
      case 'cart':
        return {
          icon: <ShoppingCart className="h-12 w-12 text-gray-400" />,
          title: 'Your Cart is Empty',
          description: 'Add some products to your cart to get started.',
          actionLabel: 'Start Shopping'
        };
      default:
        return {
          icon: <Package className="h-12 w-12 text-gray-400" />,
          title: 'Nothing Here',
          description: 'There\'s nothing to show at the moment.',
          actionLabel: 'Go Back'
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4">
        {defaultContent.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || defaultContent.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {description || defaultContent.description}
      </p>
      {(actionLabel || defaultContent.actionLabel) && (
        <Button onClick={onAction} variant="outline">
          {actionLabel || defaultContent.actionLabel}
        </Button>
      )}
    </div>
  );
}