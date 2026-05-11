import React, { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronDown } from 'lucide-react';

const JsonNode = ({ label, value, isLast }) => {
  const [expanded, setExpanded] = useState(true);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  if (!isObject) {
    let valClass = 'json-string';
    if (typeof value === 'number') valClass = 'json-number';
    else if (typeof value === 'boolean') valClass = 'json-boolean';
    else if (value === null) valClass = 'json-null';

    return (
      <div style={{ marginLeft: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {label !== null && <span className="json-key">"{label}": </span>}
        <span className={valClass}>{JSON.stringify(value)}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }

  const keys = Object.keys(value);
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  if (keys.length === 0) {
    return (
      <div style={{ marginLeft: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {label !== null && <span className="json-key">"{label}": </span>}
        <span>{bracketOpen}{bracketClose}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: label === null ? '1.5rem' : '0', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.5' }}>
      <div 
        onClick={() => setExpanded(!expanded)} 
        style={{ 
          cursor: 'pointer', 
          userSelect: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          marginLeft: label === null ? '0' : '1.5rem' 
        }}
      >
        <span style={{ marginRight: '4px', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {label !== null && <span className="json-key">"{label}": </span>}
        <span>{bracketOpen}</span>
        {!expanded && (
          <span style={{ color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
            {isArray ? `${keys.length} items` : `${keys.length} keys`}
          </span>
        )}
        {!expanded && <span>{bracketClose}{!isLast && ','}</span>}
      </div>
      {expanded && (
        <div style={{ marginLeft: '0.5rem' }}>
          {keys.map((k, i) => (
            <JsonNode key={k} label={isArray ? null : k} value={value[k]} isLast={i === keys.length - 1} />
          ))}
          <div style={{ marginLeft: '1.5rem' }}>{bracketClose}{!isLast && ','}</div>
        </div>
      )}
    </div>
  );
};

export default function TreeViewerTool() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  const processJSON = () => {
    setError(null);
    setParsedData(null);

    if (!input.trim()) return;

    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    processJSON();
  }, []);

  return (
    <div className="workspace animate-fade-in">
      <div className="pane">
        <div className="pane-header">
          <span>Visualize JSON as an interactive collapsible tree. Paste your JSON:</span>
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
          <span>Tree Viewer</span>
        </div>
        <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)', padding: '1rem' }}>
          {error && (
            <div className="error-message">
              <strong>Invalid JSON:</strong> {error}
            </div>
          )}
          
          {parsedData !== null && !error && (
            <div style={{ paddingLeft: '-1.5rem' }}>
               <JsonNode label={null} value={parsedData} isLast={true} />
            </div>
          )}

          {!parsedData && !error && (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Paste JSON and click Process
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
