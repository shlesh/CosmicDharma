import jsPDF from 'jspdf';

export function generatePdf(profile) {
  const doc = new jsPDF();
  const margin = 10;
  let y = margin;

  const addLine = (text) => {
    doc.text(text, margin, y);
    y += 7;
  };

  const birth = {
    name: profile.request?.name || '',
    date: profile.request?.birthDate || '',
    time: profile.request?.birthTime || '',
    location: profile.request?.location || '',
    latitude: profile.birthInfo?.latitude,
    longitude: profile.birthInfo?.longitude,
  };

  doc.setFontSize(16);
  doc.text('Vedic Astrology Profile', margin, y);
  y += 10;

  doc.setFontSize(12);
  addLine(`Name: ${birth.name}`);
  addLine(`Date: ${birth.date} Time: ${birth.time}`);
  addLine(`Place: ${birth.location}`);
  if (birth.latitude !== undefined && birth.longitude !== undefined) {
    addLine(
      `Coordinates: ${birth.latitude.toFixed(4)}, ${birth.longitude.toFixed(4)}`
    );
  }
  y += 4;

  if (Array.isArray(profile.planetaryPositions)) {
    addLine('Planetary Positions:');
    profile.planetaryPositions.forEach((p) => {
      addLine(`- ${p.name}: ${p.sign} ${p.degree.toFixed(2)}°`);
    });
    y += 4;
  }

  if (Array.isArray(profile.vimshottariDasha)) {
    addLine('Vimshottari Dasha:');
    profile.vimshottariDasha.forEach((d) => {
      addLine(`- ${d.lord}: ${d.start} – ${d.end}`);
    });
    y += 4;
  }

  const dateStr = new Date().toISOString();
  doc.setFontSize(10);
  doc.text(`Generated on ${dateStr}`, margin, 287);

  return doc;
}
