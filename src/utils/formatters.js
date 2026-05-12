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

export function jsonToProtobuf(json, messageName = 'RootMessage') {
  let output = 'syntax = "proto3";\n\n';
  const messages = [];

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function generateMessage(obj, name) {
    let msg = `message ${name} {\n`;
    let fieldCount = 1;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        let type = 'string';

        if (val === null) {
          type = 'string';
        } else if (typeof val === 'number') {
          type = Number.isInteger(val) ? 'int32' : 'double';
        } else if (typeof val === 'boolean') {
          type = 'bool';
        } else if (Array.isArray(val)) {
          if (val.length > 0) {
            const firstItem = val[0];
            if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
              const subName = capitalize(key) + 'Item';
              generateMessage(firstItem, subName);
              type = `repeated ${subName}`;
            } else if (typeof firstItem === 'number') {
              type = Number.isInteger(firstItem) ? 'repeated int32' : 'repeated double';
            } else if (typeof firstItem === 'boolean') {
              type = 'repeated bool';
            } else {
              type = 'repeated string';
            }
          } else {
             type = 'repeated string';
          }
        } else if (typeof val === 'object') {
          const subName = capitalize(key);
          generateMessage(val, subName);
          type = subName;
        }

        msg += `  ${type} ${key} = ${fieldCount};\n`;
        fieldCount++;
      }
    }
    msg += `}\n`;
    messages.push(msg);
  }

  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
     generateMessage(json, messageName);
  } else if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object' && json[0] !== null) {
     generateMessage(json[0], messageName);
  } else {
     generateMessage({ value: json }, messageName);
  }

  output += messages.reverse().join('\n');
  return output;
}
