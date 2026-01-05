import { NextResponse } from 'next/server';
import { appendRemitoToSheet } from '@/lib/sheets';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { remitoNumber, date, destination, sheetId, imageUrl } = body;

        // Basic Validation
        if (!sheetId) {
            return NextResponse.json(
                { error: "Falta el ID de la Hoja de Cálculo (sheetId). Asegúrate de tener una asignada en tu perfil de Supabase." },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
            console.error('SERVER ERROR: Missing Google Sheets Environment Variables');
            return NextResponse.json(
                { error: 'Configuración de servidor incompleta: Faltan credenciales de Google Sheets (Env Vars).' },
                { status: 500 }
            );
        }

        const now = new Date();
        const timestamp = now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        await appendRemitoToSheet(sheetId, {
            remitoNumber,
            date,
            destination,
            timestamp,
            imageUrl,
        });

        // 3. Optional: Save to Supabase 'remitos' table if it exists
        try {
            await supabase.from('remitos').insert({
                remito_number: remitoNumber,
                date: date,
                destination: destination,
                image_url: imageUrl,
                sheet_id: sheetId
            });
        } catch (dbError) {
            console.warn('Database Backup log failed (table might not exist):', dbError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Error Detailed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
