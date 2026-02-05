const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface URLCreate {
  original_url: string;
  custom_slug?: string;
  expires_at?: string;
}

export interface URLResponse {
  id: number;
  original_url: string;
  slug: string;
  short_url: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  click_count: number;
}

export interface URLListResponse {
  urls: URLResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface URLStats {
  slug: string;
  original_url: string;
  total_clicks: number;
  clicks_by_country: Record<string, number>;
  clicks_by_device: Record<string, number>;
  clicks_by_browser: Record<string, number>;
  clicks_by_os: Record<string, number>;
  clicks_over_time: { date: string; count: number }[];
  top_referrers: { referrer: string; count: number }[];
}

export const api = {
  async shorten(data: URLCreate): Promise<URLResponse> {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to shorten URL');
    }
    return response.json();
  },

  async listUrls(page = 1, perPage = 20): Promise<URLListResponse> {
    const response = await fetch(`${API_BASE_URL}/urls?page=${page}&per_page=${perPage}`);
    if (!response.ok) throw new Error('Failed to fetch URLs');
    return response.json();
  },

  async getStats(slug: string): Promise<URLStats> {
    const response = await fetch(`${API_BASE_URL}/stats/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async deleteUrl(slug: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/urls/${slug}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete URL');
  },

  async checkHealth(): Promise<{ status: string; redis: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }
};
