import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';

function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
}

export default function CompareTool() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = () => {
    setError(null);
    setResult(null);

    if (!input1.trim() || !input2.trim()) {
      setError('Please provide JSON in both fields to compare.');
      return;
    }

    try {
      const obj1 = JSON.parse(input1);
      const obj2 = JSON.parse(input2);

      // Sort keys to ensure comparison is structural, not order-dependent
      const sorted1 = sortObjectKeys(obj1);
      const sorted2 = sortObjectKeys(obj2);

      const str1 = JSON.stringify(sorted1, null, 2);
      const str2 = JSON.stringify(sorted2, null, 2);

      if (str1 === str2) {
        setResult({ match: true });
        return;
      }

      const lines1 = str1.split('\n');
      const lines2 = str2.split('\n');
      
      // Basic line-by-line comparison
      const diffLines = [];
      const maxLength = Math.max(lines1.length, lines2.length);
      
      for (let i = 0; i < maxLength; i++) {
        const l1 = lines1[i] || '';
        const l2 = lines2[i] || '';
        
        if (l1 === l2) {
          diffLines.push({ type: 'equal', text: l1 });
        } else {
          if (l1) diffLines.push({ type: 'removed', text: l1 });
          if (l2) diffLines.push({ type: 'added', text: l2 });
        }
      }

      setResult({ match: false, diff: diffLines });
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column' }}>
      {/* Top half: Inputs */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, maxHeight: '40%' }}>
        <div className="pane">
          <div className="pane-header">Original JSON</div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder="Paste original JSON..."
              spellCheck="false"
            />
          </div>
        </div>
        <div className="pane">
          <div className="pane-header">Modified JSON</div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder="Paste modified JSON..."
              spellCheck="false"
            />
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
        <button className="button" onClick={handleCompare} style={{ padding: '0.75rem 2rem' }}>
          <GitCompare size={18} />
          <span>Compare JSON</span>
        </button>
      </div>

      {/* Bottom half: Results */}
      <div className="pane" style={{ flex: 1 }}>
        <div className="pane-header">Comparison Result</div>
        <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)' }}>
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {result && result.match && (
             <div className="success-message">
               <strong>Match!</strong> The two JSON payloads are structurally identical.
             </div>
          )}

          {result && !result.match && (
            <div style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {result.diff.map((line, idx) => {
                let bg = 'transparent';
                let color = 'inherit';
                let prefix = '  ';
                if (line.type === 'added') {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  color = '#34d399';
                  prefix = '+ ';
                } else if (line.type === 'removed') {
                  bg = 'rgba(239, 68, 68, 0.15)';
                  color = '#f87171';
                  prefix = '- ';
                } else {
                  color = 'var(--text-secondary)';
                }
                
                return (
                  <div key={idx} style={{ backgroundColor: bg, color: color, padding: '0 4px' }}>
                    <span style={{ opacity: 0.5, marginRight: '8px', userSelect: 'none' }}>{prefix}</span>
                    {line.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
