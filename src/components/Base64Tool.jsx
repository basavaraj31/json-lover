import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';

export default function Base64Tool({ activeTool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Clear output on tool change
  useEffect(() => {
    setOutput('');
    setError(null);
  }, [activeTool.id]);

  const isValidBase64 = (str) => {
    if (str ==='' || str.trim() === '') return false;
    try {
      return btoa(atob(str)) === str || btoa(atob(str.replace(/=+$/, ''))) === str.replace(/=+$/, '');
    } catch (err) {
      return false;
    }
  };

  const toBinary = (str) => {
    return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  };

  const fromBinary = (str) => {
    return str.replace(/\s/g, '').match(/.{1,8}/g)?.map(bin => String.fromCharCode(parseInt(bin, 2))).join('') || '';
  };

  const toHex = (str) => {
    return str.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  };

  const fromHex = (str) => {
    const cleanHex = str.replace(/[^0-9A-Fa-f]/g, '');
    let result = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      result += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
    }
    return result;
  };

  const handleProcess = () => {
    setError(null);
    setOutput('');

    if (!input) return;

    try {
      let res = '';
      const mode = activeTool.id;

      switch (mode) {
        case 'base64-encode':
        case 'string-to-base64':
        case 'utf8-to-base64':
          // UTF-8 safe base64 encoding
          res = btoa(unescape(encodeURIComponent(input)));
          break;
        case 'ascii-to-base64':
          res = btoa(input);
          break;
        case 'base64-decode':
        case 'base64-to-string':
        case 'base64-to-utf8':
          // UTF-8 safe base64 decoding
          res = decodeURIComponent(escape(atob(input)));
          break;
        case 'base64-to-ascii':
          res = atob(input);
          break;
        case 'base64-validator':
          res = isValidBase64(input) ? "Valid Base64 String!" : "Invalid Base64 String.";
          break;
        case 'base64url-encode':
          res = btoa(unescape(encodeURIComponent(input))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          break;
        case 'base64url-decode':
          let base64url = input.replace(/-/g, '+').replace(/_/g, '/');
          while (base64url.length % 4) {
            base64url += '=';
          }
          res = decodeURIComponent(escape(atob(base64url)));
          break;
        case 'hex-to-base64':
          res = btoa(fromHex(input));
          break;
        case 'base64-to-hex':
          res = toHex(atob(input));
          break;
        case 'binary-to-base64':
          res = btoa(fromBinary(input));
          break;
        case 'base64-to-binary':
          res = toBinary(atob(input));
          break;
        default:
          res = 'Unknown mode';
      }

      setOutput(res);
    } catch (err) {
      setError(`Error: Invalid input for this conversion. (${err.message})`);
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
            <span>Input</span>
            <button className="button" onClick={handleProcess}>
              <Play size={16} />
              <span>Process</span>
            </button>
          </div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your input here..."
              spellCheck="false"
            />
          </div>
        </div>
        
        <div className="pane">
          <div className="pane-header">
            <span>Output</span>
            <button className="button secondary" onClick={handleCopy} disabled={!output}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)' }}>
            {error && (
              <div className="error-message">
                <strong>{error}</strong>
              </div>
            )}

            {output && !error && activeTool.id === 'base64-validator' && (
              <div className={output.includes('Valid') ? 'success-message' : 'error-message'} style={{ margin: '1rem' }}>
                <strong>{output}</strong>
              </div>
            )}

            {output && !error && activeTool.id !== 'base64-validator' && (
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
