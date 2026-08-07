import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 * @param {string} filename  - e.g. "payments_report"
 * @param {string} sheetName - e.g. "Payments"
 * @param {string[]} headers - column headers
 * @param {string[][]} rows  - 2D array of row data
 */
export function exportExcel(filename, sheetName, headers, rows) {
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto column width
    const colWidths = headers.map((h, i) => ({
        wch: Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_${today()}.xlsx`);
}

/**
 * Export data to PDF
 * @param {string}   title   - report title shown at top
 * @param {string[]} headers - column headers
 * @param {string[][]} rows  - 2D array of row data
 */
export function exportPDF(title, headers, rows) {
    const doc = new jsPDF({ orientation: rows[0]?.length > 6 ? 'landscape' : 'portrait' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('EventSphere', 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(title, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 33);

    autoTable(doc, {
        startY: 40,
        head: [headers],
        body: rows,
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
    });

    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${today()}.pdf`);
}

/**
 * Preview data in a new browser tab as an HTML table
 */
export function previewHTML(title, headers, rows) {
    const tableRows = rows.map(r =>
        `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} — EventSphere</title>
  <style>
    body { font-family: Inter, sans-serif; padding: 32px; color: #1e293b; background: #f8fafc; }
    h1 { font-size: 22px; color: #6366f1; margin-bottom: 4px; }
    p  { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
    th { background: #6366f1; color: #fff; text-align: left; padding: 12px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .4px; }
    td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f1f5f9; }
    @media print { body { background: #fff; padding: 0; } }
  </style>
</head>
<body>
  <h1>EventSphere — ${title}</h1>
  <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

function today() {
    return new Date().toISOString().slice(0, 10);
}
