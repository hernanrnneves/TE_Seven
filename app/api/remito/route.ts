import { NextResponse } from 'next/server';
import { appendRemitoToSheet } from '@/lib/sheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { remitoNumber, date, amount, sheetId } = body;

        // Basic Validation
        if (!sheetId) {
            return NextResponse.json(
                { error: "Falta el ID de la Hoja de Cálculo (sheetId)" },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing Sheets Credentials' },
                { status: 500 }
            );
        }

        await appendRemitoToSheet(sheetId, {
            remitoNumber,
            date,
            amount,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
