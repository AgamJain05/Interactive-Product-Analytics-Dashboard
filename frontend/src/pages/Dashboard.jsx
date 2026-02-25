import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '../api/axiosInstance';
import FiltersPanel from '../components/FiltersPanel';
import FeatureBarChart from '../components/FeatureBarChart';
import TrendLineChart from '../components/TrendLineChart';
import './Dashboard.css';

const COOKIE_KEY = 'dashboard_filters';
const COOKIE_OPTS = { expires: 30, sameSite: 'lax' };

const AGE_MAP = {
    under18: { ageMin: 0, ageMax: 17 },
    '18-40': { ageMin: 18, ageMax: 40 },
    over40: { ageMin: 41, ageMax: 120 },
};

const readFiltersFromCookie = () => {
    const defaults = { startDate: null, endDate: null, ageGroup: '', gender: '' };
    try {
        const raw = Cookies.get(COOKIE_KEY);
        if (!raw) return defaults;
        const saved = JSON.parse(raw);
        return {
            startDate: saved.startDate ? new Date(saved.startDate) : null,
            endDate: saved.endDate ? new Date(saved.endDate) : null,
            ageGroup: saved.ageGroup || '',
            gender: saved.gender || '',
        };
    } catch { return defaults; }
};

const writeFiltersToCookie = (filters) => {
    Cookies.set(COOKIE_KEY, JSON.stringify({
        startDate: filters.startDate?.toISOString() || null,
        endDate: filters.endDate?.toISOString() || null,
        ageGroup: filters.ageGroup || '',
        gender: filters.gender || '',
    }), COOKIE_OPTS);
};

const Dashboard = () => {
    const [filters, setFilters] = useState(readFiltersFromCookie);
    const [analytics, setAnalytics] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(false);

    // ─── Fetch main analytics ────────────────────────────────────────────
    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate.toISOString().slice(0, 10);
            if (filters.endDate) params.endDate = filters.endDate.toISOString().slice(0, 10);
            if (filters.gender) params.gender = filters.gender;
            if (filters.ageGroup && AGE_MAP[filters.ageGroup]) {
                params.ageMin = AGE_MAP[filters.ageGroup].ageMin;
                params.ageMax = AGE_MAP[filters.ageGroup].ageMax;
            }
            const { data } = await api.get('/analytics', { params });
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchTrend = useCallback(async (feature) => {
        try {
            setTrendLoading(true);
            const { data } = await api.get(`/analytics/trend/${feature}`);
            setTrendData(data);
        } catch (err) {
            console.error('Failed to fetch trend:', err);
        } finally {
            setTrendLoading(false);
        }
    }, []);

    const track = useCallback(async (featureName) => {
        try { await api.post('/track', { feature: featureName }); } catch { /* best-effort */ }
    }, []);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    useEffect(() => {
        if (selectedFeature) fetchTrend(selectedFeature);
    }, [selectedFeature, fetchTrend]);

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleFilterChange = (newFilters) => {
        if (newFilters.startDate !== filters.startDate || newFilters.endDate !== filters.endDate) {
            track('date_filter');
        } else if (newFilters.gender !== filters.gender) {
            track('gender_filter');
        } else if (newFilters.ageGroup !== filters.ageGroup) {
            track('age_filter');
        }
        setFilters(newFilters);
        writeFiltersToCookie(newFilters);
    };

    const handleBarClick = (featureName) => {
        track('bar_chart_click');
        setSelectedFeature(featureName);
    };

    const hasData = analytics?.clicksByFeature?.length > 0;

    return (
        <main className="dashboard fade-in">
            {/* ─── Stats summary ─────────────────────────────────────────── */}
            <section className="stats-row">
                <div className="stat-card">
                    <span className="stat-label">Total Clicks</span>
                    <span className="stat-value">{analytics?.clicksByFeature?.reduce((s, f) => s + f.count, 0) ?? '—'}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Features Tracked</span>
                    <span className="stat-value">{analytics?.clicksByFeature?.length ?? '—'}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Time Range</span>
                    <span className="stat-value">{analytics?.clicksOverTime?.length ?? '—'} <small>days</small></span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Genders</span>
                    <span className="stat-value">{analytics?.clicksByGender?.length ?? '—'}</span>
                </div>
            </section>

            {/* ─── Filters ─────────────────────────────────────────────── */}
            <FiltersPanel filters={filters} onChange={handleFilterChange} />

            {/* ─── Charts ──────────────────────────────────────────────── */}
            {!loading && !hasData ? (
                <div className="empty-state">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 17l4-8 4 4 5-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>No data found</h3>
                    <p>Try adjusting your filters to see analytics.</p>
                </div>
            ) : (
                <div className="charts-grid">
                    <FeatureBarChart
                        data={analytics?.clicksByFeature || []}
                        selectedFeature={selectedFeature}
                        onBarClick={handleBarClick}
                        loading={loading}
                    />
                    <TrendLineChart
                        data={trendData}
                        feature={selectedFeature}
                        loading={trendLoading}
                    />
                </div>
            )}
        </main>
    );
};

export default Dashboard;
