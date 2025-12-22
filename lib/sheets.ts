import { google } from 'googleapis';

export async function appendRemitoToSheet(
    spreadsheetId: string,
    data: {
        remitoNumber: string;
        date: string;
        amount: string;
        timestamp: string;
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

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Hoja 1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [data.timestamp, data.remitoNumber, data.date, data.amount],
                ],
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error adding to sheet:', error);
        throw error;
    }
}
