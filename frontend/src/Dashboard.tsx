import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Link as LinkIcon, 
  Globe, 
  Smartphone, 
  MousePointer2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy,
  Check,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api, URLResponse, URLStats } from './api';

const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<URLResponse[]>([]);
  const [totalUrls, setTotalUrls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<URLResponse | null>(null);
  const [stats, setStats] = useState<URLStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const data = await api.listUrls();
      setUrls(data.urls);
      setTotalUrls(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.shorten({ 
        original_url: newUrl, 
        custom_slug: customSlug || undefined 
      });
      setUrls([result, ...urls]);
      setNewUrl('');
      setCustomSlug('');
      setTotalUrls(prev => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewStats = async (url: URLResponse) => {
    setSelectedUrl(url);
    setStatsLoading(true);
    try {
      const data = await api.getStats(url.slug);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.deleteUrl(slug);
      setUrls(urls.filter(u => u.slug !== slug));
      setTotalUrls(prev => prev - 1);
      if (selectedUrl?.slug === slug) {
        setSelectedUrl(null);
        setStats(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Micro<span style={{ color: 'var(--accent-primary)' }}>URL</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Production-ready link management & analytics</p>
        </div>
        <div className="btn btn-primary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          <Plus size={18} /> Create New
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card stat-card">
          <div className="stat-label">Total Links</div>
          <div className="stat-value">{totalUrls}</div>
          <div className="stat-change positive">
            <TrendingUp size={12} /> Live tracking enabled
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total Clicks</div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-change positive">
            <TrendingUp size={12} /> Real-time analytics
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Average CTR</div>
          <div className="stat-value">{totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0}</div>
          <div className="stat-change positive">
            <MousePointer2 size={12} /> Clicks per link
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
        {/* URL Creation Form */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Create Short Link</h2>
          </div>
          <form onSubmit={handleShorten} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Original URL</label>
              <input 
                className="input" 
                type="url" 
                placeholder="https://very-long-url.com/something/deep/inside" 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Custom Slug (Optional)</label>
                <input 
                  className="input" 
                  type="text" 
                  placeholder="my-link" 
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <div className="spinner" /> : <><LinkIcon size={18} /> Shorten URL</>}
                </button>
              </div>
            </div>
            {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}
          </form>
        </section>

        {/* Quick Tips or Server Health */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Link Performance</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                <Globe size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Global Reach</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Track visitors from 190+ countries</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Conversion Data</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>See which devices convert best</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* URL List */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Links</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Showing {urls.length} links</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Short Link</th>
                <th>Original URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{url.slug}</span>
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(url.short_url, url.id)}
                        title="Copy to clipboard"
                      >
                        {copiedId === url.id ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {url.original_url}
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-success" style={{ fontWeight: 600 }}>{url.click_count} clicks</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(url.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleViewStats(url)}>
                        <BarChart3 size={14} /> Stats
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }} onClick={() => window.open(url.short_url, '_blank')}>
                        <ExternalLink size={14} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', color: 'var(--error)' }} onClick={() => handleDelete(url.slug)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {urls.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <LinkIcon />
                      <p>No links created yet. Start by shortening your first URL!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats Modal */}
      {selectedUrl && (
        <div className="modal-overlay" onClick={() => setSelectedUrl(null)}>
          <div className="modal" style={{ maxWidth: '800px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Analytics for <span style={{ color: 'var(--accent-primary)' }}>/{selectedUrl.slug}</span></h3>
              <button className="modal-close" onClick={() => setSelectedUrl(null)}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
            </div>
            
            {statsLoading ? (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }} />
              </div>
            ) : stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="grid grid-4">
                  <div className="card" style={{ padding: '1rem' }}>
                    <div className="stat-label" style={{ fontSize: '0.75rem' }}>Total Clicks</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.total_clicks}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div className="stat-label" style={{ fontSize: '0.75rem' }}>Countries</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{Object.keys(stats.clicks_by_country).length}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div className="stat-label" style={{ fontSize: '0.75rem' }}>Top OS</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{Object.keys(stats.clicks_by_os)[0] || 'N/A'}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <div className="stat-label" style={{ fontSize: '0.75rem' }}>Top Device</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{Object.keys(stats.clicks_by_device)[0] || 'N/A'}</div>
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="card-header">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Clicks Over Time</h4>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.clicks_over_time}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--text-muted)" 
                          fontSize={12} 
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--accent-primary)' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Countries</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(stats.clicks_by_country).map(([country, count]) => (
                        <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', flex: 1 }}>{country}</span>
                          <div style={{ height: '8px', background: 'var(--bg-tertiary)', flex: 2, borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${(count / stats.total_clicks) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', width: '30px', textAlign: 'right' }}>{count}</span>
                        </div>
                      ))}
                      {Object.keys(stats.clicks_by_country).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No country data yet</p>}
                    </div>
                  </div>
                  <div className="card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Device Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(stats.clicks_by_device).map(([device, count]) => (
                        <div key={device} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.875rem', flex: 1, textTransform: 'capitalize' }}>{device}</span>
                          <div style={{ height: '8px', background: 'var(--bg-tertiary)', flex: 2, borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${(count / stats.total_clicks) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', width: '30px', textAlign: 'right' }}>{count}</span>
                        </div>
                      ))}
                      {Object.keys(stats.clicks_by_device).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No device data yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Error loading statistics.</p>
            )}
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUrl(null)}>Close Analytics</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          &copy; 2026 Micro-URL. Built for speed and privacy.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
