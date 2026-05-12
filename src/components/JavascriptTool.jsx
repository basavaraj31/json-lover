import React, { useState, useEffect } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import * as Babel from '@babel/standalone';

export default function JavascriptTool({ activeTool }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOutput('');
    setError(null);
    
    if (activeTool.id === 'js-to-ts') {
      setInput('function greet(name) {\n  return "Hello " + name;\n}');
    } else if (activeTool.id === 'es5-to-es6') {
      setInput('var self = this;\nvar multiply = function(a, b) {\n  return a * b;\n};\nvar arr = [1, 2, 3];\nfor(var i=0; i<arr.length; i++) {\n  console.log(arr[i]);\n}');
    } else if (activeTool.id === 'js-transpiler') {
      setInput('const multiply = (a, b) => a * b;\nlet message = `Result: ${multiply(5, 5)}`;');
    } else {
      setInput('');
    }
  }, [activeTool.id]);

  // Naive JS to TS converter heuristic
  const convertJsToTs = (code) => {
    let tsCode = code;
    // Basic types for parameters
    tsCode = tsCode.replace(/function\s+(\w+)\s*\(([^)]+)\)/g, (match, name, params) => {
      const typedParams = params.split(',').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return trimmed;
        // if already typed, skip
        if (trimmed.includes(':')) return trimmed;
        return `${trimmed}: any`;
      }).join(', ');
      return `function ${name}(${typedParams})`;
    });

    // Arrow functions params
    tsCode = tsCode.replace(/\(([^)]+)\)\s*=>/g, (match, params) => {
       const typedParams = params.split(',').map(p => {
        const trimmed = p.trim();
        if (!trimmed || trimmed.includes(':')) return trimmed;
        return `${trimmed}: any`;
      }).join(', ');
      return `(${typedParams}) =>`;
    });

    // let/const variable basic inference (just adding type signature placeholders)
    // Actually, in TS it's better to let type inference handle variables. We just ensure parameters are typed.
    
    // common require to import
    tsCode = tsCode.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";');
    tsCode = tsCode.replace(/let\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";');
    tsCode = tsCode.replace(/var\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, 'import $1 from "$2";');

    // module.exports to export default
    tsCode = tsCode.replace(/module\.exports\s*=\s*/g, 'export default ');

    return tsCode;
  };

  const handleProcess = async () => {
    setError(null);
    setOutput('');

    if (!input.trim()) return;

    try {
      if (activeTool.id === 'js-transpiler') {
        const result = Babel.transform(input, { presets: ['env'] });
        setOutput(result.code);
      } 
      else if (activeTool.id === 'es5-to-es6') {
        // Since Lebab requires Node core modules, running it natively in Vite might crash.
        // We will try dynamic import or fallback to a basic regex conversion if Lebab fails.
        try {
          const { transform } = await import('lebab');
          const { code, warnings } = transform(input, ['let', 'arrow', 'arrow-return', 'template', 'obj-shorthand', 'obj-method', 'destruct-param', 'includes', 'let', 'for-of', 'for-each', 'arg-rest', 'arg-spread', 'commonjs']);
          
          let res = code;
          if (warnings && warnings.length > 0) {
            res += '\n\n/* Warnings:\n' + warnings.map(w => `- line ${w.line}: ${w.msg}`).join('\n') + '\n*/';
          }
          setOutput(res);
        } catch (lebabErr) {
          console.warn("Lebab not available in browser environment, falling back to heuristic conversion.", lebabErr);
          let res = input;
          // rudimentary fallback
          res = res.replace(/var\s+/g, 'let ');
          res = res.replace(/function\s*\(([^)]*)\)\s*{/g, '($1) => {');
          res = res.replace(/let\s+self\s*=\s*this;/g, ''); // not great but simple
          res = res.replace(/\n\s*\n/g, '\n');
          setOutput('// Notice: Lebab browser bundling failed. Showing heuristic conversion.\n' + res);
        }
      }
      else if (activeTool.id === 'js-to-ts') {
        setOutput(convertJsToTs(input));
      }
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
            <span>Input {activeTool.id.includes('ts') ? 'JavaScript' : 'ES5/ES6'}</span>
            <button className="button" onClick={handleProcess}>
              <Play size={16} />
              <span>Convert</span>
            </button>
          </div>
          <div className="pane-content">
            <textarea
              className="code-editor"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JavaScript code here..."
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

            {output && !error && (
              <pre className="result-view" style={{ opacity: 1 }}>
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
