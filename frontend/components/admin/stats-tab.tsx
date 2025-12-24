'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { getStats } from '@/lib/api';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function StatsTab() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: getStats,
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-12 h-12" /></div>;

    return (
        <div className="space-y-8">
            <h2 className="hidden sm:block text-2xl sm:text-4xl font-black uppercase italic tracking-tighter">Statistik & Pendapatan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Pendapatan"
                    value={stats?.totalEarnings ? `Rp${stats.totalEarnings.toLocaleString('id-ID')}` : 'Rp0'}
                    icon={DollarSign}
                    color="bg-green-100"
                />
                <StatCard
                    title="Item Terjual"
                    value={stats?.itemsSold || 0}
                    icon={ShoppingBag}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Total Pesanan"
                    value={stats?.orderCount || 0}
                    icon={TrendingUp}
                    color="bg-purple-100"
                />
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
                <h3 className="text-2xl font-black uppercase mb-4">Ringkasan Pendapatan</h3>
                <div className="h-80 w-full border-2 border-black border-dashed bg-gray-50 p-4">
                    {stats?.chartData && stats.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    tick={{ fontSize: 12, fontFamily: 'monospace' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                                    tick={{ fontSize: 12, fontFamily: 'monospace' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '2px solid black',
                                        borderRadius: '0px',
                                        boxShadow: '4px 4px 0px 0px #000',
                                        fontFamily: 'monospace'
                                    }}
                                    formatter={(value: number) => [`Rp${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Bar dataKey="revenue" fill="#000" radius={[0, 0, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 font-mono">
                            Belum ada data pendapatan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
    return (
        <div className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] ${color} transition-transform hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white border-2 border-black rounded-none">
                    <Icon size={24} />
                </div>
            </div>
            <h3 className="font-mono text-xs sm:text-sm uppercase text-gray-600 font-bold mb-1">{title}</h3>
            <p className="text-2xl sm:text-4xl font-black tracking-tight">{value}</p>
        </div>
    );
}
