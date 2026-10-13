/* Words Change Worlds — clean-room puzzle core.
 * Board state and rule parsing are deliberately separate from the renderer.
 * This covers a DOCUMENTED SUBSET of Baba-like interactions, not its full engine.
 */
const WCW = (() => {
  const NOUNS = new Set(['BABA','ROCK','FLAG','WALL','WATER','SKULL','KEY','DOOR','KEKE','TEXT','GRASS']);
  const PROPS = new Set(['YOU','WIN','PUSH','STOP','SINK','DEFEAT','OPEN','SHUT','HOT','MELT','WEAK','FLOAT']);
  const VALID = new Set([...NOUNS,...PROPS,'IS','AND','NOT']);
  const dirs = {up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
  const opposite = {up:'down',right:'left',down:'up',left:'right'};
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function make(level){
    let n=0;
    return {w:level.w,h:level.h,name:level.name||'',units:level.units.map(u=>({id:++n,type:u.type,x:u.x,y:u.y,word:u.word||undefined,dir:u.dir||'right'})),turn:0,status:'playing'};
  }
  function key(x,y){return `${x},${y}`;}
  function inside(s,x,y){return x>=0 && y>=0 && x<s.w && y<s.h;}
  function textAt(s){
    const map = new Map();
    for(const u of s.units) if(u.type==='TEXT'){
      const k=key(u.x,u.y); if(!map.has(k))map.set(k,[]);map.get(k).push(u);
    }
    return map;
  }
  function parse(s){
    const tiles=textAt(s),rules=[],used=new Set(),seen=new Set();
    function get(x,y){return tiles.get(key(x,y))||[];}
    // Parse contiguous phrases, supporting stacked tiles and AND lists on both sides.
    for(const d of [[1,0],[0,1]])for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){
      if(!get(x,y).length) continue;
      const preceding=get(x-d[0],y-d[1]);
      // We also scan internal starts (BABA IS ROCK IS PUSH), so no predecessor guard.
      const lines=[];
      let cx=x,cy=y;
      while(inside(s,cx,cy)&&get(cx,cy).length && lines.length<16){lines.push(get(cx,cy)); cx+=d[0];cy+=d[1];}
      if(lines.length<3)continue;
      function visit(idx, ids, toks){
        if(idx>=lines.length){emit(ids,toks);return;}
        for(const tile of lines[idx]){
          if(!VALID.has(tile.word))continue;
          const next=[...toks,tile.word],nextIds=[...ids,tile.id];
          emit(nextIds,next);
          visit(idx+1,nextIds,next);
        }
      }
      function emit(ids,t){
        const is=t.indexOf('IS');if(is<1||is>=t.length-1)return;
        let subjects=[],predicates=[];
        function list(arr, allowed){
          let out=[],i=0;
          while(i<arr.length){let neg=false;if(arr[i]==='NOT'){neg=true;i++;}
            if(!allowed.has(arr[i]))return null;
            out.push({word:arr[i],not:neg});i++;
            if(i<arr.length){if(arr[i]!=='AND')return null;i++;if(i===arr.length)return null;}
          }return out;
        }
        subjects=list(t.slice(0,is),NOUNS);
        predicates=list(t.slice(is+1),new Set([...NOUNS,...PROPS]));
        if(!subjects||!predicates)return;
        for(const a of subjects)for(const b of predicates){
          if(a.not)continue; // negative subjects deferred, never silently reverse their meaning
          const unique=`${a.word}/${b.not?'!':''}${b.word}/${ids.join(',')}`;
          if(seen.has(unique))continue;seen.add(unique);
          rules.push({subject:a.word,predicate:b.word,not:b.not,tiles:[...ids],display:`${a.word} IS ${b.not?'NOT ':''}${b.word}`});
          ids.forEach(i=>used.add(i));
        }
      }
      visit(0,[],[]);
    }
    return {rules,activeWords:[...used]};
  }
  function propsFor(unit,rules){
    const subject=unit.type==='TEXT'?'TEXT':unit.type;
    const out=new Set(unit.type==='TEXT'?['PUSH']:[]);
    for(const rule of rules) if(rule.subject===subject&&PROPS.has(rule.predicate)){
      if(rule.not)out.delete(rule.predicate);else out.add(rule.predicate);
    }
    // Negation overrides positive in any ordering.
    for(const rule of rules) if(rule.subject===subject&&rule.not&&PROPS.has(rule.predicate))out.delete(rule.predicate);
    return out;
  }
  function effects(s,rules){return new Map(s.units.map(u=>[u.id,propsFor(u,rules)]));}
  function has(u,p,e){return (e.get(u.id)||new Set()).has(p);}
  function overlapAllowed(a,b,p,e){return has(a,'FLOAT',e)===has(b,'FLOAT',e);}
  function moveUnit(s,root,dir,e,already=new Set()){
    if(!root ||already.has(root.id))return false;
    const [dx,dy]=dirs[dir];if(!dx && !dy)return false;
    const plan=new Map(),visiting=new Set();
    // Full transaction: no partial push when the final destination is blocked.
    function traverse(u){
      if(plan.has(u.id))return true;
      if(visiting.has(u.id))return false;
      const nx=u.x+dx,ny=u.y+dy;
      if(!inside(s,nx,ny))return false;
      visiting.add(u.id);
      for(const v of s.units){
        if(v.id===u.id ||v.x!==nx||v.y!==ny)continue;
        // Objects with PUSH must be moved whether or not they also have STOP.
        if(has(v,'PUSH',e)){
          if(!traverse(v)){visiting.delete(u.id);return false;}
        } else if(has(v,'STOP',e)){
          visiting.delete(u.id);return false;
        }
      }
      visiting.delete(u.id);plan.set(u.id,{x:nx,y:ny});return true;
    }
    if(!traverse(root))return false;
    const initial=new Map(s.units.map(u=>[u.id,{x:u.x,y:u.y}]));
    for(const u of s.units)if(plan.has(u.id)){Object.assign(u,plan.get(u.id));already.add(u.id);}
    // Only drag PULL objects from behind successfully moved units.
    const pulled=new Set();
    function drag(fromX,fromY,depth){
      if(depth>s.units.length)return;
      const bx=fromX-dx,by=fromY-dy;
      for(const v of s.units){
        if(v.x!==bx||v.y!==by||plan.has(v.id)||pulled.has(v.id)||!has(v,'PULL',e))continue;
        // PULL is not a wall: failure to pull cannot undo a successful foreground move.
        const obstacle=s.units.some(other=>other.id!==v.id&&other.x===fromX&&other.y===fromY&&(has(other,'STOP',e)||has(other,'PUSH',e)));
        if(obstacle)continue;
        pulled.add(v.id);v.x=fromX;v.y=fromY;already.add(v.id);drag(bx,by,depth+1);
      }
    }
    for(const [id] of plan){let orig=initial.get(id);drag(orig.x,orig.y,0);}
    return true;
  }
  function transform(s,rules){
    const out=[];let next=Math.max(0,...s.units.map(u=>u.id));
    for(const u of s.units){
      const type=u.type==='TEXT'?'TEXT':u.type;
      let dest=rules.filter(r=>r.subject===type&&!r.not&&NOUNS.has(r.predicate)&&r.predicate!==type)
        .filter(r=>!rules.some(n=>n.subject===type&&n.not&&n.predicate===r.predicate))
        .map(r=>r.predicate);
      dest=[...new Set(dest)];
      if(dest.length){for(const d of dest)out.push({...u,id:++next,type:d,word:undefined});}
      else out.push(u);
    }
    s.units=out;
  }
  function contact(s,rules){
    let e=effects(s,rules),removed=new Set();
    for(const a of s.units)for(const b of s.units){
      if(a.id===b.id||a.x!==b.x||a.y!==b.y||!overlapAllowed(a,b,null,e))continue;
      if(has(a,'SINK',e)) {removed.add(a.id);removed.add(b.id);}
      if(has(a,'DEFEAT',e)&&has(b,'YOU',e))removed.add(b.id);
      if(has(a,'HOT',e)&&has(b,'MELT',e))removed.add(b.id);
      if(has(a,'OPEN',e)&&has(b,'SHUT',e)){removed.add(a.id);removed.add(b.id);}
      if(has(a,'WEAK',e))removed.add(a.id);
    }
    if(removed.size){s.units=s.units.filter(u=>!removed.has(u.id));e=effects(s.units.length?s:{...s,units:[]},parse(s).rules);}
    for(const a of s.units){if(!has(a,'YOU',e))continue;
      if(has(a,'WIN',e)){s.status='won';break;}
      if(s.units.some(b=>b.id!==a.id&&b.x===a.x&&b.y===a.y&&has(b,'WIN',e)&&overlapAllowed(a,b,null,e))){s.status='won';break;}
    }
  }
  function step(previous,dir){
    if(previous.status!=='playing'||!dirs[dir])return clone(previous);
    const s=clone(previous),initial=parse(s),e=effects(s,initial.rules),already=new Set();
    // The frontmost YOU moves first, so stacked/multiple player objects are processed once.
    const [dx,dy]=dirs[dir];
    const controlled=s.units.filter(u=>has(u,'YOU',e)).sort((a,b)=>(b.x*dx+b.y*dy)-(a.x*dx+a.y*dy)||a.id-b.id);
    for(const u of controlled){const current=s.units.find(v=>v.id===u.id);if(current)moveUnit(s,current,dir,e,already);}
    const afterMovement=parse(s);transform(s,afterMovement.rules);
    contact(s,parse(s).rules);
    s.turn=previous.turn+1;
    return s;
  }
  function describe(s){const p=parse(s);return { ...p, props:effects(s,p.rules)};}
  function fingerprint(s){return s.units.map(u=>`${u.type}:${u.word||''}@${u.x},${u.y}`).sort().join('|');}
  return {NOUNS,PROPS,dirs,make,parse,propsFor,effects,step,describe,fingerprint,clone};
})();
if(typeof module!=='undefined')module.exports=WCW;
