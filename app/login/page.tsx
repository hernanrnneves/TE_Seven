'use client';
import { useState } from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert('Error: ' + error.message);
            } else {
                router.push('/chofer');
            }
        } catch (err) {
            alert('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground>
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/40 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center mb-8 space-y-4">
                    <div className="relative w-20 h-20 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Image
                            src="/driver_icon.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
                    <p className="text-blue-200/60 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20"
                                placeholder="chofer@trasp.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase tracking-wider">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 border-0 rounded-xl mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                    </Button>
                </form>
            </div>
        </AuroraBackground>
    );
}
