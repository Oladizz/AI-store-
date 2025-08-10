
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js/auto';
import { Order, User, Currency } from '../types';
import { UserGroupIcon, ShoppingBagIcon, BanknotesIcon } from './icons';

Chart.register(...registerables);

interface AdminDashboardProps {
    onNavigate: (path: string, sectionId?: string) => void;
    users: User[];
    orders: Order[];
    currency: Currency;
}

const processRevenueData = (orders: Order[], currency: Currency) => {
    const revenueByDay: { [key: string]: number } = {};
    orders.forEach(order => {
        if (order.currency.code === currency.code) {
            const date = new Date(order.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
            revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
        }
    });

    const sortedDates = Object.keys(revenueByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const labels = sortedDates;
    const data = sortedDates.map(date => revenueByDay[date]);
    return { labels, data };
};

const processUserGrowthData = (users: User[]) => {
    const usersByDay: { [key: string]: number } = {};
    users.forEach(user => {
        const date = new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
        usersByDay[date] = (usersByDay[date] || 0) + 1;
    });

    const sortedDates = Object.keys(usersByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let cumulativeUsers = 0;
    const cumulativeData: { [key: string]: number } = {};

    for (const date of sortedDates) {
        cumulativeUsers += usersByDay[date];
        cumulativeData[date] = cumulativeUsers;
    }

    const labels = Object.keys(cumulativeData);
    const data = Object.values(cumulativeData);
    
    return { labels, data };
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, users, orders, currency }) => {
    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const userChartRef = useRef<HTMLCanvasElement>(null);
    const revenueChartInstance = useRef<Chart | null>(null);
    const userChartInstance = useRef<Chart | null>(null);

    const filteredOrders = orders.filter(o => o.currency.code === currency.code);
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const totalUsers = users.length;

    useEffect(() => {
        if (revenueChartInstance.current) revenueChartInstance.current.destroy();
        if (revenueChartRef.current) {
            const { labels, data } = processRevenueData(orders, currency);
            const ctx = revenueChartRef.current.getContext('2d');
            if (ctx) {
                revenueChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: `Revenue (${currency.symbol})`,
                            data,
                            borderColor: 'rgb(79, 70, 229)',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            fill: true,
                            tension: 0.3,
                        }]
                    },
                    options: { scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: false }
                });
            }
        }

        if (userChartInstance.current) userChartInstance.current.destroy();
        if (userChartRef.current) {
            const { labels, data } = processUserGrowthData(users);
            const ctx = userChartRef.current.getContext('2d');
            if (ctx) {
                 userChartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Total Users',
                            data,
                            borderColor: 'rgb(22, 163, 74)',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                     options: { scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: false }
                });
            }
        }
        
        return () => {
            revenueChartInstance.current?.destroy();
            userChartInstance.current?.destroy();
        };
    }, [orders, users, currency]);

    return (
        <div className="bg-slate-100 min-h-screen">
            <header className="bg-white shadow-sm">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Dashboard</h1>
                    <button onClick={() => onNavigate('/')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">&larr; Back to Store</button>
                 </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
                         <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4"><BanknotesIcon className="h-8 w-8"/></div>
                         <div>
                             <p className="text-sm text-slate-500">Total Revenue ({currency.symbol})</p>
                             <p className="text-3xl font-bold text-slate-900">{currency.symbol}{totalRevenue.toFixed(2)}</p>
                         </div>
                     </div>
                     <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
                         <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4"><ShoppingBagIcon className="h-8 w-8"/></div>
                         <div>
                             <p className="text-sm text-slate-500">Total Orders ({currency.code})</p>
                             <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
                         </div>
                     </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
                         <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4"><UserGroupIcon className="h-8 w-8"/></div>
                         <div>
                             <p className="text-sm text-slate-500">Total Users</p>
                             <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                         <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Over Time</h2>
                         <div className="relative h-72">
                            <canvas ref={revenueChartRef}></canvas>
                         </div>
                     </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                         <h2 className="text-xl font-semibold text-slate-800 mb-4">User Growth Over Time</h2>
                         <div className="relative h-72">
                            <canvas ref={userChartRef}></canvas>
                         </div>
                     </div>
                 </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
