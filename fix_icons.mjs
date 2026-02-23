import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const replaceIcons = (filePath) => {
    if (!filePath.endsWith('.vue') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace i-ph-name with icon-[ph--name]
    content = content.replace(/\bi-ph-([a-z0-9-]+)\b/g, (match, iconName) => {
        return `icon-[ph--${iconName}]`;
    });
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated icons in ${filePath}`);
    }
};

walkDir('./app', replaceIcons);
walkDir('./ilytat_common_packages', replaceIcons);

console.log('Done replacing icons.');
