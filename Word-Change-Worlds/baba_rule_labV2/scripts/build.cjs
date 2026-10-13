const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
const dist=path.join(root,'dist');const web=path.join(root,'web');
const modules=['core','levels','ui'];
let js='(function(){\nconst modules=Object.create(null);\nconst cache=Object.create(null);\nfunction require(name){const key=name.replace(/^\\.\\//, "");if(cache[key])return cache[key].exports;if(!modules[key])throw new Error("Unknown module: "+key);const m={exports:{}};cache[key]=m;modules[key](m,m.exports,require);return m.exports;}\n';
for(const name of modules){const src=fs.readFileSync(path.join(dist,name+'.js'),'utf8');js+=`modules[${JSON.stringify(name)}]=function(module,exports,require){\n${src}\n};\n`;}
js+='require("ui");\n})();';fs.writeFileSync(path.join(web,'game.js'),js);
const html=fs.readFileSync(path.join(web,'index.html'),'utf8'),css=fs.readFileSync(path.join(web,'styles.css'),'utf8');
const play=html.replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`).replace('<script src="game.js"></script>',`<script>${js.split('</script').join('<\\/script')}</script>`);
fs.writeFileSync(path.join(root,'play.html'),play);
fs.writeFileSync(path.join(root,'index.html'),play);
console.log('Built web/game.js and offline play.html');
