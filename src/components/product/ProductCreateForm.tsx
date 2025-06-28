'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Upload, X, ImageIcon } from 'lucide-react'
import { mockCategories } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from "sonner";

import {Product} from '@/lib/types'

// Predefined categories
// const CATEGORIES = [
//   { id: 'electronics', name: 'Electronics' },
//   { id: 'clothing', name: 'Clothing & Fashion' },
//   { id: 'home', name: 'Home & Garden' },
//   { id: 'sports', name: 'Sports & Recreation' },
//   { id: 'books', name: 'Books & Media' },
// ] as const

// Mock current user
const MOCK_USER = {
  id: 'user-123',
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  rating: 4.8,
  reviewCount: 127,
}

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Price must be a valid positive number'),
  originalPrice: z
    .string()
    .optional()
    .refine((val) => {
      if (val === undefined || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Original price must be a valid positive number'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['new', 'used', 'refurbished'], {
    required_error: 'Please select a condition',
  }),
  brand: z.string().optional(),
  tags: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ImageFile {
  id: string
  file: File
  preview: string
  base64: string
}


export default function ProductCreateForm() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published' | null>(null)

  const router = useRouter()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      condition: 'used',
      brand: '',
      tags: '',
    },
  })

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => {
      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload only JPG, JPEG, or PNG images.',
        })
        return false
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please upload images smaller than 5MB.',

        }
        )
        return false
      }

      return true
    })

    // Check total image limit
    if (images.length + validFiles.length > 5) {
      toast.error('Too many images', {

        description:'Upload a maximum 5 images.',
        
      })
      return
    }

    // Process files
    const newImages: ImageFile[] = []
    for (const file of validFiles) {
      try {
        const base64 = await fileToBase64(file)
        const imageFile: ImageFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          base64,
        }
        newImages.push(imageFile)
      } catch (error) {
        console.error('Error converting file to base64:', error)
        toast.error('Upload error', {
          description: 'Failed to process image. Please try again.'
        })
      }
    }

    setImages(prev => [...prev, ...newImages])
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      // Clean up preview URLs
      const removed = prev.find(img => img.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }


  // Enhanced submission handler
  const handleSubmit = async (data: ProductFormData, status: 'draft' | 'published') => {
    if (images.length === 0) {
      toast.error('Images required', {
        description: 'Please upload at least one image.',
      })
      return
    }

    setIsSubmitting(true)
    setCurrentStatus(status)

    try {
      // Generate product ID
      const productId = generateId()

      // Create product object
      const product = {
        id: productId,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        images: images.map(img => img.base64),
        category: mockCategories.find(cat => cat.id === data.category)?.name || '',
        categoryId: data.category,
        brand: data.brand || undefined,
        rating: 0,
        reviewCount: 0,
        condition: data.condition,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seller: MOCK_USER,
        status: status,
        userId: MOCK_USER.id,
      }

      // Store in localStorage for now (MVP)
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]')
      existingProducts.push(product)
      localStorage.setItem('products', JSON.stringify(existingProducts))

      if (status === 'published') {
        toast.success('Product listed successfully!', {
          description: 'Your item has been added to the marketplace.',
        })
        router.push(`/products/${productId}`)
      } else {
        toast.success('Draft saved!', {
          description: 'Your product draft has been saved.',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Product was not listed!', {
        description: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Images Upload Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Product Images</Label>
          {/* Upload Zone */}
          <div className="relative">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 5MB (max 5 images)
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e.target.files)}
                tabIndex={-1}
                style={{ zIndex: 2 }}
              />
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show current status if editing (future-proof) */}
        {currentStatus && (
          <div className="text-sm text-gray-600">Current status: <span className="font-semibold">{currentStatus}</span></div>
        )}

        {/* Product Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your item in detail..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price (optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Condition */}
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Condition *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="used" id="used" />
                    <Label htmlFor="used">Used</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="refurbished" id="refurbished" />
                    <Label htmlFor="refurbished">Refurbished</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand */}
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter brand name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter tags separated by commas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dual Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit((data) => handleSubmit(data, 'draft'))}
            variant="secondary"
          >
            {isSubmitting && currentStatus === 'draft' ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit((data) => handleSubmit(data, 'published'))}
          >
            {isSubmitting && currentStatus === 'published' ? 'Publishing...' : 'Publish Now'}
          </Button>
        </div>
      </form>
    </Form>
  )
}