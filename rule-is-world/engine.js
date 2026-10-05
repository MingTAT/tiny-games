class RuleWorldEngine{
 constructor(level){this.load(level)}
 load(level){
  this.level=JSON.parse(JSON.stringify(level));
  this.nextId=1;
  this.entities=this.level.entities.map(e=>({...e,id:`e${this.nextId++}`}));
  this.rules=[];this.history=[];this.steps=0;this.won=false;this.lost=false;this.ruleChanged=false;
  this.parseRules();this.initialRules=JSON.stringify(this.rules);
 }
 snapshot(){return{entities:JSON.parse(JSON.stringify(this.entities)),steps:this.steps,won:this.won,lost:this.lost,ruleChanged:this.ruleChanged}}
 restore(s){this.entities=JSON.parse(JSON.stringify(s.entities));this.steps=s.steps;this.won=s.won;this.lost=s.lost;this.ruleChanged=s.ruleChanged;this.parseRules()}
 save(){this.history.push(this.snapshot());if(this.history.length>300)this.history.shift()}
 undo(){if(!this.history.length)return false;this.restore(this.history.pop());return true}
 at(x,y){return this.entities.filter(e=>e.x===x&&e.y===y)}
 inBounds(x,y){return x>=0&&y>=0&&x<this.level.width&&y<this.level.height}
 property(noun,prop){return this.rules.some(r=>r.type==="property"&&r.subject===noun&&r.property===prop)}
 isPush(e){return e.type==="word"||(e.type==="object"&&this.property(e.noun,"PUSH"))}
 isStop(e){return e.type==="object"&&this.property(e.noun,"STOP")}
 isYou(e){return e.type==="object"&&this.property(e.noun,"YOU")}
 isWin(e){return e.type==="object"&&this.property(e.noun,"WIN")}

 parseRules(){
  const map=new Map();
  for(const e of this.entities)if(e.type==="word"&&!map.has(`${e.x},${e.y}`))map.set(`${e.x},${e.y}`,e);
  const lines=[];
  for(let y=0;y<this.level.height;y++){let a=[];for(let x=0;x<=this.level.width;x++){const w=map.get(`${x},${y}`);if(w)a.push(w);else if(a.length){lines.push(a);a=[]}}}
  for(let x=0;x<this.level.width;x++){let a=[];for(let y=0;y<=this.level.height;y++){const w=map.get(`${x},${y}`);if(w)a.push(w);else if(a.length){lines.push(a);a=[]}}}
  let out=[];for(const line of lines)out.push(...this.parseLine(line));
  const seen=new Set();this.rules=out.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true});
  if(this.initialRules!==undefined&&JSON.stringify(this.rules)!==this.initialRules)this.ruleChanged=true;
 }
 parseLine(t){
  if(t.length<3)return[];
  const oi=t.findIndex(x=>x.kind==="op"&&x.word==="IS");if(oi<=0||oi>=t.length-1)return[];
  const left=this.group(t.slice(0,oi),"noun");if(!left)return[];
  const right=this.mixed(t.slice(oi+1));if(!right)return[];
  const out=[];
  for(const s of left)for(const r of right){
   if(r.kind==="prop")out.push({type:"property",subject:s,property:r.word});
   else out.push({type:"transform",subject:s,target:r.word});
  }
  return out;
 }
 group(t,kind){const v=[];for(let i=0;i<t.length;i++){if(i%2===0){if(t[i].kind!==kind)return null;v.push(t[i].word)}else if(t[i].kind!=="and")return null}return v}
 mixed(t){const v=[];for(let i=0;i<t.length;i++){if(i%2===0){if(!["noun","prop"].includes(t[i].kind))return null;v.push({word:t[i].word,kind:t[i].kind})}else if(t[i].kind!=="and")return null}return v}
 applyTransforms(){
  const trs=this.rules.filter(r=>r.type==="transform"&&r.subject!==r.target);let changed=false;
  const map=new Map();for(const r of trs)if(!map.has(r.subject))map.set(r.subject,r.target);
  for(const e of this.entities)if(e.type==="object"&&map.has(e.noun)){e.noun=map.get(e.noun);changed=true}
  return changed
 }
 settle(){
  for(let i=0;i<5;i++){this.parseRules();if(!this.applyTransforms())break}
  this.parseRules();this.resolve();this.parseRules();this.checkWin();this.checkLoss()
 }
 destroy(ids){const s=new Set(ids);this.entities=this.entities.filter(e=>!s.has(e.id))}
 resolve(){
  let again=true,guard=0;
  while(again&&guard++<6){again=false;const kill=new Set(),cells=new Map();
   for(const e of this.entities){const k=`${e.x},${e.y}`;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(e)}
   for(const g of cells.values()){
    const o=g.filter(e=>e.type==="object");if(!o.length)continue;
    const sinks=o.filter(e=>this.property(e.noun,"SINK"));
    if(sinks.length&&g.length>sinks.length)g.forEach(e=>kill.add(e.id));
    const defeats=o.filter(e=>this.property(e.noun,"DEFEAT"));
    if(defeats.length)o.filter(e=>this.property(e.noun,"YOU")).forEach(e=>kill.add(e.id));
    const opens=o.filter(e=>this.property(e.noun,"OPEN")),shuts=o.filter(e=>this.property(e.noun,"SHUT"));
    if(opens.length&&shuts.length){opens.forEach(e=>kill.add(e.id));shuts.forEach(e=>kill.add(e.id))}
   }
   if(kill.size){this.destroy([...kill]);again=true}
  }
 }
 compatibleDestroy(mover,other){
  return mover.type==="object"&&other.type==="object"&&(
   (this.property(mover.noun,"OPEN")&&this.property(other.noun,"SHUT"))||
   (this.property(mover.noun,"SHUT")&&this.property(other.noun,"OPEN"))
  )
 }
 tryMove(e,dx,dy,trail=new Set()){
  if(trail.has(e.id))return false;trail.add(e.id);
  const nx=e.x+dx,ny=e.y+dy;if(!this.inBounds(nx,ny))return false;
  const occ=this.at(nx,ny).filter(o=>o.id!==e.id);
  for(const o of occ){
   if(this.compatibleDestroy(e,o))continue;
   if(this.isPush(o)){if(!this.tryMove(o,dx,dy,trail))return false}
   else if(this.isStop(o))return false;
  }
  e.x=nx;e.y=ny;return true
 }
 move(dx,dy){
  if(this.won||this.lost)return false;
  const you=this.entities.filter(e=>this.isYou(e));if(!you.length)return false;
  this.save();
  for(const e of you)this.tryMove(e,dx,dy,new Set());
  this.steps++;this.settle();return true
 }
 checkWin(){
  const ys=this.entities.filter(e=>this.isYou(e)),ws=this.entities.filter(e=>this.isWin(e));
  for(const y of ys)for(const w of ws)if(y.x===w.x&&y.y===w.y&&this.ruleChanged){this.won=true;return true}
  return false
 }
 checkLoss(){if(!this.entities.some(e=>this.isYou(e))&&!this.won)this.lost=true}
 serialize(){
  return this.entities.map(e=>`${e.type}:${e.type==="word"?e.word:e.noun}:${e.x},${e.y}`).sort().join("|")+"#"+JSON.stringify(this.rules);
 }
}
