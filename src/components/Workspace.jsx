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

export default function Workspace({ activeTool }) {
  if (!activeTool) return null;

  if (activeTool.id.startsWith('convert-')) {
    return <ConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('xml-convert-')) {
    return <XmlConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('yaml-convert-')) {
    return <YamlConvertTool activeTool={activeTool} />;
  }

  if (activeTool.id.startsWith('csv-convert-')) {
    return <CsvConvertTool activeTool={activeTool} />;
  }

  switch (activeTool.id) {
    case 'schema-validator':
      return <SchemaValidatorTool />;
    case 'compare':
      return <CompareTool activeTool={activeTool} />;
    case 'reader':
      return <ReaderTool activeTool={activeTool} />;
    case 'viewer':
      return <TreeViewerTool />;
    default:
      // Single pane for formatter, validator, editor, viewer, parser, minify, one-line, stringify, sorter
      return <SinglePaneTool activeTool={activeTool} />;
  }
}
