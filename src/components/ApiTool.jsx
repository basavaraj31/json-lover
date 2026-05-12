import React, { useState } from 'react';
import { Send, Plus, Trash2, Globe, Clock, Hash, Check } from 'lucide-react';

export default function ApiTool() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  
  const [activeTab, setActiveTab] = useState('params');
  const [activeResTab, setActiveResTab] = useState('body');

  const [params, setParams] = useState([{ key: '', value: '', enabled: true }]);
  const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
  
  const [auth, setAuth] = useState({ type: 'none', username: '', password: '', token: '' });
  const [body, setBody] = useState({ type: 'none', rawFormat: 'json', content: '' });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const handleAddRow = (setter, state) => {
    setter([...state, { key: '', value: '', enabled: true }]);
  };

  const handleUpdateRow = (setter, state, index, field, value) => {
    const newState = [...state];
    newState[index][field] = value;
    setter(newState);
  };

  const handleRemoveRow = (setter, state, index) => {
    if (state.length === 1) {
      setter([{ key: '', value: '', enabled: true }]);
    } else {
      setter(state.filter((_, i) => i !== index));
    }
  };

  const buildUrlWithParams = () => {
    if (!url) return '';
    try {
      const urlObj = new URL(url.includes('://') ? url : `http://${url}`);
      params.forEach(p => {
        if (p.enabled && p.key) {
          urlObj.searchParams.set(p.key, p.value);
        }
      });
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  const executeRequest = async () => {
    if (!url) return;
    
    setLoading(true);
    setResponse(null);
    setActiveResTab('body');

    const finalUrl = buildUrlWithParams();
    const requestHeaders = new Headers();

    headers.forEach(h => {
      if (h.enabled && h.key) {
        requestHeaders.append(h.key, h.value);
      }
    });

    if (auth.type === 'basic') {
      requestHeaders.append('Authorization', 'Basic ' + btoa(`${auth.username}:${auth.password}`));
    } else if (auth.type === 'bearer') {
      requestHeaders.append('Authorization', `Bearer ${auth.token}`);
    }

    if (['POST', 'PUT', 'PATCH'].includes(method) && body.type === 'raw' && body.content) {
      if (body.rawFormat === 'json' && !requestHeaders.has('Content-Type')) {
        requestHeaders.append('Content-Type', 'application/json');
      } else if (body.rawFormat === 'xml' && !requestHeaders.has('Content-Type')) {
        requestHeaders.append('Content-Type', 'application/xml');
      }
    }

    const options = {
      method,
      headers: requestHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && body.type === 'raw') {
      options.body = body.content;
    }

    const startTime = performance.now();
    
    try {
      const res = await fetch(finalUrl, options);
      const endTime = performance.now();
      
      const time = Math.round(endTime - startTime);
      
      const resHeaders = [];
      res.headers.forEach((val, key) => {
        resHeaders.push({ key, value: val });
      });

      let resData = '';
      let isJson = false;

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        resData = JSON.stringify(json, null, 2);
        isJson = true;
      } else {
        resData = await res.text();
      }

      const size = new Blob([resData]).size;

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time,
        size,
        headers: resHeaders,
        data: resData,
        isJson,
        error: null
      });

    } catch (err) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'Error',
        time: Math.round(endTime - startTime),
        size: 0,
        headers: [],
        data: '',
        error: err.message === 'Failed to fetch' ? 'Failed to fetch. This may be a CORS issue or network failure.' : err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const renderKeyValueEditor = (state, setter) => (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {state.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={row.enabled} 
            onChange={(e) => handleUpdateRow(setter, state, i, 'enabled', e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <input 
            className="input" 
            placeholder="Key" 
            value={row.key} 
            onChange={(e) => handleUpdateRow(setter, state, i, 'key', e.target.value)}
            style={{ flex: 1 }}
          />
          <input 
            className="input" 
            placeholder="Value" 
            value={row.value} 
            onChange={(e) => handleUpdateRow(setter, state, i, 'value', e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="button secondary" style={{ padding: '0.5rem' }} onClick={() => handleRemoveRow(setter, state, i)}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button className="button secondary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} onClick={() => handleAddRow(setter, state)}>
        <Plus size={16} /> Add Row
      </button>
    </div>
  );

  return (
    <div className="workspace animate-fade-in" style={{ flexDirection: 'column', overflow: 'hidden' }}>
      {/* URL Bar */}
      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <select 
          className="input" 
          style={{ width: '120px', fontWeight: 'bold', color: method === 'GET' ? '#3b82f6' : method === 'POST' ? '#10b981' : method === 'DELETE' ? '#ef4444' : '#f59e0b' }}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        
        <input 
          className="input" 
          style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
          placeholder="Enter request URL (e.g. https://api.example.com/v1/users)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        
        <button className="button" style={{ width: '100px', justifyContent: 'center' }} onClick={executeRequest} disabled={loading || !url}>
          {loading ? 'Sending...' : <><Send size={16} /> Send</>}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
        
        {/* Request Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 40%', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1rem' }}>
            {['Params', 'Headers', 'Auth', 'Body'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab.toLowerCase() ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.toLowerCase() ? '600' : 'normal',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'params' && renderKeyValueEditor(params, setParams)}
            {activeTab === 'headers' && renderKeyValueEditor(headers, setHeaders)}
            {activeTab === 'auth' && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select className="input" style={{ width: '200px' }} value={auth.type} onChange={e => setAuth({...auth, type: e.target.value})}>
                  <option value="none">No Auth</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                </select>
                
                {auth.type === 'basic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
                    <input className="input" placeholder="Username" value={auth.username} onChange={e => setAuth({...auth, username: e.target.value})} />
                    <input className="input" type="password" placeholder="Password" value={auth.password} onChange={e => setAuth({...auth, password: e.target.value})} />
                  </div>
                )}

                {auth.type === 'bearer' && (
                  <div style={{ maxWidth: '600px' }}>
                    <input className="input" placeholder="Token" value={auth.token} onChange={e => setAuth({...auth, token: e.target.value})} style={{ width: '100%' }} />
                  </div>
                )}
              </div>
            )}
            {activeTab === 'body' && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                {['GET', 'HEAD'].includes(method) ? (
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Body is disabled for {method} requests.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <select className="input" style={{ width: '150px' }} value={body.type} onChange={e => setBody({...body, type: e.target.value})}>
                        <option value="none">none</option>
                        <option value="raw">raw</option>
                      </select>
                      {body.type === 'raw' && (
                        <select className="input" style={{ width: '150px' }} value={body.rawFormat} onChange={e => setBody({...body, rawFormat: e.target.value})}>
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                          <option value="text">Text</option>
                        </select>
                      )}
                    </div>
                    {body.type === 'raw' && (
                      <textarea 
                        className="code-editor"
                        style={{ flex: 1, minHeight: '150px' }}
                        value={body.content}
                        onChange={e => setBody({...body, content: e.target.value})}
                        placeholder={`Enter your ${body.rawFormat.toUpperCase()} payload here...`}
                        spellCheck="false"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Response Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 60%', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {['Body', 'Headers'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveResTab(tab.toLowerCase())}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: activeResTab === tab.toLowerCase() ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeResTab === tab.toLowerCase() ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeResTab === tab.toLowerCase() ? '600' : 'normal',
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tab} {tab === 'Headers' && response && response.headers.length > 0 && `(${response.headers.length})`}
                </button>
              ))}
            </div>

            {response && (
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: response.status >= 200 && response.status < 300 ? '#10b981' : '#ef4444' }}>
                  <Globe size={14} /> 
                  <strong style={{ fontSize: '0.9rem' }}>{response.status} {response.statusText}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <Clock size={14} /> {response.time} ms
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <Hash size={14} /> {(response.size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!response && !loading && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Enter the URL and click Send to get a response
              </div>
            )}
            
            {loading && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Sending Request...
              </div>
            )}

            {response && response.error && (
              <div className="error-message" style={{ margin: '1rem' }}>
                <strong>Network Error:</strong> {response.error}
              </div>
            )}

            {response && !response.error && activeResTab === 'body' && (
              <div style={{ padding: '0', height: '100%' }}>
                <pre style={{ 
                  margin: 0,
                  padding: '1rem', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.9rem', 
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  minHeight: '100%'
                }}>
                  {response.data || 'No Content'}
                </pre>
              </div>
            )}

            {response && activeResTab === 'headers' && (
              <div style={{ padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem 1rem', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>Key</th>
                      <th style={{ padding: '0.5rem 1rem', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.headers.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem 1rem', borderRight: '1px solid var(--border-color)', fontWeight: '500' }}>{h.key}</td>
                        <td style={{ padding: '0.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{h.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
