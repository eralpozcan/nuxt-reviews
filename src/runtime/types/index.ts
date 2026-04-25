// ============================================================
// nuxt-reviews — Normalized Review Types
// Based on Schema.org/Review + common platform fields
// ============================================================

/** Supported review providers */
export type ReviewProvider = 'google' | 'trustpilot' | 'serpapi' | 'outscraper' | 'bookingcom' | 'mock'

/** Author of a review */
export interface ReviewAuthor {
  name: string
  avatar?: string
  url?: string
  /** Number of reviews the author has written (if available) */
  reviewCount?: number
}

/** A business/owner response to a review */
export interface ReviewResponse {
  text: string
  publishedAt: string
}

/** A single normalized review from any provider */
export interface NormalizedReview {
  /** Unique identifier (provider-prefixed, e.g. "google_abc123") */
  id: string
  /** Source provider */
  provider: ReviewProvider
  /** Star rating normalized to 1-5 scale */
  rating: number
  /** Review body text */
  text: string
  /** Review title/headline (not all providers have this) */
  title?: string
  /** Review author information */
  author: ReviewAuthor
  /** ISO 8601 publication date */
  publishedAt: string
  /** Language code (e.g. "en", "tr", "de") */
  language?: string
  /** Whether the review is verified */
  isVerified?: boolean
  /** Business owner's response */
  businessResponse?: ReviewResponse
  /** Number of likes/helpful votes */
  likes?: number
  /** Attached image URLs */
  images?: string[]
  /** Direct URL to the review on the source platform */
  sourceUrl?: string
  /** Moderation result (only present when moderation is enabled) */
  moderation?: ModerationResult
  /** Provider-specific raw data for advanced use */
  raw?: Record<string, unknown>
}

// ============================================================
// Content Moderation Types
// ============================================================

/** Supported moderation providers */
export type ModerationProvider = 'perspective' | 'openai'

/** Perspective API attribute types */
export type PerspectiveAttribute
  = | 'TOXICITY'
    | 'SEVERE_TOXICITY'
    | 'INSULT'
    | 'PROFANITY'
    | 'THREAT'
    | 'IDENTITY_ATTACK'

/** Moderation score breakdown per attribute */
export interface ModerationScores {
  /** Overall toxicity score (0.0 - 1.0) */
  toxicity: number
  /** Severe toxicity score */
  severeToxicity?: number
  /** Insult score */
  insult?: number
  /** Profanity score */
  profanity?: number
  /** Threat score */
  threat?: number
  /** Identity-based attack score */
  identityAttack?: number
}

/** Result of moderation analysis for a single review */
export interface ModerationResult {
  /** Whether the review was flagged as toxic */
  flagged: boolean
  /** Individual attribute scores */
  scores: ModerationScores
  /** Which provider performed the analysis */
  provider: ModerationProvider
}

/** Moderation configuration */
export interface ModerationConfig {
  /** Enable content moderation (default: false) */
  enabled: boolean
  /** Moderation provider to use */
  provider: ModerationProvider
  /** API key for the moderation provider */
  apiKey: string
  /** Toxicity threshold (0.0 - 1.0). Reviews scoring above this are filtered. (default: 0.7) */
  toxicityThreshold?: number
  /** Which attributes to analyze (Perspective API only) */
  attributes?: PerspectiveAttribute[]
  /** Action to take on flagged reviews: 'filter' removes them, 'flag' keeps them with moderation data (default: 'filter') */
  action?: 'filter' | 'flag'
}

/** Rating distribution (star counts) */
export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

/** Aggregated rating summary across reviews */
export interface AggregateRating {
  /** Average rating (1-5 scale) */
  average: number
  /** Total number of reviews */
  total: number
  /** Rating distribution by star */
  distribution: RatingDistribution
}

/** A collection of reviews from one or more providers */
export interface ReviewCollection {
  /** Normalized reviews */
  reviews: NormalizedReview[]
  /** Aggregate rating computed from fetched reviews */
  aggregate: AggregateRating
  /** Breakdown by provider */
  sources: Array<{
    provider: ReviewProvider
    count: number
    average: number
  }>
  /** When the data was last fetched (ISO 8601) */
  fetchedAt: string
  /** Total reviews available on the platform (single-provider mode only) */
  totalAvailable?: number
  /** Token for fetching the next page (single-provider mode only) */
  nextPageToken?: string
}

// ============================================================
// Provider Configuration Types
// ============================================================

export interface GoogleProviderConfig {
  /** Google API key */
  apiKey: string
  /** Google Place ID */
  placeId: string
}

export interface TrustpilotProviderConfig {
  /** Trustpilot API key */
  apiKey: string
  /** Business Unit ID on Trustpilot */
  businessUnitId: string
}

export interface SerpApiProviderConfig {
  /** SerpAPI key */
  apiKey: string
  /** Google Maps Place ID or data_id */
  placeId: string
  /** Sort order */
  sort?: 'qualityScore' | 'newestFirst' | 'ratingHigh' | 'ratingLow'
}

export interface OutscraperProviderConfig {
  /** Outscraper API key */
  apiKey: string
  /** Google Maps Place ID */
  placeId: string
  /** Number of reviews to fetch (default: 100) */
  limit?: number
  /** Sort order */
  sort?: 'newest' | 'most_relevant' | 'highest_rating' | 'lowest_rating'
}

export interface BookingcomProviderConfig {
  /** Booking.com Connectivity API username */
  username: string
  /** Booking.com Connectivity API password */
  password: string
  /** Booking.com property (hotel) ID */
  propertyId: string
}

export interface MockProviderConfig {
  /** Optional seed for deterministic data generation (reserved for future use) */
  seed?: number
}

/** Map of provider names to their config */
export interface ProvidersConfig {
  google?: GoogleProviderConfig
  trustpilot?: TrustpilotProviderConfig
  serpapi?: SerpApiProviderConfig
  outscraper?: OutscraperProviderConfig
  bookingcom?: BookingcomProviderConfig
  mock?: MockProviderConfig
}

/** Module-level configuration */
export interface ModuleOptions {
  /** Provider configurations */
  providers: ProvidersConfig
  /** Cache TTL in seconds (default: 3600) */
  cacheTTL?: number
  /** Enable/disable caching (default: true) */
  cache?: boolean
  /** Default language filter (e.g. "tr", "en") */
  defaultLanguage?: string
  /** Maximum reviews to return per provider (default: 50) */
  maxReviews?: number
  /** Minimum rating to include (1-5, default: none — all reviews returned) */
  minRating?: number
  /** Content moderation configuration */
  moderation?: ModerationConfig
  /** API route prefix (default: "/api/_reviews") */
  apiPrefix?: string
}

// ============================================================
// Provider Adapter Interface
// ============================================================

/** Fetch options passed to provider adapters */
export interface FetchReviewsOptions {
  /** Maximum number of reviews to fetch */
  limit?: number
  /** Language filter */
  language?: string
  /** Sort order (provider-specific mapping) */
  sort?: string
  /** Pagination token (provider-specific) */
  pageToken?: string
  /** Minimum rating filter (1-5). Reviews below this rating are excluded. */
  minRating?: number
}

/** Result returned by a provider adapter */
export interface ProviderResult {
  reviews: NormalizedReview[]
  /** Total reviews available on the platform (if known) */
  totalAvailable?: number
  /** Token for fetching next page (if supported) */
  nextPageToken?: string
}

/** Interface that all provider adapters must implement */
export interface ReviewProviderAdapter {
  /** Provider name */
  name: ReviewProvider
  /** Fetch reviews from the provider */
  fetchReviews: (config: Record<string, unknown>, options?: FetchReviewsOptions) => Promise<ProviderResult>
}
