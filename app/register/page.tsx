'use client';
import { useState } from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, User, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            if (error) {
                alert('Error: ' + error.message);
            } else {
                if (data.session) {
                    // Session active immediately (Email confirm disabled)
                    alert('Cuenta creada exitosamente. Bienvenido.');
                    router.push('/chofer');
                } else {
                    // Session not active (Email confirm enabled)
                    alert('Cuenta creada. Por favor revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
                    router.push('/login');
                }
            }
        } catch (err) {
            alert('Ocurrió un error inesperado al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground>
            <div className="relative z-10 w-full max-w-md p-8 bg-black/40 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
                <Link href="/login" className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <div className="flex flex-col items-center mb-6 space-y-4">
                    <div className="relative w-24 h-24 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Crear Cuenta</h1>
                    <p className="text-blue-200/60 text-sm">Regístrate para comenzar</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                    placeholder="Juan"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase">Apellido</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                    placeholder="Pérez"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                placeholder="chofer@trasp.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-blue-200/80 ml-1 uppercase">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 border-0 rounded-xl mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Registrarse'}
                    </Button>
                    <p className="text-center text-xs text-white/30 mt-4">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">Inicia Sesión</Link>
                    </p>
                </form>
            </div>
        </AuroraBackground>
    );
}
