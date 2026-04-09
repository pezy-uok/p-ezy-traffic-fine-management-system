/**
 * Criminal Photo Upload Service
 * Handles photo uploads for criminal records
 */

import { axiosInstance } from '../api'
import type { Criminal } from '../types'

export interface CriminalPhotoUploadResponse {
  success: boolean
  message?: string
  criminal?: Criminal
  error?: string
}

export class CriminalPhotoService {
  private readonly baseUrl = '/criminals'
  private readonly apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  /**
   * Upload or update criminal photo
   */
  async uploadCriminalPhoto(
    criminalId: string,
    photoFile: File,
    authToken: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<CriminalPhotoUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)

      const response = await axiosInstance.post<Criminal>(
        `${this.baseUrl}/${criminalId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authToken}`,
          },
          onUploadProgress,
          timeout: 30000, // 30 seconds
        }
      )

      return {
        success: true,
        criminal: response.data,
      }
    } catch (error: any) {
      console.error('Photo upload error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Upload failed',
      }
    }
  }

  /**
   * Validate file size (max 10MB)
   */
  isValidFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return file.size <= maxSize
  }

  /**
   * Validate image file type
   */
  isValidImageType(file: File): boolean {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return allowedMimes.includes(file.type)
  }

  /**
   * Get photo URL
   */
  getPhotoUrl(photoPath: string | null | undefined, baseUrl?: string): string | null {
    if (!photoPath) return null
    const base = baseUrl || this.apiBaseUrl
    return `${base}${photoPath}`
  }
}

// Export singleton instance
export const criminalPhotoService = new CriminalPhotoService()

export default criminalPhotoService
