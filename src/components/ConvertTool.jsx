import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import yaml from 'js-yaml';
import Papa from 'papaparse';
import { jsonToXml } from '../utils/formatters';

export default function ConvertTool({ activeTool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const mode = activeTool?.mode || 'xml';

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
      const parsed = JSON.parse(input);
      let result = '';

      switch (mode) {
        case 'xml':
          result = jsonToXml(parsed);
          break;
        case 'yaml':
          result = yaml.dump(parsed);
          break;
        case 'csv':
        case 'tsv':
          // Papa.unparse works best with arrays of objects
          const dataForPapa = Array.isArray(parsed) ? parsed : [parsed];
          result = Papa.unparse(dataForPapa, {
            delimiter: mode === 'tsv' ? '\t' : ',',
            header: true
          });
          break;
        case 'string':
          result = JSON.stringify(JSON.stringify(parsed));
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
              placeholder={`Paste JSON here to convert to ${mode.toUpperCase()}...`}
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
