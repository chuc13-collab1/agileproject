import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface BurndownProps {
    data: {
        planned: Array<{ week: number; remaining: number }>;
        actual: Array<{ week: number; remaining: number; hasReport?: boolean }>;
        totalWeeks: number;
    };
}

const BurndownChart: React.FC<BurndownProps> = ({ data }) => {
    if (!data || !data.planned || data.planned.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <p style={{ fontSize: '2rem' }}>📉</p>
                <p>Chưa có dữ liệu Sprint để hiện biểu đồ.</p>
            </div>
        );
    }

    // Merge planned and actual data
    const chartData = data.planned.map((p, i) => ({
        week: `Tuần ${p.week}`,
        'Kế hoạch': p.remaining,
        'Thực tế': data.actual[i]?.remaining ?? null,
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        stroke="#94a3b8"
                        label={{ value: '% Còn lại', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number | undefined) => [`${value ?? 0}%`]}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#10b981" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="Kế hoạch"
                        stroke="#94a3b8"
                        strokeDasharray="8 4"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#94a3b8' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Thực tế"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BurndownChart;
