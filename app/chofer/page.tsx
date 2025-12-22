'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Check, AlertTriangle, Loader2, LogOut, FileSpreadsheet } from 'lucide-react';
import { extractRemitoData } from '@/lib/ocr';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function ChoferPage() {
    const [image, setImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState({
        remitoNumber: '',
        date: '',
        amount: '',
    });
    const [sheetId, setSheetId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Auth Check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserEmail(session.user.email || 'Chofer');

            // Fetch assigned Sheet ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('google_sheet_id')
                .eq('id', session.user.id)
                .single();

            if (profile?.google_sheet_id) {
                setSheetId(profile.google_sheet_id);
            } else {
                // Fallback or Alert? For now, we'll let them know
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProcessImage = async () => {
        if (!image) return;
        setProcessing(true);
        try {
            const result = await extractRemitoData(image);
            setData(result);
        } catch (error) {
            alert('Error al procesar la imagen');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!sheetId) {
            alert('Error Crítico: No tienes una Hoja de Cálculo asignada. Contacta al administrador.');
            return;
        }

        setUploading(true);
        try {
            const response = await fetch('/api/remito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    sheetId: sheetId // Send the user's specific sheet ID
                }),
            });

            if (response.ok) {
                alert('¡Remito guardado correctamente en TU hoja de cálculo!');
                setImage(null);
                setData({ remitoNumber: '', date: '', amount: '' });
            } else {
                alert('Error al guardar en Google Sheets');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AuroraBackground>
            <div className="w-full max-w-lg mx-auto p-4 z-10 relative">
                <header className="flex items-center justify-between mb-8 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/driver_icon.png"
                                alt="Chofer"
                                fill
                                className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Panel Chofer</h1>
                            <p className="text-xs text-blue-200/60 truncate max-w-[150px]">{userEmail}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div
                            title={sheetId ? "Hoja Conectada" : "Hoja No Asignada"}
                            className={`p-2 rounded-lg border ${sheetId ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                        >
                            <FileSpreadsheet size={20} />
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Cámara / Upload */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                        {!image ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="w-8 h-8 text-blue-400" />
                                </div>
                                <p className="text-white font-medium">Tocar para tomar foto</p>
                                <p className="text-white/40 text-sm mt-1">o subir archivo</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img src={image} alt="Preview" className="w-full h-auto object-cover" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                                >
                                    <AlertTriangle size={20} />
                                </button>
                            </div>
                        )}

                        {image && (
                            <Button
                                onClick={handleProcessImage}
                                disabled={processing}
                                className="w-full mt-4 h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 rounded-xl"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" />
                                        Procesando IA...
                                    </>
                                ) : (
                                    '1. Procesar Remito'
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Formulario de Verificación */}
                    {data.remitoNumber && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-400" />
                                Verificar Datos
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase text-white/40 font-semibold ml-1">N° Remito</label>
                                    <input
                                        type="text"
                                        value={data.remitoNumber}
                                        onChange={(e) => setData({ ...data, remitoNumber: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-mono text-lg focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase text-white/40 font-semibold ml-1">Fecha</label>
                                        <input
                                            type="text"
                                            value={data.date}
                                            onChange={(e) => setData({ ...data, date: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-white/40 font-semibold ml-1">Monto ($)</label>
                                        <input
                                            type="text"
                                            value={data.amount}
                                            onChange={(e) => setData({ ...data, amount: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleConfirm}
                                    disabled={uploading || !sheetId}
                                    className={`w-full h-14 text-lg font-bold rounded-xl mt-2 ${!sheetId ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20'}`}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        '2. Confirmar y Guardar'
                                    )}
                                </Button>
                                {!sheetId && <p className="text-red-400 text-xs text-center">Falta asignar hoja de cálculo</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuroraBackground>
    );
}
