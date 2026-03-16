/**
 * Dashboard & Analytics Types
 */

/** Dashboard statistics */
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyGrowth: number
  conversionRate: number
  averageSessionDuration: number
}

/** Chart data point */
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

/** Chart dataset */
export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  color?: string
  borderColor?: string
  backgroundColor?: string
}

/** Chart data response */
export interface ChartData {
  title: string
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter'
  datasets: ChartDataset[]
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
}

/** Dashboard widget */
export interface DashboardWidget {
  id: string
  title: string
  type: 'stat' | 'chart' | 'table' | 'list'
  data: any
  refreshInterval?: number
  position?: number
}

/** Analytics period */
export interface AnalyticsPeriod {
  startDate: string
  endDate: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

/** Traffic analytics */
export interface TrafficAnalytics extends AnalyticsPeriod {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
  topPages: PageStats[]
  trafficSources: TrafficSource[]
}

/** Page statistics */
export interface PageStats {
  url: string
  views: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
}

/** Traffic source */
export interface TrafficSource {
  source: string
  medium: string
  visits: number
  percentage: number
}

/** User engagement metrics */
export interface EngagementMetrics extends AnalyticsPeriod {
  totalSessions: number
  totalPageviews: number
  avgSessionDuration: number
  bounceRate: number
  goalConversions: number
  conversionRate: number
}

/** Dimensional data for analytics */
export interface DimensionalData {
  dimension: string
  metrics: Record<string, number>
}

/** Analytics report */
export interface AnalyticsReport {
  id: string
  title: string
  type: 'traffic' | 'engagement' | 'conversion' | 'custom'
  period: AnalyticsPeriod
  data: Record<string, any>
  generatedAt: string
  generatedBy: string
}

/** Report export options */
export interface ReportExportOptions {
  reportId: string
  format: 'pdf' | 'csv' | 'xlsx'
  includeCharts: boolean
  includeRaw: boolean
}
