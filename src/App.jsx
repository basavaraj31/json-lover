import React, { useState } from 'react';
import { 
  Braces, 
  CheckCircle, 
  Edit3, 
  FileText, 
  Minimize2, 
  UploadCloud, 
  Code, 
  AlignLeft, 
  GitCompare, 
  SortAsc,
  FileCode2,
  FolderOpen,
  FileSpreadsheet,
  FileJson,
  FileCode,
  ShieldCheck,
  Table,
  Menu,
  X
} from 'lucide-react';
import Workspace from './components/Workspace';

const JSON_TOOLS = [
  { id: 'formatter', name: 'JSON Formatter', desc: 'Format and indent your JSON data beautifully.', icon: Braces },
  { id: 'validator', name: 'JSON Validator', desc: 'Check if your JSON is perfectly valid and pinpoint errors.', icon: CheckCircle },
  { id: 'schema-validator', name: 'JSON Schema Validator', desc: 'Validate your JSON data against a custom JSON Schema structure.', icon: ShieldCheck },
  { id: 'editor', name: 'JSON Editor', desc: 'Edit your JSON data with syntax highlighting and formatting.', icon: Edit3 },
  { id: 'pretty-print', name: 'JSON Pretty Print', desc: 'Beautify unreadable JSON into a structured, readable format.', icon: FileText },
  { id: 'viewer', name: 'JSON Tree Viewer', desc: 'Visualize JSON as an interactive collapsible tree.', icon: Code },
  { id: 'parser', name: 'JSON Parser', desc: 'Parse stringified JSON and validate its structural integrity.', icon: Code },
  { id: 'minify', name: 'JSON Minify', desc: 'Compress JSON by removing all whitespace and newlines.', icon: Minimize2 },
  { id: 'reader', name: 'JSON Reader', desc: 'Upload a local JSON file to read and format it instantly.', icon: UploadCloud },
  { id: 'stringify', name: 'JSON Stringify Online', desc: 'Convert a JSON object into an escaped string payload.', icon: Code },
  { id: 'string-to-json', name: 'String to JSON', desc: 'Parse an escaped JSON string back into a formatted JSON object.', icon: FileCode2 },
  { id: 'one-line', name: 'JSON to One Line', desc: 'Condense any formatted JSON into a single line of text.', icon: AlignLeft },
  { id: 'compare', name: 'JSON Compare', desc: 'Highlight the exact differences between two JSON structures.', icon: GitCompare },
  { id: 'sorter', name: 'JSON Sorter', desc: 'Recursively sort all JSON keys alphabetically for easy reading.', icon: SortAsc },
];

const XML_TOOLS = [
  { id: 'xml-formatter', name: 'XML Formatter', desc: 'Format and indent your XML data beautifully.', icon: Braces },
  { id: 'xml-minify', name: 'XML Minify', desc: 'Compress XML by removing all whitespace and newlines.', icon: Minimize2 },
  { id: 'xml-viewer', name: 'XML Viewer', desc: 'View your XML with rich syntax highlighting.', icon: Code },
  { id: 'xml-pretty-print', name: 'XML Pretty Print', desc: 'Beautify unreadable XML into a structured, readable format.', icon: FileText },
  { id: 'xml-validator', name: 'XML Validator', desc: 'Check if your XML is perfectly valid and pinpoint errors.', icon: CheckCircle },
  { id: 'xml-editor', name: 'XML Editor', desc: 'Edit your XML data with syntax highlighting and formatting.', icon: Edit3 },
  { id: 'xml-parser', name: 'XML Parser', desc: 'Parse XML and validate its structural integrity.', icon: Code },
];

const JSON_CONVERTERS = [
  { id: 'convert-xml', mode: 'xml', name: 'JSON to XML', desc: 'Convert JSON to XML format.', icon: FileCode2 },
  { id: 'convert-csv', mode: 'csv', name: 'JSON to CSV', desc: 'Convert JSON to CSV format.', icon: FileSpreadsheet },
  { id: 'convert-yaml', mode: 'yaml', name: 'JSON to YAML', desc: 'Convert JSON to YAML format.', icon: FileText },
  { id: 'convert-tsv', mode: 'tsv', name: 'JSON to TSV', desc: 'Convert JSON to TSV format.', icon: FileSpreadsheet },
  { id: 'convert-string', mode: 'string', name: 'JSON to String', desc: 'Convert JSON to an escaped String payload.', icon: FileJson },
];

const XML_CONVERTERS = [
  { id: 'xml-convert-json', mode: 'json', name: 'XML to JSON', desc: 'Convert XML to JSON format.', icon: Braces },
  { id: 'xml-convert-csv', mode: 'csv', name: 'XML to CSV', desc: 'Convert XML to CSV format.', icon: FileSpreadsheet },
  { id: 'xml-convert-yaml', mode: 'yaml', name: 'XML to YAML', desc: 'Convert XML to YAML format.', icon: FileText },
  { id: 'xml-convert-tsv', mode: 'tsv', name: 'XML to TSV', desc: 'Convert XML to TSV format.', icon: FileSpreadsheet },
  { id: 'xml-convert-string', mode: 'string', name: 'XML to String', desc: 'Convert XML to an escaped String payload.', icon: FileJson },
];

const YAML_CONVERTERS = [
  { id: 'yaml-convert-json', mode: 'json', name: 'YAML to JSON', desc: 'Convert YAML to JSON format.', icon: Braces },
  { id: 'yaml-convert-xml', mode: 'xml', name: 'YAML to XML', desc: 'Convert YAML to XML format.', icon: FileCode2 },
  { id: 'yaml-convert-csv', mode: 'csv', name: 'YAML to CSV', desc: 'Convert YAML to CSV format.', icon: FileSpreadsheet },
  { id: 'yaml-convert-tsv', mode: 'tsv', name: 'YAML to TSV', desc: 'Convert YAML to TSV format.', icon: FileSpreadsheet },
  { id: 'yaml-convert-string', mode: 'string', name: 'YAML to String', desc: 'Convert YAML to an escaped String payload.', icon: FileJson },
];

const CSV_CONVERTERS = [
  { id: 'csv-convert-json', mode: 'json', name: 'CSV to JSON', desc: 'Convert CSV to JSON format.', icon: Braces },
  { id: 'csv-convert-xml', mode: 'xml', name: 'CSV to XML', desc: 'Convert CSV to XML format.', icon: FileCode2 },
  { id: 'csv-convert-yaml', mode: 'yaml', name: 'CSV to YAML', desc: 'Convert CSV to YAML format.', icon: FileText },
  { id: 'csv-convert-html', mode: 'html', name: 'CSV to HTML', desc: 'Convert CSV to an HTML Table.', icon: FileCode },
];

const ALL_TOOLS = [...JSON_TOOLS, ...JSON_CONVERTERS, ...XML_CONVERTERS, ...YAML_CONVERTERS, ...CSV_CONVERTERS];

function App() {
  const [activeCategory, setActiveCategory] = useState('tools'); // 'tools' | 'convert' | 'xml-convert' | 'yaml-convert' | 'csv-convert'
  const [activeToolId, setActiveToolId] = useState(null); // null means show grid
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeTool = ALL_TOOLS.find(t => t.id === activeToolId);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setActiveToolId(null);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
  };

  const handleToolSelect = (toolId) => {
    setActiveToolId(toolId);
    // Tool selection happens inside the main content, so menu is already closed usually,
    // but good practice just in case.
    setIsMobileMenuOpen(false); 
  };

  const renderGrid = () => {
    let title = '';
    let subtitle = '';
    let list = [];

    if (activeCategory === 'tools') {
      title = 'JSON Developer Tools';
      subtitle = 'Your complete suite for formatting, validating, comparing, and managing JSON payloads.';
      list = JSON_TOOLS;
    } else if (activeCategory === 'convert') {
      title = 'JSON Converters';
      subtitle = 'Quickly and easily convert your JSON payloads into other popular data formats.';
      list = JSON_CONVERTERS;
    } else if (activeCategory === 'xml-convert') {
      title = 'XML Converters';
      subtitle = 'Robust tools to parse and convert XML payloads into JSON, CSV, YAML, and more.';
      list = XML_CONVERTERS;
    } else if (activeCategory === 'xml-tools') {
      title = 'XML Tools';
      subtitle = 'A complete suite of utilities to format, validate, minify, and parse your XML payloads.';
      list = XML_TOOLS;
    } else if (activeCategory === 'yaml-convert') {
      title = 'YAML Converters';
      subtitle = 'Quickly and easily convert your YAML payloads into JSON, XML, CSV, and more.';
      list = YAML_CONVERTERS;
    } else if (activeCategory === 'csv-convert') {
      title = 'CSV Converters';
      subtitle = 'Convert your CSV data directly into JSON, XML, YAML, or HTML tables.';
      list = CSV_CONVERTERS;
    }

    return (
      <div className="home-container animate-fade-in">
        <div className="home-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="tools-grid">
          {list.map((tool) => {
            const Icon = tool.icon;
            return (
              <div 
                key={tool.id} 
                className="tool-card"
                onClick={() => handleToolSelect(tool.id)}
              >
                <div className="tool-icon-wrapper">
                  <Icon size={24} />
                </div>
                <div className="tool-card-title">{tool.name}</div>
                <div className="tool-card-desc">{tool.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Running Privacy Disclaimer Banner */}
      <div className="running-banner">
        <div className="banner-text">
          🔒 Disclaimer: 100% Privacy Guaranteed. Your data is processed entirely within your browser and never leaves your device. 🔒
        </div>
      </div>
      <div className="layout">
        {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Fixed Mobile Top Header */}
      <div className="mobile-top-header">
        <div className="mobile-brand">
          <Braces size={20} />
          <span>JSON Studio</span>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => handleCategorySelect('tools')}>
          <Braces size={24} />
          <span>JSON Studio</span>
        </div>
        <nav className="sidebar-nav">
          
          <a
            className={`nav-item ${activeCategory === 'tools' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('tools')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <FolderOpen size={18} />
            <span>Json tools</span>
          </a>

          <a
            className={`nav-item ${activeCategory === 'convert' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('convert')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <FileCode2 size={18} />
            <span>Json convert</span>
          </a>

          <a
            className={`nav-item ${activeCategory === 'xml-tools' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('xml-tools')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <FolderOpen size={18} />
            <span>XML tools</span>
          </a>

          <a
            className={`nav-item ${activeCategory === 'xml-convert' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('xml-convert')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <FileCode size={18} />
            <span>XML converter</span>
          </a>

          <a
            className={`nav-item ${activeCategory === 'yaml-convert' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('yaml-convert')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <FileText size={18} />
            <span>YAML converter</span>
          </a>

          <a
            className={`nav-item ${activeCategory === 'csv-convert' && activeToolId === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect('csv-convert')}
            style={{ fontWeight: 600, color: 'var(--text-primary)' }}
          >
            <Table size={18} />
            <span>CSV converter</span>
          </a>

        </nav>
      </aside>
      <main className="main-content">
        {activeToolId ? (
          <>
            <header className="topbar">
              <div className="topbar-title">{activeTool?.name}</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="button secondary" onClick={() => setActiveToolId(null)}>
                  Back to {
                    activeCategory === 'tools' ? 'Tools' : 
                    activeCategory === 'xml-tools' ? 'XML Tools' : 
                    activeCategory === 'convert' ? 'JSON Converters' : 
                    activeCategory === 'xml-convert' ? 'XML Converters' : 
                    activeCategory === 'yaml-convert' ? 'YAML Converters' : 'CSV Converters'
                  }
                </button>
              </div>
            </header>
            <Workspace activeTool={activeTool} />
          </>
        ) : (
          renderGrid()
        )}
      </main>
    </div>
    </div>
  );
}

export default App;
