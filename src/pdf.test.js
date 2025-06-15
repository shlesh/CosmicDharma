import { expect, test } from 'vitest';
import { generatePdf } from './pdf';

test('generatePdf returns jsPDF instance', () => {
  const profile = {
    request: { name: 'Test', birthDate: '2000-01-01', birthTime: '12:00', location: 'Delhi' },
    birthInfo: { latitude: 10, longitude: 20 },
    planetaryPositions: [{ name: 'Moon', sign: 'Aries', degree: 10 }],
    vimshottariDasha: [{ lord: 'Ketu', start: '2020-01-01', end: '2021-01-01' }],
  };
  const doc = generatePdf(profile);
  expect(doc).toBeDefined();
  expect(typeof doc.save).toBe('function');
});
