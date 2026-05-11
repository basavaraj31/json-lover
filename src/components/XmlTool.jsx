import React, { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

export default function XmlTool({ activeTool }) {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>Hello World</name>\n  </item>\n</root>');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const isValidator = activeTool.id === 'xml-validator' || activeTool.id === 'xml-parser';

  const syntaxHighlightXML = (xml) => {
    if (!xml) return '';
    let escaped = xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Tags
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9_:-]+)/g, '<span style="color: #4338ca; font-weight: 600;">$1</span>');
    // Closing brackets
    escaped = escaped.replace(/(&gt;)/g, '<span style="color: #4338ca; font-weight: 600;">$1</span>');
    // Attributes
    escaped = escaped.replace(/([a-zA-Z0-9_:-]+)=(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span style="color: #059669;">$1</span>=<span style="color: #dc2626;">$2</span>');
    return escaped;
  };

  const processXML = () => {
    setError('');
    setSuccess('');
    setOutput('');

    if (!input.trim()) {
      setError('Please enter some XML to process.');
      return;
    }

    try {
      const validationResult = XMLValidator.validate(input);
      if (validationResult !== true) {
        throw new Error(`Syntax Error: ${validationResult.err.msg} at line ${validationResult.err.line}`);
      }

      if (isValidator) {
        setSuccess('Valid XML! The structure is perfectly formed.');
        setOutput(input);
        return;
      }

      const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
      const parsedObj = parser.parse(input);

      let builder;
      if (activeTool.id === 'xml-minify') {
        builder = new XMLBuilder({ ignoreAttributes: false, format: false, preserveOrder: true });
      } else {
        // Formatter, Editor, Viewer, Pretty Print
        builder = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: "  ", preserveOrder: true });
      }

      const processedXml = builder.build(parsedObj);
      setOutput(processedXml.trim());

      if (activeTool.id === 'xml-formatter' || activeTool.id === 'xml-pretty-print') {
        setSuccess('XML beautifully formatted!');
      } else if (activeTool.id === 'xml-minify') {
        setSuccess('XML successfully minified!');
      }

    } catch (err) {
      setError(err.message || 'Failed to process XML. Please check the syntax.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="workspace animate-fade-in">
      <div className="pane">
        <div className="pane-header">
          <span>Input XML</span>
          <button className="button" onClick={processXML}>
            <Play size={16} />
            <span>Process</span>
          </button>
        </div>
        <div className="pane-content">
          <textarea
            className="code-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your XML here..."
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
              <strong>Invalid XML:</strong> {error}
            </div>
          )}
          
          {isValidator && success && (
            <div className="success-message">
              <strong>{success}</strong>
            </div>
          )}

          {!isValidator && success && (
            <div className="success-message" style={{ padding: '0.5rem 1rem', margin: '0.5rem 1rem' }}>
              {success}
            </div>
          )}

          {output && (
            <pre 
              className="result-view" 
              style={{ opacity: isValidator ? 0.7 : 1 }}
              dangerouslySetInnerHTML={{ __html: syntaxHighlightXML(output) }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
