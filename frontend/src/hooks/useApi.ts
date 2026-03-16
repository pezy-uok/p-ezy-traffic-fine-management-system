import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: AxiosError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>
}

/**
 * Custom hook for making API calls
 * @param apiFunction - Function that returns axios promise
 * @returns Object with data, loading, error states and refetch function
 */
export function useApi<T>(
  apiFunction: () => Promise<AxiosResponse<any>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await apiFunction()
      setState({
        data: response.data.data || response.data,
        loading: false,
        error: null,
      })
    } catch (err) {
      const axiosError = err as AxiosError
      setState({
        data: null,
        loading: false,
        error: axiosError,
      })
    }
  }, [apiFunction])

  // Fetch data on mount
  // Note: Using useEffect is recommended instead of direct call
  // This is just to show the structure

  return {
    ...state,
    refetch: fetchData,
  }
}

/**
 * Custom hook for form submissions with API calls
 * @param apiFunction - Function that returns axios promise
 * @returns Object with execute function and state
 */
export function useApiMutation<T>(
  apiFunction: (...args: any[]) => Promise<AxiosResponse<any>>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AxiosError | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiFunction(...args)
        setData(response.data.data || response.data)
        return response.data
      } catch (err) {
        const axiosError = err as AxiosError
        setError(axiosError)
        throw axiosError
      } finally {
        setLoading(false)
      }
    },
    [apiFunction]
  )

  return {
    execute,
    loading,
    error,
    data,
  }
}
