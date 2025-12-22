'use client';

import { AuroraBackground } from '@/components/ui/aurora-background';
import Link from 'next/link';
import { Truck, ShieldCheck } from 'lucide-react';
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
        <div className="text-center space-y-4 max-w-lg z-10 flex flex-col items-center mb-10">
          <div className="relative w-40 h-40 mb-6 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
            <Image
              src="/Gemini_Generated_Image_wmc0qwwmc0qwwmc0.png"
              alt="Transporte Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10"
            />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
            TRASP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Seven</span>
          </h1>
          <p className="text-xl text-blue-200/80 font-light tracking-wide">
            Control de Transporte &bull; Gestión Inteligente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
          <Link href="/login" className="group">
            <div className="relative h-full p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col items-center text-center space-y-4 z-10">
                <div className="relative w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src="/driver_icon.png"
                    alt="Chofer"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Choferes</h2>
                  <p className="text-blue-200/60 text-sm md:text-base">Ingresar para cargar remitos y comprobantes.</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/dashboard" className="group">
            <div className="relative h-full p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col items-center text-center space-y-4 z-10">
                <div className="relative w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src="/admin_icon.png"
                    alt="Admin"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Administración</h2>
                  <p className="text-purple-200/60 text-sm md:text-base">Panel de control y seguimiento de flota.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <footer className="mt-12 text-xs text-white/20 font-mono z-10">
          TRASP SEVEN SYSTEMS &copy; 2025
        </footer>
      </motion.div>
    </AuroraBackground>
  );
}
