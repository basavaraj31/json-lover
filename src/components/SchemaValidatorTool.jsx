import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle } from 'lucide-react';
import Ajv from 'ajv';

export default function SchemaValidatorTool() {
  const [dataInput, setDataInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [result, setResult] = useState(null);

  const handleValidate = () => {
    setResult(null);

    if (!dataInput.trim() || !schemaInput.trim()) {
      setResult({
        valid: false,
        error: 'Please provide both JSON data and a JSON Schema to validate.'
      });
      return;
    }

    let dataObj;
    let schemaObj;

    try {
      dataObj = JSON.parse(dataInput);
    } catch (e) {
      setResult({ valid: false, error: `Invalid JSON Data: ${e.message}` });
      return;
    }

    try {
      schemaObj = JSON.parse(schemaInput);
    } catch (e) {
      setResult({ valid: false, error: `Invalid JSON Schema: ${e.message}` });
      return;
    }

    try {
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(schemaObj);
      const valid = validate(dataObj);

      if (valid) {
        setResult({ valid: true });
      } else {
        setResult({
          valid: false,
          details: validate.errors
        });
      }
    } catch (err) {
      setResult({ valid: false, error: `Schema Error: ${err.message}` });
    }
  };

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', gap: '1.5rem', flex: '1 1 auto', minHeight: '50%' }}>
        
        {/* Data Input Pane */}
        <div className="pane">
          <div className="pane-header">
            <span>JSON Data</span>
          </div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="Paste the JSON data you want to validate..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Schema Input Pane */}
        <div className="pane">
          <div className="pane-header">
            <span>JSON Schema</span>
          </div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder='Paste the JSON Schema (e.g., {"type": "object", "properties": {...}})...'
              spellCheck="false"
            />
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
        <button className="button" onClick={handleValidate} style={{ padding: '0.75rem 2rem' }}>
          <Play size={18} />
          <span>Validate against Schema</span>
        </button>
      </div>

      {/* Results Pane */}
      <div className="pane" style={{ flex: '0 0 auto', height: '30%', minHeight: '200px' }}>
        <div className="pane-header">
          <span>Validation Result</span>
        </div>
        <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)' }}>
          
          {!result && (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Enter data and schema, then click Validate
            </div>
          )}

          {result && result.valid && (
            <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem' }}>
              <CheckCircle size={24} />
              <span style={{ fontSize: '1.1rem' }}><strong>Success!</strong> The JSON data matches the schema perfectly.</span>
            </div>
          )}

          {result && !result.valid && result.error && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem' }}>
              <AlertTriangle size={24} />
              <span style={{ fontSize: '1.1rem' }}>{result.error}</span>
            </div>
          )}

          {result && !result.valid && result.details && (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--error-color)', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} />
                Found {result.details.length} schema validation error(s):
              </div>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {result.details.map((err, idx) => (
                  <li key={idx} style={{ 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    borderLeft: '4px solid var(--error-color)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ color: '#f87171', fontWeight: 'bold' }}>{err.instancePath || 'root'}</span>: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
