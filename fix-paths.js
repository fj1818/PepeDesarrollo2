const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const htmlFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Corregir referencias a archivos CSS
  content = content.replace(/href="\/static\/css\//g, 'href="/mainreact/static/css/');
  
  // Corregir referencias a archivos JS
  content = content.replace(/src="\/static\/js\//g, 'src="/mainreact/static/js/');
  
  fs.writeFileSync(filePath, content);
});

console.log('Paths fixed in HTML files!'); 