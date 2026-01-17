/**
 * Analytics Service
 * Handles company analytics operations including view tracking, clicks, and favorites
 */

export interface CompanyAnalytics {
  id: string;
  name: string;
  views: number;
  clicks: number;
  favourites: number;
  [key: string]: any; // For other company data
}

class AnalyticsService {
  /**
   * Increment a specific metric for a company
   */
  async incrementMetric(companyId: string, metric: 'views' | 'clicks' | 'favourites'): Promise<void> {
    try {
      const response = await fetch('/api/analytics/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, metric }),
      });

      if (!response.ok) {
        throw new Error(`Failed to increment ${metric}`);
      }
    } catch (error) {
      console.error(`Error incrementing ${metric}:`, error);
      // Don't throw error to prevent breaking user experience
    }
  }

  /**
   * Get all companies for dropdown selection
   */
  async getCompanies(): Promise<CompanyAnalytics[]> {
    try {
      const response = await fetch('/api/analytics/companies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  /**
   * Get specific company with analytics data
   */
  async getCompany(companyId: string): Promise<CompanyAnalytics | null> {
    try {
      const response = await fetch(`/api/get-company?id=${companyId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch company');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  /**
   * Update company information
   */
  async updateCompany(companyId: string, updateData: Partial<CompanyAnalytics>): Promise<boolean> {
    try {
      const response = await fetch('/api/analytics/update-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, updateData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      return true;
    } catch (error) {
      console.error('Error updating company:', error);
      return false;
    }
  }

  /**
   * Track company view (when displayed in search results)
   */
  async trackView(companyId: string): Promise<void> {
    await this.incrementMetric(companyId, 'views');
  }

  /**
   * Track company click (when company card is clicked)
   */
  async trackClick(companyId: string): Promise<void> {
    await this.incrementMetric(companyId, 'clicks');
  }

  /**
   * Track company favorite (when company is favorited)
   */
  async trackFavourite(companyId: string): Promise<void> {
    await this.incrementMetric(companyId, 'favourites');
  }
}

export const analyticsService = new AnalyticsService();