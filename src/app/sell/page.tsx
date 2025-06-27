import ProductCreateForm from '@/components/product/ProductCreateForm'

export default function CreateProductPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          List Your Item
        </h1>
        <p className="text-gray-600">
          Fill out the details below to list your item for sale
        </p>
      </div>
      
      <ProductCreateForm />
    </div>
  )
}