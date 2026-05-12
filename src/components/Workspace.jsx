import React, { useState, useEffect } from 'react';
import SinglePaneTool from './SinglePaneTool';
import CompareTool from './CompareTool';
import ReaderTool from './ReaderTool';
import TreeViewerTool from './TreeViewerTool';
import ConvertTool from './ConvertTool';
import XmlConvertTool from './XmlConvertTool';
import YamlConvertTool from './YamlConvertTool';
import CsvConvertTool from './CsvConvertTool';
import SchemaValidatorTool from './SchemaValidatorTool';
import XmlTool from './XmlTool';
import JsonToTableTool from './JsonToTableTool';
import XmlToTableTool from './XmlToTableTool';
import Base64Tool from './Base64Tool';
import JavascriptTool from './JavascriptTool';

export default function Workspace({ activeTool }) {
  if (!activeTool) return null;

  if (activeTool.id.startsWith('convert-')) {
    return <ConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('xml-convert-')) {
    return <XmlConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id === 'xml-to-table') {
    return <XmlToTableTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('xml-') || activeTool.id === 'wsdl-formatter' || activeTool.id === 'soap-formatter') {
    return <XmlTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('yaml-convert-')) {
    return <YamlConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('csv-convert-')) {
    return <CsvConvertTool activeTool={activeTool} />;
  }

  const base64ToolIds = [
    'base64-encode', 'base64-decode', 'base64-validator', 
    'base64url-encode', 'base64url-decode', 
    'hex-to-base64', 'base64-to-hex', 
    'binary-to-base64', 'base64-to-binary', 
    'ascii-to-base64', 'base64-to-ascii', 
    'utf8-to-base64', 'base64-to-utf8', 
    'string-to-base64', 'base64-to-string'
  ];

  if (base64ToolIds.includes(activeTool.id)) {
    return <Base64Tool activeTool={activeTool} />;
  }

  const jsToolIds = ['js-to-ts', 'es5-to-es6', 'js-transpiler'];
  if (jsToolIds.includes(activeTool.id)) {
    return <JavascriptTool activeTool={activeTool} />;
  }

  switch (activeTool.id) {
    case 'schema-validator':
      return <SchemaValidatorTool />;
    case 'compare':
      return <CompareTool activeTool={activeTool} />;
    case 'reader':
      return <ReaderTool activeTool={activeTool} />;
    case 'json-to-table':
      return <JsonToTableTool activeTool={activeTool} />;
    case 'viewer':
      return <TreeViewerTool />;
    default:
      // Single pane for formatter, validator, editor, viewer, parser, minify, one-line, stringify, sorter
      return <SinglePaneTool activeTool={activeTool} />;
  }
}
