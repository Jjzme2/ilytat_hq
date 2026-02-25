const fs = require('fs');
const content = fs.readFileSync('/home/jj/Desktop/ilytat_hq/app/pages/projects/[id].vue', 'utf8');
const { parse } = require('vue/compiler-sfc');
const result = parse(content);
if (result.errors.length) console.error(JSON.stringify(result.errors, null, 2));
else console.log('Parsed successfully');

