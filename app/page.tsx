'use client';

import { AuroraBackground } from '@/components/ui/aurora-background';
import Link from 'next/link';
import { Truck, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-center space-y-2 max-w-2xl z-10 flex flex-col items-center mb-16">
          <div className="relative w-full max-w-[450px] aspect-[2/1] group">
            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
            <Image
              src="/logo.png"
              alt="Transporte Seven Logo"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] z-10 transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
          </div>
          <p className="text-xl text-blue-100/40 font-bold tracking-[0.3em] uppercase mt-8 animate-pulse">
            Logística Inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-6">
          <Link href="/login" className="group">
            <div className="relative h-full p-8 rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex flex-col items-center text-center space-y-6 z-10">
                <div className="relative w-32 h-32 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Truck className="w-24 h-24 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Choferes</h2>
                  <p className="text-blue-200/50 text-base leading-relaxed max-w-[200px]">Carga de remitos y gestión de viajes en tiempo real.</p>
                </div>
                <div className="pt-2">
                  <div className="px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    Ingresar ahora
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/dashboard" className="group">
            <div className="relative h-full p-8 rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex flex-col items-center text-center space-y-6 z-10">
                <div className="relative w-32 h-32 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
                  <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <LayoutDashboard className="w-24 h-24 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Administración</h2>
                  <p className="text-purple-200/50 text-base leading-relaxed max-w-[200px]">Control de flota, estadísticas y reportes globales.</p>
                </div>
                <div className="pt-2">
                  <div className="px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    Ir al Panel
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <footer className="mt-20 text-[10px] text-white/10 font-bold uppercase tracking-[0.4em] z-10">
          Transporte Seven Systems &bull; MMXXV
        </footer>
      </motion.div>
    </AuroraBackground>
  );
}
