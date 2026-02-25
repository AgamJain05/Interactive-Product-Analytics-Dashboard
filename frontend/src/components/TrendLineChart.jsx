import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Skeleton placeholder
const LineChartSkeleton = () => (
    <div className="chart-card">
        <div className="skeleton" style={{ width: 200, height: 18, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 280, borderRadius: 8 }} />
    </div>
);

const TrendLineChart = ({ data, feature, loading }) => {
    if (loading) return <LineChartSkeleton />;

    if (!feature) {
        return (
            <div className="chart-card chart-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <h3 className="chart-title" style={{ marginTop: 12 }}>Daily Trend</h3>
                <p className="chart-hint">Click a bar in the Feature Usage chart to see its daily trend here.</p>
            </div>
        );
    }

    return (
        <div className="chart-card">
            <h3 className="chart-title">
                Daily Trend — <span className="accent">{feature}</span>
            </h3>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1a1a2e',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            color: '#e2e8f0',
                            fontSize: 13,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendLineChart;
