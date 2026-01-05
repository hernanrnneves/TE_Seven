'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Check, AlertTriangle, Loader2, LogOut, FileSpreadsheet, Truck } from 'lucide-react';
import { extractRemitoData } from '@/lib/ocr';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { compressImage } from '@/lib/image-utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChoferPage() {
    const [image, setImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState({
        remitoNumber: '',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD for native date picker
        destination: 'Siat',
    });
    const [manualDestination, setManualDestination] = useState('');
    const [processed, setProcessed] = useState(false);
    const destinations = ['Varela', 'Haedo', 'Ferrosider', 'Caning', 'Siat', 'Bobina', 'Chapa', 'Otros'];
    const [sheetId, setSheetId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
            const meta = session.user.user_metadata;
            if (meta?.first_name && meta?.last_name) {
                setUserName(`${meta.first_name} ${meta.last_name}`);
            } else if (meta?.full_name) {
                setUserName(meta.full_name);
            }

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
            setProcessed(false); // Reset on new upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const extractSheetId = (input: string): string => {
        const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : input.trim();
    };

    const handleProcessImage = async () => {
        if (!image) return;
        setProcessing(true);
        try {
            const result = await extractRemitoData(image);
            setData({
                remitoNumber: result.remitoNumber,
                date: result.date,
                destination: 'SIAT'
            });
            setProcessed(true); // Show form after processing
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Error al procesar la imagen. Puedes intentar de nuevo o completar los datos manualmente.'
            });
            setProcessed(true); // Still show form so they can enter manually
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!sheetId) {
            setNotification({
                type: 'error',
                message: 'Error Crítico: No tienes una Hoja de Cálculo asignada. Contacta al administrador.'
            });
            return;
        }

        if (!image) return;

        setUploading(true);
        try {
            // 1. Get readable date for Sheets
            const [year, month, day] = data.date.split('-');
            const displayDate = `${day}/${month}/${year}`;

            // 2. Compress Image to WebP
            const blob = await compressImage(image);
            const fileName = `remito_${Date.now()}.webp`;
            const cleanSheetId = extractSheetId(sheetId);
            const filePath = `${cleanSheetId}/${fileName}`;

            // 2. Upload to Supabase Storage (Bucket 'remitos' must exist)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('remitos')
                .upload(filePath, blob, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Storage Error Detail:', uploadError);
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error('Configuración incompleta: El bucket "remitos" no existe en Supabase Storage. Créalo desde el dashboard.');
                }
                throw new Error(`Error de almacenamiento: ${uploadError.message} (Asegúrate de haber configurado las Políticas RLS)`);
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('remitos')
                .getPublicUrl(filePath);

            // 3. Save to Google Sheets via API
            const response = await fetch('/api/remito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: displayDate,
                    remitoNumber: data.remitoNumber,
                    destination: data.destination === 'Otros' ? manualDestination : data.destination,
                    sheetId: sheetId,
                    imageUrl: publicUrl // Store the image reference
                }),
            });

            if (response.ok) {
                setNotification({
                    type: 'success',
                    message: '¡Remito guardado correctamente!'
                });
                setImage(null);
                setProcessed(false);
                setData({
                    remitoNumber: '',
                    date: new Date().toISOString().split('T')[0],
                    destination: 'Siat'
                });
                setManualDestination('');
            } else {
                const errorResult = await response.json();
                setNotification({
                    type: 'error',
                    message: `Error: ${errorResult.error || 'No se pudo guardar en Google Sheets'}`
                });
            }
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: error.message || 'Error de conexión'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <AuroraBackground>
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                    >
                        <div className={`p-4 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 ${notification.type === 'success'
                            ? 'bg-green-500/20 border-green-500/30 text-green-200'
                            : 'bg-red-500/20 border-red-500/30 text-red-200'
                            }`}>
                            {notification.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                            <p className="text-sm font-medium leading-tight">{notification.message}</p>
                            <button
                                onClick={() => setNotification(null)}
                                className="ml-auto opacity-50 hover:opacity-100 p-1"
                            >
                                <AlertTriangle className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-lg mx-auto p-4 z-10 relative">
                <header className="flex items-center justify-between mb-8 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Truck className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {userName ? `Hola, ${userName}` : 'Panel Chofer'}
                            </h1>
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
                            <div className="space-y-4">
                                <div
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.setAttribute('capture', 'environment');
                                            fileInputRef.current.click();
                                        }
                                    }}
                                    className="border-2 border-dashed border-blue-500/30 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Camera className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-white font-medium">Sacar Foto con Cámara</p>
                                </div>

                                <div
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.removeAttribute('capture');
                                            fileInputRef.current.click();
                                        }
                                    }}
                                    className="border-2 border-dashed border-white/10 rounded-2xl h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all group text-white/60 hover:text-white"
                                >
                                    <div className="flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        <span className="font-medium">Cargar desde Dispositivo</span>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img src={image} alt="Preview" className="w-full h-auto object-cover" />
                                <button
                                    onClick={() => { setImage(null); setProcessed(false); }}
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
                    {processed && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                                Ficha de Remito
                            </h3>

                            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden mb-6">
                                <div className="grid grid-cols-2 border-b border-white/10">
                                    <div className="p-3 border-r border-white/10 bg-white/5 relative group/date">
                                        <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">Fecha</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={data.date ? `${data.date.split('-')[2]}/${data.date.split('-')[1]}/${data.date.split('-')[0]}` : ''}
                                                className="w-full bg-transparent text-white font-bold outline-none cursor-pointer focus:text-blue-400 transition-colors"
                                                onClick={() => {
                                                    const picker = document.getElementById('date-picker') as HTMLInputElement;
                                                    if (picker) {
                                                        try {
                                                            picker.showPicker();
                                                        } catch (e) {
                                                            picker.click();
                                                        }
                                                    }
                                                }}
                                            />
                                            <input
                                                id="date-picker"
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData({ ...data, date: e.target.value })}
                                                className="absolute inset-0 opacity-0 pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5">
                                        <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">N° Remito</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={data.remitoNumber}
                                            onChange={(e) => setData({ ...data, remitoNumber: e.target.value })}
                                            className="w-full bg-transparent text-white font-mono font-bold outline-none focus:text-blue-400 transition-colors"
                                            placeholder="0000-0000"
                                        />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <label className="block text-[10px] uppercase text-white/40 font-bold mb-3">Destino Seleccionado</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {destinations.map((dest) => (
                                            <button
                                                key={dest}
                                                type="button"
                                                onClick={() => setData({ ...data, destination: dest })}
                                                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${data.destination === dest
                                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                {dest}
                                            </button>
                                        ))}
                                    </div>

                                    {data.destination === 'Otros' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 pt-4 border-t border-white/5"
                                        >
                                            <label className="block text-[10px] uppercase text-white/40 font-bold mb-2">Ingresar Destino Manualmente</label>
                                            <input
                                                type="text"
                                                value={manualDestination}
                                                onChange={(e) => setManualDestination(e.target.value)}
                                                placeholder="Ej: Depósito Central"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-all placeholder:text-white/20"
                                            />
                                        </motion.div>
                                    )}
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
                    )}
                </div>
            </div>
        </AuroraBackground>
    );
}
