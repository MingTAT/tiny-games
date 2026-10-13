const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+fs.readFileSync(path.join(root,'style.css'),'utf8')+'</style>');
for(const file of ['engine.js','levels.js','app.js'])html=html.replace('<script src="'+file+'"></script>','<script>\n'+fs.readFileSync(path.join(root,file),'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');
fs.writeFileSync(path.join(root,'play.html'),html);console.log('Wrote play.html',Buffer.byteLength(html),'bytes');
