(function(){'use strict';
const {Game}=globalThis.BabaCore,{levels}=globalThis.BabaLevels;
const canvas=document.getElementById('board'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const STORAGE='word-change-worlds-progress-v1';
let current=0,game=null,completed=new Set(),animation=null;
try{completed=new Set(JSON.parse(localStorage.getItem(STORAGE)||'[]'));}catch(e){}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify([...completed]));}catch(e){}}
function load(i){current=(i+levels.length)%levels.length;game=new Game(levels[current]);animation=null;
$('overlay').classList.remove('open');$('stage-title').textContent=levels[current].title;
$('stage-subtitle').textContent=levels[current].subtitle;
$('stage-count').textContent=String(current+1).padStart(2,'0')+' / '+levels.length;
$('hint').textContent=levels[current].goal;update();canvas.focus({preventScroll:true});}
function levelMenu(){let out='';for(let i=0;i<levels.length;i++){
 const words=levels[i].title.split('·');out+=`<button class="level-btn ${i===current?'active':''}" data-level="${i}"><span class="lv-num">${String(i+1).padStart(2,'0')}</span><span class="lv-content"><span class="lv-title">${words.slice(1).join('·').trim()}</span><span class="lv-sub">${levels[i].subtitle}</span></span><span class="lv-check">${completed.has(i)?'✓':''}</span></button>`;
 }$('level-list').innerHTML=out;$('level-list').querySelectorAll('button').forEach(btn=>btn.onclick=()=>load(Number(btn.dataset.level)));}
function update(){levelMenu();const all=game.rules.map(r=>`${r.lonely?'LONELY ':''}${r.subjectNot?'NOT ':''}${r.subject}${r.cond?' '+r.cond.type+' '+(r.cond.not?'NOT ':'')+r.cond.target:''} ${r.verb} ${r.targetNot?'NOT ':''}${r.target}`);
 const unique=[...new Set(all)];$('rules').innerHTML=unique.length?unique.map(s=>{
 const m=s.match(/^(.*?) (IS|HAS|MAKE) (.*?)$/);
 return `<div class="rule-row"><span class="subject">${m?m[1]:s}</span> <span class="verb">${m?m[2]:''}</span> <span class="result">${m?m[3]:''}</span></div>`;
 }).join(''):'<div class="empty-rules">没有任何可识别的句子。你可能失去了控制对象，也可能发现了真正的自由。</div>';
 $('status').innerHTML=game.won?'<b>✦ 关卡完成</b>':game.objs.some(o=>game.has(o,'YOU')||game.has(o,'YOU2'))?'<b>●</b> 世界规则实时生效':'<b>!</b> 当前没有 YOU：可以撤销或修改规则';
 $('turn-count').textContent=`STEP ${String(game.turn).padStart(3,'0')}`;
 $('undo').disabled=!game.history.length;$('redo').disabled=!game.future.length;
 draw();}
function advance(dir){if(game.won)return;const old=game.objs.map(o=>({...o}));game.step(dir);animation={old:new Map(old.map(o=>[o.id,o])),time:performance.now()};update();if(game.won){completed.add(current);save();$('win-detail').textContent=`${levels[current].title} · 用了 ${game.turn} 步。你让一条句子成为了现实。`;setTimeout(()=>{$('overlay').classList.add('open');},250);}}
function undo(){if(game.undo()){animation=null;update();$('overlay').classList.remove('open');}}
function redo(){if(game.redo()){animation=null;update();}}
function restart(){game.restart();animation=null;update();$('overlay').classList.remove('open');}
$('undo').onclick=undo;$('redo').onclick=redo;$('restart').onclick=restart;
$('wait').onclick=()=>advance(null);$('next').onclick=()=>load(current+1);
$('win-restart').onclick=restart;$('win-next').onclick=()=>load(current+1);
document.querySelectorAll('[data-dir]').forEach(el=>el.onclick=()=>advance(Number(el.dataset.dir)));
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey)return;
 const k=e.key.toLowerCase(), dirs={arrowup:0,w:0,arrowright:1,d:1,arrowdown:2,s:2,arrowleft:3,a:3};
 if(Object.hasOwn(dirs,k)){e.preventDefault();advance(dirs[k]);return;}
 if(k==='z'||k==='backspace'){e.preventDefault();undo();}else if(k==='y'){e.preventDefault();redo();}else if(k==='r'){e.preventDefault();restart();}else if(k===' '){e.preventDefault();advance(null);}else if(k==='escape'){$('overlay').classList.remove('open');}
});
// Responsive hi-DPI hand drawn board, no external art or fonts.
const COLORS={baba:'#f2f6ff',keke:'#f4ad6b',flag:'#ffdc74',wall:'#8593b6',rock:'#9e9ab7',water:'#70c4ed',lava:'#ff8c63',skull:'#e7c5da',key:'#f5d17e',door:'#a87566',grass:'#92dda1',tree:'#6abb98',belt:'#9ed6d4',star:'#f5cf73',ghost:'#cdbafb',love:'#fb95a4',box:'#a88067',ice:'#a0e9f9',hedge:'#7ccbaa',bug:'#fda5a0',flower:'#f4a7d7'};
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
function poly(points,fill){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function icon(type,x,y,s,dir){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 const c=COLORS[type]||'#d7e2f0';
 ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,0.31,.33,.10,0,0,Math.PI*2);ctx.fill();
 if(type==='baba'){
   rounded(-.27,-.12,.54,.4,.17);ctx.fillStyle='#edf5ff';ctx.fill();
   rounded(-.25,-.42,.14,.36,.07);ctx.fill();rounded(.11,-.42,.14,.36,.07);ctx.fill();
   rounded(-.19,-.31,.045,.16,.03);ctx.fillStyle='#f7a8b7';ctx.fill();rounded(.15,-.31,.045,.16,.03);ctx.fill();
   circle(-.1,.03,.027,'#2b3152');circle(.1,.03,.027,'#2b3152');circle(0,.10,.035,'#ef9cae');
 }else if(type==='keke'){
   ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-.29,.21);ctx.lineTo(-.3,-.24);ctx.lineTo(-.11,-.11);ctx.quadraticCurveTo(0,-.29,.13,-.12);ctx.lineTo(.3,-.26);ctx.lineTo(.28,.21);ctx.quadraticCurveTo(0,.42,-.29,.21);ctx.fill();
   circle(-.1,.03,.036,'#412d39');circle(.1,.03,.036,'#412d39');
 }else if(type==='flag'){
   rounded(-.13,-.39,.055,.77,.02);ctx.fillStyle='#eee7c9';ctx.fill();poly([[-.075,-.35],[.32,-.27],[.2,-.07],[-.075,-.12]],'#ffba78');circle(-.1,.36,.08,'#b5a38b');
 }else if(type==='wall'){
   rounded(-.38,-.33,.76,.64,.07);ctx.fillStyle='#8291ad';ctx.fill();ctx.strokeStyle='#4c607e';ctx.lineWidth=.035;
   for(const y of [-.1,.13]){ctx.beginPath();ctx.moveTo(-.37,y);ctx.lineTo(.37,y);ctx.stroke();}
   for(const [px,a,b] of [[0,-.32,-.1],[-.2,-.1,.13],[.2,-.1,.13],[0,.13,.31]]){ctx.beginPath();ctx.moveTo(px,a);ctx.lineTo(px,b);ctx.stroke();}
 }else if(type==='rock'){
   poly([[-.37,.14],[-.28,-.20],[-.05,-.37],[.24,-.25],[.37,.08],[.2,.33],[-.22,.32]],c);poly([[-.28,-.2],[-.05,-.37],[.11,-.08],[-.1,.06]],'#c7bfcf');poly([[.11,-.08],[.24,-.25],[.37,.08],[.2,.33]],'#747b99');
 }else if(type==='water'){
   for(let i=0;i<3;i++){ctx.strokeStyle=i===1?'#d5f3fd':c;ctx.lineWidth=.075;ctx.lineCap='round';ctx.beginPath();for(let xx=-.34;xx<=.35;xx+=.035){let yy=(-.16+i*.20)+Math.sin((xx+i*.10)*16)*.046;if(xx===-.34)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.stroke();}
 }else if(type==='lava'){
   poly([[-.28,.3],[-.27,-.15],[-.13,-.02],[-.04,-.39],[.10,-.13],[.21,-.23],[.33,.18],[.2,.33]],'#f77b60');poly([[-.1,.27],[0,-.12],[.12,.08],[.19,.3]],'#f6d28c');
 }else if(type==='skull'){
   rounded(-.27,-.31,.54,.51,.24);ctx.fillStyle=c;ctx.fill();rounded(-.17,.08,.34,.25,.06);ctx.fill();circle(-.11,-.06,.084,'#36405a');circle(.11,-.06,.084,'#36405a');poly([[0,0],[-.045,.11],[.045,.11]],'#36405a');
 }else if(type==='key'){
   ctx.lineWidth=.11;ctx.strokeStyle='#f5d17e';ctx.beginPath();ctx.arc(-.14,-.12,.17,0,Math.PI*2);ctx.moveTo(-.02,.01);ctx.lineTo(.28,.31);ctx.lineTo(.38,.19);ctx.moveTo(.18,.21);ctx.lineTo(.29,.10);ctx.stroke();
 }else if(type==='door'){
   rounded(-.28,-.39,.56,.79,.06);ctx.fillStyle='#ad795e';ctx.fill();ctx.strokeStyle='#614c50';ctx.lineWidth=.045;ctx.stroke();rounded(-.18,-.3,.36,.62,.04);ctx.stroke();circle(.12,.06,.038,'#f6cc76');
 }else if(type==='grass'){
   for(let i=-2;i<=2;i++)poly([[i*.12,.3],[i*.12-.09,-.11-i%2*.05],[i*.12+.05,.11],[i*.12+.12,-.26],[i*.12+.1,.3]],i%2?'#6abe90':'#8bd6a0');
 }else if(type==='tree'){
   rounded(-.09,-.08,.18,.44,.04);ctx.fillStyle='#9c765f';ctx.fill();circle(-.15,-.18,.23,'#59af85');circle(.13,-.22,.24,'#74c99c');circle(0,-.35,.21,'#8bdfb0');
 }else if(type==='belt'){
   rounded(-.37,-.18,.74,.37,.08);ctx.fillStyle='#527f8c';ctx.fill();for(let i=-1;i<=1;i++)poly([[i*.22-.09,-.11],[i*.22+.04,0],[i*.22-.09,.11],[i*.22-.015,0]],'#b2eaec');
 }else if(type==='star'){
   const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.17:.38;p.push([Math.cos(a)*r,Math.sin(a)*r]);}poly(p,c);
 }else if(type==='ghost'){
   ctx.beginPath();ctx.arc(0,-.10,.28,Math.PI,0);ctx.lineTo(.28,.29);ctx.lineTo(.14,.20);ctx.lineTo(0,.31);ctx.lineTo(-.14,.20);ctx.lineTo(-.28,.29);ctx.closePath();ctx.fillStyle=c;ctx.fill();circle(-.09,-.06,.036,'#384467');circle(.09,-.06,.036,'#384467');
 }else if(type==='love'){
   ctx.rotate(-Math.PI/4);rounded(-.22,-.17,.44,.44,.04);ctx.fillStyle=c;ctx.fill();circle(0,-.17,.22,c);circle(.22,.05,.22,c);
 }else if(type==='box'){
   rounded(-.32,-.32,.64,.64,.06);ctx.fillStyle='#b48b63';ctx.fill();ctx.strokeStyle='#725b52';ctx.lineWidth=.05;ctx.stroke();ctx.beginPath();ctx.moveTo(-.28,-.28);ctx.lineTo(.28,.28);ctx.moveTo(.28,-.28);ctx.lineTo(-.28,.28);ctx.stroke();
 }else if(type==='ice'){
   poly([[0,-.39],[.31,-.16],[.28,.21],[0,.38],[-.31,.16],[-.28,-.2]],c);poly([[0,-.39],[.31,-.16],[0,-.02],[-.28,-.2]],'#dcfbff');
 }else if(type==='hedge'){
   circle(-.2,.10,.2,'#65b991');circle(0,-.12,.25,'#8ddbaf');circle(.2,.08,.22,'#6ec89d');
 }else if(type==='bug'){
   circle(0,0,.28,c);circle(-.15,-.08,.06,'#55536c');circle(.15,.09,.06,'#55536c');circle(.06,-.18,.05,'#55536c');
 }else if(type==='flower'){
   ctx.fillStyle='#86ce9c';rounded(-.03,0,.06,.36,.02);ctx.fill();for(let i=0;i<6;i++){const a=i*Math.PI/3;circle(Math.cos(a)*.16,-.13+Math.sin(a)*.16,.12,'#f7adcf');}circle(0,-.13,.11,'#f9d67d');
 }
 ctx.restore();
}
function wordTile(o,x,y,s,active){
 const word=o.word||'?';const noun=BabaCore.NOUNS.has(word),verb=BabaCore.VERBS.has(word),property=BabaCore.PROPS.has(word);
 const fg=noun?'#f6b0c4':verb?'#f5e6a1':property?'#b8f4de':'#b6d5fb';
 const bg=noun?'#4a2f50':verb?'#57503c':property?'#2e5054':'#354363';
 ctx.save();ctx.translate(x,y);if(active){ctx.shadowColor=fg;ctx.shadowBlur=s*.17;}
 rounded(-s*.44,-s*.42,s*.88,s*.84,s*.115);ctx.fillStyle=bg;ctx.fill();ctx.strokeStyle=fg;ctx.globalAlpha=active?.9:.48;ctx.lineWidth=s*.028;ctx.stroke();ctx.globalAlpha=1;
 ctx.fillStyle=active?fg:'#c2c7d7';ctx.font=`900 ${Math.min(s*.30,s*2.02/(word.length*.66+1))}px system-ui, sans-serif`;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(word,0,0);
 if(active){ctx.fillStyle=fg;ctx.globalAlpha=.7;rounded(-s*.15,s*.305,s*.3,s*.028,s*.02);ctx.fill();}
 ctx.restore();
}
function draw(){if(!game)return;
 const cw=canvas.width,ch=canvas.height, W=game.width,H=game.height;const s=Math.min(cw/W,ch/H), ox=(cw-W*s)/2,oy=(ch-H*s)/2;
 ctx.fillStyle='#101a2b';ctx.fillRect(0,0,cw,ch);
 // A textured, but quiet, non-Sokoban-looking board.
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   ctx.fillStyle=(x+y)%2===0?'#172339':'#18263d';ctx.fillRect(ox+x*s+.5,oy+y*s+.5,s-1,s-1);
   ctx.fillStyle='#2f4560';ctx.globalAlpha=.2;circle(ox+x*s+s*.5,oy+y*s+s*.5,s*.018,'#7da5b7');ctx.globalAlpha=1;
 }
 const sorted=[...game.objs].sort((a,b)=>a.type==='text'?1:b.type==='text'?-1:0);
 const p=animation?Math.min(1,(performance.now()-animation.time)/135):1;
 for(const o of sorted){
   const prev=animation?.old.get(o.id),x=prev?prev.x+(o.x-prev.x)*p:o.x,y=prev?prev.y+(o.y-prev.y)*p:o.y;
   const px=ox+(x+.5)*s,py=oy+(y+.5)*s;
   if(o.type==='text')wordTile(o,px,py,s,game.activeIds.has(o.id));
   else {if(game.has(o,'WIN')){ctx.strokeStyle='#e7df90';ctx.lineWidth=2;ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(px,py,s*.42,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
     if(game.has(o,'YOU')||game.has(o,'YOU2')){ctx.strokeStyle='#b3f0dc';ctx.lineWidth=s*.035;rounded(px-s*.40,py-s*.39,s*.80,s*.78,s*.21);ctx.stroke();}
     icon(o.type,px,py,s,o.dir);
     if(game.wordIds && game.wordIds.has(o.id)){
       ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
       ctx.fillStyle='#203857';ctx.strokeStyle=game.activeIds.has(o.id)?'#b7f6ed':'#8aa8c7';ctx.lineWidth=s*.027;
       rounded(px-s*.29,py-s*.48,s*.58,s*.20,s*.06);ctx.fill();ctx.stroke();
       ctx.font=`900 ${s*.125}px system-ui,sans-serif`;ctx.fillStyle='#e4f8ff';ctx.fillText('WORD',px,py-s*.375);ctx.restore();
     }}
 }
 if(animation&&p<1)requestAnimationFrame(draw);else animation=null;
}
// Swipe controls on touchscreen.
let touchStart=null;canvas.addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});
canvas.addEventListener('touchend',e=>{if(!touchStart||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];touchStart=null;if(Math.hypot(dx,dy)<24)return;advance(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));},{passive:true});
load(0);
})();
