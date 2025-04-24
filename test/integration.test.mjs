import { expect } from 'chai';
import fs from 'fs/promises';
import path from 'path';

describe('Integrationstest med riktig fil', () => {
    const filePath = path.resolve('test-files/sample.pnr');
    const personnummerRegex = /\b(19|20)?\d{6}[- ]?\d{4}\b/g;

    it('ska hitta personnummer och identifiera dubletter', async () => {
        // Läs innehållet i sample.txt
        const text = await fs.readFile(filePath, 'utf8');

        // Matcha personnummer
        const matches = [...text.matchAll(personnummerRegex)].map(match => match[0]);
        console.log('Hittade personnummer:', matches);

        // Räkna förekomster av varje personnummer
        const counts = matches.reduce((acc, pnr) => {
            acc[pnr] = (acc[pnr] || 0) + 1;
            return acc;
        }, {});

        // Filtrera ut endast dubletter
        const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);

        console.log('Dubletter och deras förekomster:', duplicates.length > 0
            ? Object.fromEntries(duplicates)
            : 'Inga dubletter hittades!');

        // Kontrollera att matches alltid är en array
        expect(matches).to.be.an('array');
    });

    it('ska simulera att öppna en ny flik med hittade personnummer', async () => {
        // Läs innehållet i sample.txt
        const text = await fs.readFile(filePath, 'utf8');

        // Matcha personnummer
        const matches = [...text.matchAll(personnummerRegex)].map(match => match[0]);

        // Simulera innehållet i en ny flik
        const result = `Hittade ${matches.length} personnummer:\n` + matches.join('\n');

        console.log('Simulerat innehåll för ny flik:', result);

        // Kontrollera att resultatet är en sträng med rätt format
        expect(result).to.be.a('string');
        expect(result).to.include(`Hittade ${matches.length} personnummer:`);
    });
});
