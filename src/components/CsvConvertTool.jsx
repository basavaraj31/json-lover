import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import yaml from 'js-yaml';
import Papa from 'papaparse';
import { jsonToXml } from '../utils/formatters';

export default function CsvConvertTool({ activeTool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const mode = activeTool?.mode || 'json';

  useEffect(() => {
    if (input.trim()) {
      handleConvert();
    }
  }, [mode]);

  const handleConvert = () => {
    setError(null);
    setOutput('');

    if (!input.trim()) return;

    try {
      // Parse CSV input
      const parsed = Papa.parse(input.trim(), {
        header: true,
        skipEmptyLines: true
      });

      if (parsed.errors && parsed.errors.length > 0) {
        // Papaparse is very forgiving, but if there are critical errors we should show them
        // Let's just grab the first error if it exists
        const err = parsed.errors[0];
        throw new Error(`${err.message} (Row: ${err.row})`);
      }

      if (!parsed.data || parsed.data.length === 0) {
        throw new Error('Invalid or empty CSV structure.');
      }

      const parsedObj = parsed.data;
      let result = '';

      switch (mode) {
        case 'json':
          result = JSON.stringify(parsedObj, null, 2);
          break;
        case 'xml':
          result = jsonToXml(parsedObj);
          break;
        case 'yaml':
          result = yaml.dump(parsedObj);
          break;
        case 'html':
          // Generate an HTML table from the CSV data
          const headers = parsed.meta.fields || Object.keys(parsedObj[0] || {});
          let html = '<table border="1">\n  <thead>\n    <tr>\n';
          headers.forEach(h => {
            html += `      <th>${h}</th>\n`;
          });
          html += '    </tr>\n  </thead>\n  <tbody>\n';
          
          parsedObj.forEach(row => {
            html += '    <tr>\n';
            headers.forEach(h => {
              html += `      <td>${row[h]}</td>\n`;
            });
            html += '    </tr>\n';
          });
          html += '  </tbody>\n</table>';
          result = html;
          break;
        default:
          result = 'Unknown conversion mode';
      }

      setOutput(result);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, height: '100%' }}>
        <div className="pane">
          <div className="pane-header">
            <span>CSV Input</span>
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
              placeholder={`Paste CSV data here to convert to ${mode.toUpperCase()}...`}
              spellCheck="false"
            />
          </div>
        </div>
        
        <div className="pane">
          <div className="pane-header">
            <span>{mode.toUpperCase()} Output</span>
            <button className="button secondary" onClick={handleCopy} disabled={!output}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)' }}>
            {error && (
              <div className="error-message">
                <strong>Conversion Failed:</strong> {error}
              </div>
            )}

            {output && !error && (
              <pre style={{ 
                padding: '1rem', 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.9rem', 
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {output}
              </pre>
            )}

            {!output && !error && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Result will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
