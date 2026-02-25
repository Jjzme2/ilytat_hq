const fs = require('fs');
const content = fs.readFileSync('/home/jj/Desktop/ilytat_hq/app/pages/projects/[id].vue', 'utf8');
const { parse } = require('vue/compiler-sfc');
try {
  const result = parse(content);
  if (result.errors.length) console.error(result.errors);
  else console.log('Parsed successfully');
} catch(e) { console.error(e); }

