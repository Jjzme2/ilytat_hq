import fs from 'fs';
import path from 'path';
import { icons } from '@iconify-json/ph';

const usedIcons = new Set();
const scanDir = (dir) => {
    fs.readdirSync(dir).forEach(f => {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.nuxt')) scanDir(fullPath);
        } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(/icon-\[ph--([a-z0-9-]+)\]/g);
            if (matches) matches.forEach(m => usedIcons.add(m.replace('icon-[ph--', '').replace(']', '')));
        }
    });
};

scanDir('./app');
scanDir('./ilytat_common_packages');

let css = '/* Auto-generated Static Icon CSS for Firefox & Tailwind v4 support */\n';
css += '[class^="icon-[ph--"], [class*=" icon-[ph--"] {\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  background-color: currentColor;\n  -webkit-mask-size: 100% 100%;\n  mask-size: 100% 100%;\n  -webkit-mask-repeat: no-repeat;\n  mask-repeat: no-repeat;\n}\n\n';

for (const iconName of usedIcons) {
    let iconData = icons.icons[iconName];
    if (!iconData) continue;
    
    // Build an SVG wrapper
    const width = iconData.width || icons.width || 256;
    const height = iconData.height || icons.height || 256;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${iconData.left || 0} ${iconData.top || 0} ${width} ${height}">${iconData.body}</svg>`;
    
    // URL encode SVG
    const encoded = svg
        .replace(/"/g, "'")
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E');
        
    css += `.icon-\\[ph--${iconName}\\] {\n`;
    css += `  -webkit-mask-image: url("data:image/svg+xml;utf8,${encoded}");\n`;
    css += `  mask-image: url("data:image/svg+xml;utf8,${encoded}");\n`;
    css += `}\n\n`;
}

fs.writeFileSync('./app/assets/css/icons.css', css);
console.log(`Generated ${usedIcons.size} icons in icons.css`);
