import { google } from 'googleapis';

function extractSheetId(input: string): string {
    // If it looks like a URL, extract the part between /d/ and /
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
}

export async function appendRemitoToSheet(
    rawSpreadsheetId: string,
    data: {
        remitoNumber: string;
        date: string;
        destination: string;
        timestamp: string;
        imageUrl?: string;
    }
) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = extractSheetId(rawSpreadsheetId);

        console.log('Attempting to append to Sheet:', { spreadsheetId, range: 'Hoja 1!A:E' });
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Hoja 1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [data.timestamp, data.remitoNumber, data.date, data.destination, data.imageUrl || ''],
                ],
            },
        });
        console.log('Google Sheets Sync Response:', response.status, response.statusText);
        return response.data;
    } catch (error: any) {
        console.error('Error adding to sheet:', error);
        if (error.code === 404) {
            throw new Error('No se encontró la planilla o la pestaña "Hoja 1". Verifica que la pestaña se llame exactamente "Hoja 1" y que el ID sea correcto.');
        }
        if (error.code === 403) {
            throw new Error('Permiso denegado: Asegúrate de que el email de la Service Account tenga permisos de Editor en la planilla.');
        }
        throw error;
    }
}

export async function getDriverStats(rawSpreadsheetId: string) {
    try {
        const spreadsheetId = extractSheetId(rawSpreadsheetId);
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Hoja 1!A:C', // Reading Timestamp, Remito, Date
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return { totalTrips: 0, averagePerDay: 0 };
        }

        // Filter for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthlyTrips = 0;
        const tripDates = new Set<string>();

        rows.forEach((row) => {
            // Check if row has valid date (assuming col 0 is timestamp or col 2 is date)
            // Our append format: [timestamp, remitoNumber, date, amount]
            // We read A:C, so:
            // row[0] = timestamp
            // row[1] = remitoNumber
            // row[2] = date (string like "22/12/2025" or similar from OCR)

            // Let's use the timestamp (row[0]) for reliability if available, else date string
            const timestamp = row[0];
            if (timestamp) {
                const dateObj = new Date(timestamp);
                if (!isNaN(dateObj.getTime())) {
                    if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
                        monthlyTrips++;
                        tripDates.add(dateObj.toDateString());
                    }
                }
            }
        });

        const activeDays = tripDates.size || 1;
        // Or should average be over days passed in month? 
        // User asked "promedio de viajes que hizo por dia". 
        // Usually means (Total Trips) / (Working Days) or (Total Trips) / (Current Day of Month).
        // Let's go with (Total Trips) / (Active Days) for now as it's fairer, or we can refine.

        const averagePerDay = Number((monthlyTrips / activeDays).toFixed(1));

        return {
            totalTrips: monthlyTrips,
            averagePerDay
        };

    } catch (error) {
        console.error('Error getting stats:', error);
        return { totalTrips: 0, averagePerDay: 0 }; // Return stats even on error
    }
}
