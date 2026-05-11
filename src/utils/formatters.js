export function jsonToXml(obj, rootName = 'root') {
  let xml = '';
  
  const toXml = (v, name) => {
    let innerXml = '';
    if (v instanceof Array) {
      v.forEach(item => {
        innerXml += `<${name}>${toXml(item, 'item')}</${name}>`;
      });
      return innerXml;
    } else if (typeof v === 'object' && v !== null) {
      Object.keys(v).forEach(key => {
        innerXml += toXml(v[key], key);
      });
      return innerXml;
    } else {
      // escape basic XML entities
      const str = String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      return `<${name}>${str}</${name}>`;
    }
  };

  xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
  if (Array.isArray(obj)) {
    xml += `<${rootName}>\n`;
    obj.forEach(item => {
      xml += toXml(item, 'item');
    });
    xml += `\n</${rootName}>`;
  } else {
    xml += toXml(obj, rootName);
  }

  // Very basic pretty print for XML
  let formatted = '';
  let pad = 0;
  xml.split(/(?=<)|(?<=>)/).forEach(node => {
    if (node.match(/^<\/\w/)) pad -= 1;
    let indent = '';
    for (let i = 0; i < pad; i++) indent += '  ';
    formatted += indent + node + '\n';
    if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      if (!node.match(/<\/.*>$/)) pad += 1;
    } else if (node.match(/^<\w/)) {
      pad += 1;
    }
  });
  
  return formatted.replace(/\n\s*\n/g, '\n').trim();
}
