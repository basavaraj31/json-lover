import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';

// Utility for syntax highlighting JSON
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// Utility to deep sort JSON keys recursively
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
}

export default function SinglePaneTool({ activeTool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset state on tool change
    setError(null);
    setSuccess(false);
    if (activeTool.id === 'validator' || activeTool.id === 'parser') {
      processJSON(); // Auto-process on switch if we have input
    }
  }, [activeTool.id]);

  const processJSON = () => {
    setError(null);
    setSuccess(false);
    setOutput('');

    if (!input.trim()) return;

    try {
      let parsed;
      // For stringify online, we might want to just escape the raw string if it's not valid JSON, 
      // but usually users want to stringify a JSON payload. Let's parse it first to validate.
      if (activeTool.id === 'stringify') {
        try {
          parsed = JSON.parse(input);
        } catch(e) {
          // If it fails, we just stringify the raw text
          setOutput(JSON.stringify(input));
          setSuccess(true);
          return;
        }
      } else {
        parsed = JSON.parse(input);
        
        // If the tool is String to JSON and the first parse returns a string, parse it again
        if (activeTool.id === 'string-to-json' && typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch(e) {
            // If the inner string isn't valid JSON, we just keep the outer string.
          }
        }
      }

      let result = '';

      switch (activeTool.id) {
        case 'formatter':
        case 'pretty-print':
        case 'editor':
        case 'viewer':
        case 'string-to-json':
          result = JSON.stringify(parsed, null, 2);
          break;
        case 'minify':
        case 'one-line':
          result = JSON.stringify(parsed);
          break;
        case 'stringify':
          result = JSON.stringify(JSON.stringify(parsed));
          break;
        case 'sorter':
          result = JSON.stringify(sortObjectKeys(parsed), null, 2);
          break;
        case 'validator':
        case 'parser':
          result = JSON.stringify(parsed, null, 2);
          setSuccess(true);
          break;
        default:
          result = JSON.stringify(parsed, null, 2);
      }

      setOutput(result);
      if (activeTool.id === 'validator' || activeTool.id === 'parser') {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showStatus = activeTool.id === 'validator' || activeTool.id === 'parser';

  return (
    <div className="workspace animate-fade-in">
      <div className="pane">
        <div className="pane-header">
          <span>Input</span>
          <button className="button" onClick={processJSON}>
            <Play size={16} />
            <span>Process</span>
          </button>
        </div>
        <div className="pane-content">
          <textarea
            className="code-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
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
              <strong>Invalid JSON:</strong> {error}
            </div>
          )}
          
          {showStatus && success && (
            <div className="success-message">
              <strong>Valid JSON</strong>
            </div>
          )}

          {output && !showStatus && (
            <pre 
              className="result-view" 
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(output) }} 
            />
          )}

          {output && showStatus && (
            <pre 
              className="result-view" 
              style={{ opacity: 0.7 }}
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(output) }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
