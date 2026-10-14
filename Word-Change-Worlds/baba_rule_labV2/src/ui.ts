import {State,Direction,Entity,parse,props,step,clone,Rule,fingerprint} from './core';
import {puzzles} from './levels';

const canvas=document.querySelector<HTMLCanvasElement>('#world')!;
const ctx=canvas.getContext('2d')!;
const shell=document.querySelector<HTMLElement>('#game-area')!;
const rulesEl=document.querySelector<HTMLElement>('#rules')!;
const turnEl=document.querySelector<HTMLElement>('#turn')!;
const statusEl=document.querySelector<HTMLElement>('#status')!;
const titleEl=document.querySelector<HTMLElement>('#level-title')!;
const levelEl=document.querySelector<HTMLElement>('#levels')!;
const hintEl=document.querySelector<HTMLElement>('#hint')!;
const traceEl=document.querySelector<HTMLElement>('#trace')!;
let level=13; // Advanced puzzles open by default; the earlier seven remain as optional lessons.
let state:State=clone(puzzles[level].state);
const overlay=document.querySelector<HTMLElement>('#win-overlay')!;
const nextButton=document.querySelector<HTMLButtonElement>('#next-level')!;
const victoryTitle=document.querySelector<HTMLElement>('#victory-title')!;
const victoryDetail=document.querySelector<HTMLElement>('#victory-detail')!;
const completed=new Set<number>();
try { for(const key of ['wcw-engine-1.2-completed','wcw-engine-1.3-completed']) for(const n of JSON.parse(localStorage.getItem(key)||'[]')) if(Number.isInteger(n))completed.add(n); } catch { /* Browsers may block file:// storage. */ }
function rememberWin(){completed.add(level);try{localStorage.setItem('wcw-engine-1.3-completed',JSON.stringify([...completed]));}catch{}}
let past:State[]=[];
let future:State[]=[];
let lastEvents:string[]=[];
const C={background:'#101d28',board:'#172937',floor:'#203746',stroke:'#334b57',word:'#f1e0ae',wordBorder:'#ccac64',ink:'#293041',baba:'#f1f0dc',keke:'#d9b2ef',rock:'#aaa4a0',wall:'#65858f',flag:'#f3c16c',water:'#4ba4c3',skull:'#e0ded8',key:'#f6d47f',door:'#ba8b68'};
function choose(i:number){level=i;state=clone(puzzles[i].state);past=[];future=[];lastEvents=[];hintEl.textContent='';draw();}
function apply(dir:Direction|'wait'){
  if(state.status==='won')return;
  past.push(clone(state));if(past.length>500)past.shift();future=[];
  const result=step(state,dir);state=result.state;
  lastEvents=result.events.filter(e=>e.type!=='reparse').map(e=>`${e.phase} · ${e.type} ${e.detail||''}`).slice(-7);
  if(state.status==='won')rememberWin();
  draw();
}
function undo(){if(!past.length)return;future.push(clone(state));state=past.pop()!;lastEvents=['undo'];draw();}
function redo(){if(!future.length)return;past.push(clone(state));state=future.pop()!;lastEvents=['redo'];draw();}
function restart(){choose(level);}
function roundRect(x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
function tileShape(e:Entity,x:number,y:number,size:number){
  const cx=x+size/2,cy=y+size/2;
  ctx.save();ctx.translate(cx,cy);
  const col=(C as Record<string,string>)[e.kind.toLowerCase()]||'#b8d1a3';
  ctx.fillStyle=col;ctx.strokeStyle='#182936';ctx.lineWidth=2;
  const t=size*.30;
  switch(e.kind){
    case 'BABA':
    case 'KEKE':
      ctx.beginPath();ctx.ellipse(0,2,t*.8,t*.77,0,0,2*Math.PI);ctx.fill();ctx.stroke();
      for(const dx of [-t*.45,t*.45]){ctx.beginPath();ctx.ellipse(dx,-t*.75,t*.29,t*.52,0,0,2*Math.PI);ctx.fill();ctx.stroke();}
      ctx.fillStyle='#26353b';ctx.fillRect(-t*.34,-2,3,4);ctx.fillRect(t*.24,-2,3,4);break;
    case 'FLAG':
      ctx.lineWidth=3;ctx.strokeStyle='#f8e8c1';ctx.beginPath();ctx.moveTo(-t*.4,t);ctx.lineTo(-t*.4,-t);ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-t*.37,-t);ctx.lineTo(t*.95,-t*.6);ctx.lineTo(-t*.37,-t*.05);ctx.closePath();ctx.fill();break;
    case 'WALL':
      roundRect(-t,-t,t*2,t*2,3,col,'#385a65');
      ctx.strokeStyle='#365866';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-t,0);ctx.lineTo(t,0);ctx.moveTo(0,-t);ctx.lineTo(0,0);ctx.moveTo(-t*.55,0);ctx.lineTo(-t*.55,t);ctx.stroke();break;
    case 'ROCK':
      ctx.beginPath();ctx.moveTo(-t,-t*.1);ctx.lineTo(-t*.42,-t*.88);ctx.lineTo(t*.50,-t*.7);ctx.lineTo(t,t*.23);ctx.lineTo(t*.25,t*.83);ctx.lineTo(-t*.74,t*.68);ctx.closePath();ctx.fill();ctx.stroke();break;
    case 'WATER':ctx.beginPath();ctx.ellipse(0,4,t,t*.65,0,0,2*Math.PI);ctx.fill();break;
    default:
      ctx.beginPath();ctx.arc(0,0,t,0,2*Math.PI);ctx.fill();ctx.stroke();
      ctx.fillStyle='#182936';ctx.font=`bold ${Math.floor(size*.25)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.kind.slice(0,1),0,0);
  }
  ctx.restore();
}
function render(){
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle=C.background;ctx.fillRect(0,0,w,h);
  const size=Math.min((w-30)/state.width,(h-26)/state.height);const ox=(w-size*state.width)/2,oy=(h-size*state.height)/2;
  roundRect(ox-7,oy-7,state.width*size+14,state.height*size+14,13,C.board);
  for(let y=0;y<state.height;y++)for(let x=0;x<state.width;x++){
    roundRect(ox+x*size+1.3,oy+y*size+1.3,size-2.6,size-2.6,Math.max(2,size*.1),C.floor);
  }
  const rs=parse(state);const used=new Set(rs.flatMap(r=>r.wordIds));
  for(const e of state.entities.filter(e=>e.kind!=='TEXT')){
    const x=ox+e.x*size,y=oy+e.y*size;
    if(used.has(e.id)){
      roundRect(x+size*.08,y+size*.08,size*.84,size*.84,Math.max(4,size*.14),'#b58a4e','#f1ce81');
    }
    tileShape(e,x,y,size);
  }
  for(const e of state.entities.filter(e=>e.kind==='TEXT')){
    const x=ox+e.x*size,y=oy+e.y*size;const active=used.has(e.id);
    roundRect(x+size*.065,y+size*.075,size*.87,size*.85,Math.max(4,size*.11),active?'#f5dc99':C.word,active?'#d5a250':C.wordBorder);
    const word=e.word||'';const n=word.length;
    const f=Math.min(size*.25,(size*.77)/(Math.max(2,n)*.62));
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.max(8,Math.floor(f))}px system-ui, sans-serif`;ctx.fillStyle=C.ink;
    ctx.fillText(word,x+size*.5,y+size*.52,size*.8);
  }

}
function draw(){
  const won=state.status==='won';
  overlay.hidden=!won;
  if(won){victoryTitle.textContent=level===puzzles.length-1?'进阶挑战完成！':'关卡完成！';victoryDetail.textContent=`${puzzles[level].title} · ${state.turn} 步`;nextButton.textContent=level<puzzles.length-1?'下一关 →':'返回关卡列表';}
  titleEl.textContent=puzzles[level].title;
  turnEl.textContent=String(state.turn);
  statusEl.textContent=state.status==='won'?'已通关':'进行中';
  const active=parse(state);
  const list=[...new Set(active.map(r=>`${r.subjectNegated?'NOT ':''}${r.subject}${r.conditions.map(c=>c.kind==='LONELY'?' LONELY':` ${c.kind} ${c.negated?'NOT ':''}${c.target}`).join('')} ${r.verb} ${r.predicateNegated?'NOT ':''}${r.predicate}`))];
  rulesEl.replaceChildren();for(const str of list){const tag=document.createElement('span');tag.className='rule-tag';tag.textContent=str;rulesEl.appendChild(tag);}
  if(!list.length)rulesEl.textContent='暂无生效规则';
  traceEl.textContent=lastEvents.join('\n')||'每次行动的事件轨迹会在这里显示。';
  levelEl.replaceChildren();puzzles.forEach((l,i)=>{
    const b=document.createElement('button');b.className=`level-btn ${i===level?'selected':''} ${i>=7?'advanced':''} ${completed.has(i)?'cleared':''}`;b.textContent=`${completed.has(i)?'✓ ':''}${String(i+1).padStart(2,'0')}`;b.title=l.concept;b.onclick=()=>choose(i);levelEl.appendChild(b);
  });
  render();
}
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();const map:Record<string,Direction>={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
  if(key==='enter'&&state.status==='won'){e.preventDefault();goNext();}
  else if(map[key]){e.preventDefault();apply(map[key]);}
  else if(key==='z'){e.preventDefault();undo();}
  else if(key==='y'){e.preventDefault();redo();}
  else if(key==='r'){e.preventDefault();restart();}
  else if(key===' '){e.preventDefault();apply('wait');}
});
document.querySelectorAll<HTMLElement>('[data-action]').forEach(b=>b.addEventListener('click',()=>{
  const action=b.dataset.action!;
  if(action==='undo')undo();else if(action==='redo')redo();else if(action==='restart')restart();else if(action==='wait')apply('wait');
  else if(action==='hint'){hintEl.textContent=puzzles[level].hint;}
  else apply(action as Direction);
}));
function goNext(){if(level<puzzles.length-1)choose(level+1);else {overlay.hidden=true;levelEl.scrollIntoView({behavior:'smooth',block:'nearest'});}}
nextButton.addEventListener('click',goNext);
document.querySelector<HTMLButtonElement>('#replay-level')!.addEventListener('click',restart);
document.querySelector<HTMLButtonElement>('#view-levels')!.addEventListener('click',()=>{overlay.hidden=true;levelEl.scrollIntoView({behavior:'smooth',block:'nearest'});});
let touch:{x:number;y:number}|null=null;
canvas.addEventListener('touchstart',e=>{if(e.touches.length)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
canvas.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;apply(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));},{passive:true});
canvas.width=960;canvas.height=690;draw();
// Debug hooks used only in smoke tests; no mutation of game internals.
(window as typeof window&{WCW_DEBUG?:unknown}).WCW_DEBUG={getState:()=>clone(state),getFingerprint:()=>fingerprint(state),choose,apply,undo,redo};
