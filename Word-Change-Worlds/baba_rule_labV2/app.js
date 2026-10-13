/* Rendering and interaction are deliberately decoupled from WCW state logic. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const canvas=$('board'),ctx=canvas.getContext('2d');
 const state={index:0,game:null,history:[],future:[],seen:new Set(),hint:false,chooser:false};
 const colors={BABA:'#fff0be',KEKE:'#92f0db',ROCK:'#a7a4bc',FLAG:'#ffc86b',WALL:'#817baf',WATER:'#6ec6ef',SKULL:'#fa8e9b',KEY:'#e2c26c',DOOR:'#a17b77',GRASS:'#86cb95'};
 const saved=()=>{try{return JSON.parse(localStorage.getItem('wcw-rebuild-progress')||'[]')}catch{return []}};
 const completed=new Set(saved());
 function persist(){try{localStorage.setItem('wcw-rebuild-progress',JSON.stringify([...completed]))}catch{}}
 function load(index){state.index=index;state.game=WCW.make(LEVELS[index]);state.history=[];state.future=[];state.hint=false;state.chooser=false;state.seen=new Set([WCW.fingerprint(state.game)]);$('chooser').classList.add('hidden');$('victory').classList.add('hidden');update();}
 function undo(){if(!state.history.length)return;state.future.push(WCW.clone(state.game));state.game=state.history.pop();$('victory').classList.toggle('hidden',state.game.status!=='won');update();}
 function redo(){if(!state.future.length)return;state.history.push(WCW.clone(state.game));state.game=state.future.pop();$('victory').classList.toggle('hidden',state.game.status!=='won');update();}
 function action(dir){if(state.chooser||state.game.status!=='playing')return;
   const old=WCW.clone(state.game),next=WCW.step(state.game,dir);
   const changed=WCW.fingerprint(next)!==WCW.fingerprint(old);
   if(!changed)return;
   state.history.push(old);state.future=[];state.game=next;
   if(next.status==='won'){completed.add(state.index);persist();$('victory').classList.remove('hidden');$('winText').textContent=LEVELS[state.index].concept;$('continueButton').textContent=state.index===LEVELS.length-1?'回到关卡列表':'继续下一关 →';}
   update();
 }
 function rect(x,y,w,h,r,fill,stroke,width=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
 function poly(points,fill,stroke,width=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
 function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
 function drawEntity(u,x,y,s,t){
   const type=u.type,c=colors[type]||'#d8d1fa';ctx.save();ctx.translate(x,y);
   if(type==='WALL'){
     rect(s*.055,s*.055,s*.89,s*.89,s*.18,'#50546f','#888caf',s*.025);
     rect(s*.12,s*.11,s*.76,s*.30,s*.12,'#777b9c');
     rect(s*.12,s*.52,s*.76,s*.35,s*.12,'#696d8e');
     ctx.strokeStyle='#454962';ctx.lineWidth=s*.034;ctx.beginPath();ctx.moveTo(s*.51,s*.12);ctx.lineTo(s*.51,s*.41);ctx.moveTo(s*.35,s*.54);ctx.lineTo(s*.35,s*.85);ctx.stroke();
   } else if(type==='BABA'||type==='KEKE'){
     ellipse(s*.5,s*.79,s*.31,s*.1,'#151a33a9');
     const main=type==='BABA'?'#fff1d8':'#91e8d0',edge=type==='BABA'?'#dbbfa9':'#3d9f98';
     ellipse(s*.49,s*.54,s*.29,s*.3,main);ellipse(s*.36,s*.32,s*.11,s*.15,main);ellipse(s*.63,s*.32,s*.11,s*.15,main);
     ellipse(s*.40,s*.52,s*.043,s*.06,'#29263b');ellipse(s*.60,s*.52,s*.043,s*.06,'#29263b');
     ellipse(s*.5,s*.64,s*.043,s*.028,edge);ellipse(s*.3,s*.75,s*.09,s*.07,main);ellipse(s*.69,s*.75,s*.09,s*.07,main);
     ellipse(s*.34,s*.63,s*.05,s*.028,type==='BABA'?'#f7b3b9':'#f3ddb5');ellipse(s*.66,s*.63,s*.05,s*.028,type==='BABA'?'#f7b3b9':'#f3ddb5');
   } else if(type==='ROCK'){
     ellipse(s*.52,s*.82,s*.32,s*.085,'#0c112899');
     poly([[s*.17,s*.72],[s*.24,s*.38],[s*.45,s*.2],[s*.71,s*.31],[s*.84,s*.64],[s*.69,s*.8],[s*.28,s*.8]],'#aaaac4','#706f99',s*.04);
     poly([[s*.25,s*.4],[s*.45,s*.23],[s*.55,s*.4],[s*.39,s*.54]],'#d0d0e1');
     poly([[s*.55,s*.42],[s*.7,s*.34],[s*.78,s*.65],[s*.57,s*.7]],'#8585b0');
   } else if(type==='FLAG'){
     ellipse(s*.5,s*.85,s*.27,s*.07,'#0c112999');
     rect(s*.40,s*.2,s*.05,s*.64,s*.02,'#e3e8ed');
     poly([[s*.45,s*.21],[s*.85,s*.29],[s*.73,s*.46],[s*.45,s*.48]],'#ffbc6b','#ffe4a1',s*.022);
     poly([[s*.45,s*.21],[s*.71,s*.265],[s*.60,s*.41],[s*.45,s*.48]],'#ff7e84');
   } else if(type==='WATER'){
     rect(s*.08,s*.31,s*.84,s*.5,s*.24,'#3d97c9');
     ctx.strokeStyle='#ace8f2';ctx.lineWidth=s*.055;ctx.lineCap='round';for(let i=0;i<2;i++){let yy=s*(.47+i*.18);ctx.beginPath();ctx.moveTo(s*.23,yy);ctx.quadraticCurveTo(s*.38,yy-s*.09,s*.52,yy);ctx.quadraticCurveTo(s*.66,yy+s*.08,s*.77,yy);ctx.stroke()}
   } else if(type==='SKULL'){
     ellipse(s*.5,s*.52,s*.29,s*.28,'#f7b6bc');rect(s*.36,s*.57,s*.28,s*.2,s*.05,'#f7b6bc');
     ellipse(s*.4,s*.52,s*.072,s*.093,'#51384b');ellipse(s*.60,s*.52,s*.072,s*.093,'#51384b');
     poly([[s*.5,s*.59],[s*.44,s*.66],[s*.56,s*.66]],'#51384b');
   } else if(type==='GRASS'){
     for(let i=0;i<5;i++){let bx=s*(.23+i*.135);poly([[bx,s*.8],[bx-s*.05,s*.43],[bx+s*.08,s*.56]],i%2?'#70c58d':'#99deb0');}
   } else if(type==='DOOR'){
     rect(s*.23,s*.16,s*.53,s*.72,s*.07,'#a96d6a','#edb4a3',s*.03);ellipse(s*.63,s*.57,s*.04,s*.04,'#f6d09e');
   } else if(type==='KEY'){
     ctx.strokeStyle='#f8d873';ctx.lineWidth=s*.09;ctx.beginPath();ctx.arc(s*.38,s*.38,s*.14,0,Math.PI*2);ctx.moveTo(s*.48,s*.48);ctx.lineTo(s*.76,s*.76);ctx.moveTo(s*.65,s*.65);ctx.lineTo(s*.74,s*.57);ctx.stroke();
   }
   ctx.restore();
 }
 function paint(){
   const g=state.game;if(!g)return;const r=canvas.getBoundingClientRect();
   if(r.width<1||r.height<1)return;let pixelRatio=Math.min(2,window.devicePixelRatio||1);
   canvas.width=Math.round(r.width*pixelRatio);canvas.height=Math.round(r.height*pixelRatio);
   ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.clearRect(0,0,r.width,r.height);
   const tile=Math.min((r.width-16)/g.w,(r.height-16)/g.h),ox=(r.width-g.w*tile)/2,oy=(r.height-g.h*tile)/2;
   const p=WCW.describe(g),active=new Set(p.activeWords);
   rect(ox-5,oy-5,g.w*tile+10,g.h*tile+10,tile*.22,'#1b203a','#535776',2);
   for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){
     rect(ox+x*tile+.5,oy+y*tile+.5,tile-1,tile-1,tile*.095,((x+y)%2)?'#242a45':'#272d49');
     if((x*13+y*7)%11===0){ellipse(ox+(x+.30)*tile,oy+(y+.68)*tile,tile*.024,tile*.024,'#38405f');}
   }
   const ordinary=g.units.filter(u=>u.type!=='TEXT'),words=g.units.filter(u=>u.type==='TEXT');
   for(const u of ordinary)drawEntity(u,ox+u.x*tile,oy+u.y*tile,tile,g.turn);
   for(const u of words){
     let x=ox+u.x*tile,y=oy+u.y*tile,isOn=active.has(u.id);
     ctx.shadowBlur=isOn?tile*.24:0;ctx.shadowColor='#ffcf86';
     rect(x+tile*.075,y+tile*.08,tile*.85,tile*.84,tile*.13,isOn?'#ffebad':'#d8d2e8',isOn?'#fff3d3':'#918cb5',tile*.028);
     ctx.shadowBlur=0;
     rect(x+tile*.12,y+tile*.13,tile*.76,tile*.73,tile*.092,isOn?'#fff5c6':'#eeeaf7');
     let n=u.word.length;let size=n>=6?.17:n>=5?.197:n>=4?.235:.28;
     ctx.fillStyle=isOn?'#6a422e':'#403b61';ctx.font=`900 ${tile*size}px system-ui, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
     ctx.fillText(u.word,x+tile*.5,y+tile*.52,tile*.78);
   }
 }
 function update(){
   const lev=LEVELS[state.index],g=state.game;
   $('chapter').textContent=String(state.index+1).padStart(2,'0')+' / '+String(LEVELS.length).padStart(2,'0');
   $('levelTitle').textContent=lev.name.replace(/^\d+ · /,'');
   $('turnCount').textContent=String(g.turn).padStart(2,'0');
   $('ruleList').replaceChildren();
   let seen=new Set();for(const rule of WCW.parse(g).rules){
     if(seen.has(rule.display))continue;seen.add(rule.display);
     let e=document.createElement('span');e.className='rule-chip';e.textContent=rule.display;$('ruleList').appendChild(e);
   }
   if(!seen.size){let e=document.createElement('span');e.className='empty-rule';e.textContent='没有正在生效的规则';$('ruleList').appendChild(e);}
   $('hintText').textContent=state.hint?lev.hint:'在棋盘中推动文字，改写这个世界的规则。';
   $('hintButton').textContent=state.hint?'隐藏提示':'显示提示';
   $('undoButton').disabled=!state.history.length;$('redoButton').disabled=!state.future.length;
   $('winChapter').textContent='关卡 '+String(state.index+1).padStart(2,'0');
   paint();
 }
 function showChooser(){state.chooser=true;const chooser=$('chooser');chooser.classList.remove('hidden');$('levels').replaceChildren();LEVELS.forEach((level,i)=>{
   const b=document.createElement('button');b.className='level-option'+(completed.has(i)?' done':'')+(i===state.index?' selected':'');
   b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><small>${level.name.replace(/^\d+ · /,'')}</small>${completed.has(i)?'<em>✓</em>':''}`;
   b.addEventListener('click',()=>load(i));$('levels').appendChild(b);
 });}
 function bind(){
   window.addEventListener('keydown',ev=>{
     if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(ev.key))ev.preventDefault();
     if(state.chooser){if(ev.key==='Escape'){state.chooser=false;$('chooser').classList.add('hidden');}return;}
     const k=ev.key.toLowerCase(),mapped={arrowup:'up',w:'up',arrowright:'right',d:'right',arrowdown:'down',s:'down',arrowleft:'left',a:'left'};
     if(mapped[k]){if(state.game.status==='won')return;action(mapped[k]);}
     else if(k==='z'||k==='backspace')undo();else if(k==='y')redo();else if(k==='r')load(state.index);
     else if(k==='escape')showChooser();else if(k==='enter'&&state.game.status==='won')advance();
   });
   document.querySelectorAll('[data-dir]').forEach(btn=>btn.addEventListener('click',()=>action(btn.dataset.dir)));
   $('undoButton').onclick=undo;$('redoButton').onclick=redo;$('resetButton').onclick=()=>load(state.index);
   $('chooseButton').onclick=showChooser;$('closeChooser').onclick=()=>{state.chooser=false;$('chooser').classList.add('hidden');};
   $('hintButton').onclick=()=>{state.hint=!state.hint;update();};
   $('continueButton').onclick=advance;
   $('replayButton').onclick=()=>load(state.index);
   let point=null;canvas.addEventListener('pointerdown',e=>point={x:e.clientX,y:e.clientY});
   canvas.addEventListener('pointerup',e=>{if(!point)return;const dx=e.clientX-point.x,dy=e.clientY-point.y;point=null;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;action(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
   new ResizeObserver(()=>paint()).observe(canvas);
 }
 function advance(){if(state.index+1===LEVELS.length){$('victory').classList.add('hidden');showChooser();}else load(state.index+1);}
 bind();load(0);
})();
