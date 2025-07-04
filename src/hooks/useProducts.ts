import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Query all published products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('/api/products')).data,
  })
}

// Query single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await axios.get(`/api/products/${id}`)).data,
    enabled: !!id,
  })
}

// Query user's products by status
export function useUserProducts(userId: string, status?: string) {
  return useQuery({
    queryKey: ['user-products', userId, status],
    queryFn: async () => {
      const url = status ? `/api/users/${userId}/products?status=${status}` : `/api/users/${userId}/products`
      return (await axios.get(url)).data
    },
    enabled: !!userId,
  })
}

// Mutation for product creation
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, any>) => (await axios.post('/api/products', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
  })
}

// Mutation for product updates
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) =>
      (await axios.put(`/api/products/${id}`, data)).data,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
  })
}

// Mutation for product deletion
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await axios.delete(`/api/products/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
  })
}

// Mutation for bulk deletion
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => (await axios.delete('/api/products/bulk', { data: { ids } })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
  })
}

// Mutation for status changes
export function useToggleProductStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await axios.patch(`/api/products/${id}`)).data,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
  })
}
