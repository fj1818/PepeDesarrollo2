const fs = require('fs');
const path = require('path');

// Crear copia de index.html como 404.html
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');
const notFoundPath = path.join(buildDir, '404.html');

if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(notFoundPath, indexContent);
  console.log('404.html created successfully!');
}

// Corregir las rutas en los archivos HTML
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

// Añade esta línea al final del archivo
fs.writeFileSync(path.join(buildDir, '.nojekyll'), '');
console.log('.nojekyll file created!'); 