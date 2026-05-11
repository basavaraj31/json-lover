import React, { useState, useRef } from 'react';
import { UploadCloud, FileJson, AlertCircle } from 'lucide-react';

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

export default function ReaderTool() {
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setFileData(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = JSON.parse(text);
        setFileData(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setError(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column' }}>
      <div className="pane" style={{ flex: '0 0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-surface)' }}>
        <input 
          type="file" 
          accept=".json,application/json" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <UploadCloud size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Upload JSON File</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Select a local .json file to read and format</p>
        </div>

        <button className="button" onClick={triggerUpload} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          Browse Files
        </button>
      </div>

      <div className="pane" style={{ flex: 1, marginTop: '1.5rem' }}>
        <div className="pane-header">
          <span>{fileName ? `File Contents: ${fileName}` : 'File Contents'}</span>
          {fileName && <FileJson size={16} />}
        </div>
        <div className="pane-content" style={{ overflow: 'auto', backgroundColor: 'var(--bg-surface)' }}>
          {error && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          {!error && !fileData && (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No file loaded yet
            </div>
          )}

          {fileData && (
            <pre 
              className="result-view" 
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(fileData) }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
