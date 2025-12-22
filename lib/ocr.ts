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

        // Basic heuristic extraction
        const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
        const amountRegex = /\$\s?[\d,.]+/;
        const remitoRegex = /Remito\sN[°o]\s?(\d+-\d+)/i;

        const dateMatch = text.match(dateRegex);
        const amountMatch = text.match(amountRegex);
        const remitoMatch = text.match(remitoRegex);

        return {
            remitoNumber: remitoMatch ? remitoMatch[1] : '',
            date: dateMatch ? dateMatch[0] : '',
            amount: amountMatch ? amountMatch[0] : '',
            rawText: text
        };
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Error procesando la imagen.");
    }
}
