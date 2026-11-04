const HEADER = [
  'timestamp',
  'source',
  'air_raw',
  'gas_raw',
  'dust_ugm3',
  'temp_c',
  'humidity_pct',
  'o2_pct',
];

export function csvCell(value) {
  if (value == null) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(readings) {
  const lines = [HEADER.join(',')];
  for (const reading of readings) {
    lines.push(
      [
        new Date(reading.ts).toISOString(),
        reading.source,
        reading.aqi,
        reading.gas,
        reading.dust,
        reading.temp,
        reading.hum,
        reading.o2 ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return `${lines.join('\r\n')}\r\n`;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
