import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed'];

// Skeleton placeholder
const BarChartSkeleton = () => (
    <div className="chart-card">
        <div className="skeleton" style={{ width: 140, height: 18, marginBottom: 16 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 280, padding: '0 20px' }}>
            {[0.6, 0.9, 0.45, 0.75, 0.3].map((h, i) => (
                <div key={i} className="skeleton" style={{ flex: 1, height: `${h * 100}%`, borderRadius: '6px 6px 0 0' }} />
            ))}
        </div>
    </div>
);

const FeatureBarChart = ({ data, selectedFeature, onBarClick, loading }) => {
    if (loading) return <BarChartSkeleton />;

    return (
        <div className="chart-card">
            <h3 className="chart-title">Feature Usage</h3>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="feature"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
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
                    <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        cursor="pointer"
                        onClick={(entry) => onBarClick(entry.feature)}
                    >
                        {data.map((entry, idx) => (
                            <Cell
                                key={entry.feature}
                                fill={entry.feature === selectedFeature ? '#f59e0b' : COLORS[idx % COLORS.length]}
                                opacity={selectedFeature && entry.feature !== selectedFeature ? 0.5 : 1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {selectedFeature && (
                <p className="chart-hint">
                    Showing trend for <strong>{selectedFeature}</strong> — click another bar to change.
                </p>
            )}
        </div>
    );
};

export default FeatureBarChart;
