// Enterprise Data Export Utilities (CSV & JSON) for V-NMS Tables & Telemetry

/**
 * Format current timestamp for filenames: YYYYMMDD_HHMMSS
 */
function getTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Triggers a native browser file download from a Blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean & format a cell value for CSV
 */
function formatCSVCell(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    if (val instanceof Date) return val.toISOString();
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export any array of objects to standard CSV format
 */
export function exportToCSV(data: any[], filenamePrefix: string, columnHeaders?: Record<string, string>): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Determine headers from data keys or custom mapping
  const sample = data[0];
  const keys = columnHeaders ? Object.keys(columnHeaders) : Object.keys(sample);
  const headerLabels = keys.map(k => (columnHeaders && columnHeaders[k]) ? columnHeaders[k] : k);

  const csvRows: string[] = [];
  // 1. Header row
  csvRows.push(headerLabels.map(formatCSVCell).join(','));

  // 2. Data rows
  for (const row of data) {
    const rowValues = keys.map(k => formatCSVCell(row[k]));
    csvRows.push(rowValues.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // Include UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filenamePrefix}_${getTimestamp()}.csv`);
}

/**
 * Export any array of objects or telemetry object directly to pretty JSON
 */
export function exportToJSON(data: any, filenamePrefix: string): void {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    alert('No data available to export.');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${filenamePrefix}_${getTimestamp()}.json`);
}
