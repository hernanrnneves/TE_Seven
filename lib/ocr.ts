import Tesseract from 'tesseract.js';

export interface RemitoData {
    remitoNumber: string;
    date: string;
    amount: string;
    rawText: string;
}

export async function extractRemitoData(imagePath: string): Promise<RemitoData> {
    try {
        const result = await Tesseract.recognize(imagePath, 'spa', {
            // logger: (m) => console.log(m),
        });

        const text = result.data.text;

        // Improved Heuristic extraction
        const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
        const amountRegex = /(?:[\$]|Total|Monto)[:\s]*([\d,.]+)/i;
        const remitoRegex = /(?:Remito|N[°o]|Nro)[:\s]*(\d+[-\s]*\d+)/i;

        const dateMatch = text.match(dateRegex);
        const amountMatch = text.match(amountRegex);
        const remitoMatch = text.match(remitoRegex);

        return {
            remitoNumber: remitoMatch ? remitoMatch[1].replace(/\s/g, '') : '',
            date: dateMatch ? dateMatch[1] : '',
            amount: amountMatch ? amountMatch[1] : '',
            rawText: text
        };
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Error procesando la imagen.");
    }
}
