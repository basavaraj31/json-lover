import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { XMLParser } from 'fast-xml-parser';
import yaml from 'js-yaml';
import Papa from 'papaparse';

export default function XmlConvertTool({ activeTool }) {
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

  function handleConvert() {
    setError(null);
    setOutput('');

    if (!input.trim()) return;

    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
      });
      
      const parsedObj = parser.parse(input);

      // Check if fast-xml-parser failed or returned empty (it doesn't throw on all bad XML, sometimes it just returns a string or empty object)
      if (typeof parsedObj !== 'object' || parsedObj === null || Object.keys(parsedObj).length === 0) {
          throw new Error('Invalid or empty XML structure.');
      }

      let result = '';

      switch (mode) {
        case 'json':
          result = JSON.stringify(parsedObj, null, 2);
          break;
        case 'yaml':
          result = yaml.dump(parsedObj);
          break;
        case 'csv':
        case 'tsv': {
          // For CSV/TSV, we want to flatten. Let's try to find an array in the parsed object if the root isn't one.
          // In XML, repeated tags become arrays. We extract the first array we find, or just wrap the object.
          let dataForPapa = [parsedObj];
          
          // Basic heuristic to find the main array of data in the parsed XML
          const rootKeys = Object.keys(parsedObj);
          if (rootKeys.length === 1) {
            const root = parsedObj[rootKeys[0]];
            if (typeof root === 'object' && root !== null) {
                const childKeys = Object.keys(root);
                if (childKeys.length === 1 && Array.isArray(root[childKeys[0]])) {
                    dataForPapa = root[childKeys[0]];
                } else if (Array.isArray(root)) {
                    dataForPapa = root;
                }
            }
          }

          result = Papa.unparse(dataForPapa, {
            delimiter: mode === 'tsv' ? '\t' : ',',
            header: true
          });
          break;
        }
        case 'string':
          result = JSON.stringify(input);
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
            <span>XML Input</span>
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
              placeholder={`Paste XML here to convert to ${mode.toUpperCase()}...`}
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
