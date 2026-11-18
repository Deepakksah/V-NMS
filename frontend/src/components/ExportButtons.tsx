import React from 'react';
import { FileSpreadsheet, FileCode } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../utils/exportData';

interface ExportButtonsProps {
  data: any[];
  filenamePrefix: string;
  columnHeaders?: Record<string, string>;
  title?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  filenamePrefix,
  columnHeaders,
  title
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={() => exportToCSV(data, filenamePrefix, columnHeaders)}
        title={title ? `Export ${title} to CSV (Excel compatible)` : 'Export table to CSV'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 9px',
          fontSize: '0.72rem',
          fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.22)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)'}
      >
        <FileSpreadsheet size={13} />
        <span>Export CSV</span>
      </button>

      <button
        onClick={() => exportToJSON(data, filenamePrefix)}
        title={title ? `Export ${title} to JSON format` : 'Export table to JSON'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 9px',
          fontSize: '0.72rem',
          fontWeight: 600,
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#38bdf8',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.22)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)'}
      >
        <FileCode size={13} />
        <span>Export JSON</span>
      </button>
    </div>
  );
};
