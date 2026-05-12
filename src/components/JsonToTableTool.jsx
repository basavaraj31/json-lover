import React, { useState, useMemo } from 'react';
import { Play, Hash, MoreVertical, Settings } from 'lucide-react';

const SAMPLE_JSON = `[
  {
    "id": "11",
    "name": "John Cena",
    "phoneNumber": "9876543210"
  },
  {
    "id": "12",
    "name": "mark D",
    "phoneNumber": "9876543211"
  },
  {
    "id": "13",
    "name": "Smith steev",
    "phoneNumber": "9876543212"
  }
]`;

export default function JsonToTableTool() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState(null);

  const handleConvert = () => {
    setError(null);
    setTableData(null);

    if (!input.trim()) return;

    try {
      let parsed = JSON.parse(input);

      // Ensure we are working with an array
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      // Extract unique top-level headers
      const headersSet = new Set();
      parsed.forEach(row => {
        if (typeof row === 'object' && row !== null) {
          Object.keys(row).forEach(key => headersSet.add(key));
        }
      });
      const headers = Array.from(headersSet);

      setTableData({ headers, rows: parsed });
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  // Run initial conversion
  useMemo(() => {
    if (input === SAMPLE_JSON && !tableData && !error) {
      handleConvert();
    }
  }, []);

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return '';

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', borderRight: '1px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', textAlign: 'left', fontWeight: 'bold' }}>key</th>
              <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', textAlign: 'left', fontWeight: 'bold' }}>value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(([k, v], i) => (
              <tr key={k} style={{ borderBottom: i < Object.keys(value).length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <td style={{ padding: '0.5rem', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>{k}</td>
                <td style={{ padding: '0.5rem' }}>{renderCellValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    return String(value);
  };

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, height: '100%' }}>
        <div className="pane" style={{ flex: '0 0 35%' }}>
          <div className="pane-header">
            <span>JSON Input</span>
            <button className="button" onClick={handleConvert}>
              <Play size={16} />
              <span>Convert</span>
            </button>
          </div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON array here..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="pane" style={{ flex: '1 1 auto', overflow: 'hidden' }}>
          <div className="pane-header">
            <span>Table Output</span>
          </div>
          <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)', padding: '0' }}>
            {error && (
              <div className="error-message" style={{ margin: '1rem' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {tableData && !error && (
              <div style={{ minWidth: '800px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px', padding: '1rem', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Settings size={16} />
                      </th>
                      {tableData.headers.map(header => (
                        <th key={header} style={{ padding: '1rem', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Hash size={14} style={{ color: 'var(--text-secondary)' }} />
                              <span>{header}</span>
                            </div>
                            <MoreVertical size={14} style={{ color: 'var(--text-secondary)' }} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                        <td style={{ padding: '1rem', borderRight: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '500' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {index + 1}
                            <MoreVertical size={14} style={{ opacity: 0.5 }} />
                          </div>
                        </td>
                        {tableData.headers.map(header => (
                          <td key={header} style={{ padding: '1rem', borderRight: '1px solid var(--border-color)', verticalAlign: 'top', color: 'var(--text-primary)' }}>
                            {renderCellValue(row[header])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!tableData && !error && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Table will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
