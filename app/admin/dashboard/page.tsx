'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Loader2, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';

interface DriverStat {
    id: string;
    email: string;
    google_sheet_id: string | null;
    stats: {
        totalTrips: number;
        averagePerDay: number;
    };
}

export default function AdminDashboard() {
    const [drivers, setDrivers] = useState<DriverStat[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                fetchStats();
            }
        };
        checkAuth();
    }, [router]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (Array.isArray(data)) {
                setDrivers(data);
            }
        } catch (error) {
            console.error(error);
            alert('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground>
            <div className="w-full max-w-5xl mx-auto p-6 z-10 relative">
                <header className="flex items-center justify-between mb-8 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all flex items-center justify-center group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <LayoutDashboard className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h1>
                                <p className="text-sm text-purple-200/60 uppercase tracking-widest font-semibold">Administración</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="p-3 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 hover:text-white rounded-xl border border-purple-500/30 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">Actualizar</span>
                    </button>
                </header>

                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Chofer</th>
                                    <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Estado</th>
                                    <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Viajes (Mes)</th>
                                    <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Promedio / Día</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && drivers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/40">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                Cargando métricas...
                                            </div>
                                        </td>
                                    </tr>
                                ) : drivers.map((driver) => (
                                    <tr key={driver.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {driver.email.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{driver.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {driver.google_sheet_id ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    Conectado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Sin Hoja
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-xl font-bold text-white">{driver.stats.totalTrips}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-lg font-semibold text-purple-300">{driver.stats.averagePerDay}</span>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && drivers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/40">
                                            No hay choferes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}
