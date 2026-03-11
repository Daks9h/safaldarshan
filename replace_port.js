const fs = require('fs');
const path = require('path');

function replacePort(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replacePort(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                content = content.replace(/http:\/\/localhost:5000/g, 'http://localhost:5001');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replacePort(path.join(__dirname, 'client', 'src'));
console.log('Done replacing ports in client.');
