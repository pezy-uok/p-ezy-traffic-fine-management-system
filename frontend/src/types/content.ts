/**
 * Content & Resources Types
 */

import type { User } from './auth'
import type { PaginatedResponse, PaginationParams } from './common'

/** Post entity */
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author: User
  category: PostCategory
  tags: Tag[]
  status: PostStatus
  featured: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  coverImage?: string
  metadata?: PostMetadata
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

/** Post status */
export const PostStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus]

/** Post category */
export interface PostCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  postCount: number
}

/** Tag */
export interface Tag {
  id: string
  name: string
  slug: string
  count: number
}

/** Post metadata */
export interface PostMetadata {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  socialImage?: string
}

/** Create/Update post request */
export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags: string[]
  status: PostStatus
  featured?: boolean
  coverImage?: string
  metadata?: PostMetadata
}

/** Comment entity */
export interface Comment {
  id: string
  postId: string
  author: User
  content: string
  status: CommentStatus
  likeCount: number
  replies: Comment[]
  parentId?: string
  createdAt: string
  updatedAt: string
}

/** Comment status */
export const CommentStatus = {
  APPROVED: 'approved',
  PENDING: 'pending',
  SPAM: 'spam',
  DELETED: 'deleted',
} as const

export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus]

/** Create comment request */
export interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
}

/** Post query parameters */
export interface PostQueryParams extends PaginationParams {
  search?: string
  categoryId?: string
  tags?: string[]
  status?: PostStatus
  featured?: boolean
  authorId?: string
}

/** Post list response */
export interface PostListResponse extends PaginatedResponse<Post> {
  total: number
}

/** Category list response */
export interface CategoryListResponse {
  data: PostCategory[]
  total: number
}

/** Tag list response */
export interface TagListResponse {
  data: Tag[]
  total: number
}
