import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function OrderStatusPieChart({ providerStats }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 1. Fallback / Mock Data using your core theme colors
  const completedCount = providerStats?.completedOrders ?? 42;
  const cancelledCount = providerStats?.cancelledOrders ?? 8;
  const totalOrders = providerStats?.totalOrders;

  const data = [
    { name: 'Completed', value: completedCount, color: '#10b981' }, // Emerald Green
    { name: 'Cancelled', value: cancelledCount, color: '#f43f5e' }, // Rose Red
  ];

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-sm font-black tracking-tight text-gray-800">
          Order Fulfillment
        </h2>
        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 text-[10px] font-black rounded-full uppercase tracking-wider">
          Real-time
        </span>
      </div>

      {/* Chart Canvas Box Wrapper */}
      <div className="w-full h-52 min-w-0 relative flex items-center justify-center">
        
        {/* 2. Floating Total Counter perfectly dead-center inside the Donut Hole */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black tracking-tight text-slate-800 leading-none">
            {totalOrders}
          </span>
          <span className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">
            Total Orders
          </span>
        </div>

        {hasMounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}  // Makes it a hollow donut chart
                outerRadius={78}
                paddingAngle={4}   // Creates a clean gap between the slices
                dataKey="value"
                /* 3. PREMIUM ANIMATION SETTINGS */
                isAnimationActive={true}
                animationBegin={200}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 4. Elegant Custom Bottom Legend Matrix */}
      <div className="grid grid-cols-2 gap-4 w-full mt-2 pt-4 border-t border-slate-50">
        {data.map((item, idx) => {
          const percentage = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="flex flex-col items-center p-2 rounded-lg bg-slate-50/50 border border-slate-100/50">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.name}</span>
              </div>
              <div className="text-base font-black text-slate-700">
                {item.value} <span className="text-xs font-medium text-gray-400">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}