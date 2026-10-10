/* Independent word-rule puzzle engine. No assets/code from Baba Is You. */
(function (root) {
  'use strict';
  const NOUNS = new Set('BABA KEKE FLAG WALL ROCK WATER LAVA SKULL KEY DOOR GRASS TREE BELT STAR GHOST LOVE BOX ICE HEDGE BUG FLOWER TEXT ALL EMPTY GROUP'.split(' '));
  const PHYSICAL_NOUNS = [...NOUNS].filter(x => !['TEXT','ALL','EMPTY','GROUP'].includes(x));
  const PROPS = new Set('YOU YOU2 WIN STOP PUSH PULL DEFEAT SINK HOT MELT OPEN SHUT WEAK FLOAT TELE SHIFT SWAP MOVE SAFE STILL RED BLUE WORD GROUP UP RIGHT DOWN LEFT'.split(' '));
  const VERBS = new Set(['IS','HAS','MAKE']);
  const CONDITIONS = new Set(['ON','NEAR','FACING','WITHOUT']);
  const WORDS = new Set([...NOUNS, ...PROPS, ...VERBS, ...CONDITIONS, 'AND', 'NOT', 'LONELY']);
  const isText = o => o.type==='text' || o.type==='letter';
  const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
  const clone = data => JSON.parse(JSON.stringify(data));
  const key = (x,y) => x+','+y;

  function scanTokens(tokens, ids, start) {
    let i = start;
    const consume = word => tokens[i] === word ? (i++, true) : false;
    const negate = () => { let count=0; while(consume('NOT')) count++; return Boolean(count%2); };
    let lonely = consume('LONELY');
    function readList(allowProps) {
      const entries = [];
      let need = true;
      while (need) {
        const neg = negate();
        const value = tokens[i];
        if (!value || !(NOUNS.has(value) || (allowProps && PROPS.has(value)))) return null;
        entries.push({ value, neg }); i++;
        if (tokens[i] === 'AND' && tokens[i+1] && (NOUNS.has(tokens[i+1]) || tokens[i+1] === 'NOT' || (allowProps && PROPS.has(tokens[i+1])))) i++;
        else need = false;
      }
      return entries;
    }
    const subjects = readList(false);
    if (!subjects) return [];
    let cond = null;
    if (CONDITIONS.has(tokens[i])) {
      const type = tokens[i++], not = negate();
      if (!NOUNS.has(tokens[i])) return [];
      cond = { type, target: tokens[i++], not };
    }
    const verb = tokens[i++];
    if (!VERBS.has(verb)) return [];
    let targets = readList(verb === 'IS');
    if (!targets) return [];
    // A completed sentence may be the prefix of an unparseable tail.
    const wordIds = ids.slice(start, i).flat();
    const rules = [];
    for (const subject of subjects) for (const target of targets) {
      if (verb !== 'IS' && PROPS.has(target.value)) continue;
      rules.push({ subject:subject.value, subjectNot: subject.neg, verb,
        target:target.value, targetNot:target.neg, lonely, cond, ids:wordIds });
    }
    return rules;
  }

  // Tokens can be one whole word tile, an object with WORD, or a sequence
  // of letter tiles. A single letter can belong to multiple words and rules.
  function parseRules(objects, width, height, wordIds=new Set()) {
    const occupied = new Map();
    for (const obj of objects) {
      if (!isText(obj) && !wordIds.has(obj.id)) continue;
      const p=key(obj.x,obj.y);
      if(!occupied.has(p))occupied.set(p,[]);
      occupied.get(p).push(obj);
    }
    const allRules=[],activeIds=new Set(),signatures=new Set();
    const validSpellings=new Set([...WORDS].filter(w=>w.length>1));
    function emit(tokens,tokenIds) {
      if(tokens.length<3)return;
      // scanTokens can consume a sentence prefix; extra tiles on the same line
      // do not invalidate it. Every logical token keeps its contributing ids.
      for(const rule of scanTokens(tokens,tokenIds,0)) {
        const signature=[rule.subject,rule.subjectNot,rule.verb,rule.target,rule.targetNot,
          rule.lonely,JSON.stringify(rule.cond),rule.ids.join(':')].join('|');
        if(signatures.has(signature))continue;
        signatures.add(signature);allRules.push(rule);
        rule.ids.forEach(id=>activeIds.add(id));
      }
    }
    for(const [dx,dy] of [[1,0],[0,1]]) {
      for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
        if(!occupied.has(key(x,y)) || occupied.has(key(x-dx,y-dy)))continue;
        const cells=[];
        for(let cx=x,cy=y;cx>=0&&cy>=0&&cx<width&&cy<height&&occupied.has(key(cx,cy));cx+=dx,cy+=dy)
          cells.push(occupied.get(key(cx,cy)));
        if(cells.length<3)continue;
        let paths=0;
        function walk(i,tokens,tokenIds) {
          if(++paths>9000 || tokens.length>16)return;
          // Every stopping point is a possible completed sentence.
          emit(tokens,tokenIds);
          if(i>=cells.length)return;
          for(const ob of cells[i]) {
            if(ob.type==='letter') {
              let spell='',letterIds=[];
              for(let j=i;j<cells.length && j<i+12;j++) {
                const letters=cells[j].filter(t=>t.type==='letter');
                // Stacked letters are branched separately, not concatenated.
                if(!letters.length)break;
                // The common case is one letter per tile. For overlaps, fork
                // prefixes recursively so all valid pairings can be reached.
                function combinations(k,text,ids) {
                  if(k>j) {
                    if(validSpellings.has(text) && k-i>=2)
                      walk(k,[...tokens,text],[...tokenIds,ids]);
                    if(k>=cells.length || k-i>=12)return;
                    const next=cells[k].filter(o=>o.type==='letter');
                    for(const n of next)combinations(k+1,text+n.word,[...ids,n.id]);
                    return;
                  }
                }
                if(j===i)for(const first of letters) combinations(i+1,first.word,[first.id]);
                break;
              }
            } else {
              const token=isText(ob)?ob.word:ob.type.toUpperCase();
              if(WORDS.has(token))walk(i+1,[...tokens,token],[...tokenIds,[ob.id]]);
            }
          }
        }
        // Parsing can begin after unrelated text. A NOT prefix cannot be
        // skipped to reinterpret NOT ROCK IS WIN as ROCK IS WIN.
        for(let i=0;i<cells.length-2;i++) {
          if(i && cells[i-1].some(o=>o.type==='text'&&o.word==='NOT'))continue;
          walk(i,[],[]);
        }
      }
    }
    return {rules:allRules,activeIds};
  }

  class Game {
    constructor(level) { this.load(level); }
    load(level) {
      if (!level || !Number.isInteger(level.width) || !Number.isInteger(level.height)) throw new Error('Invalid level dimensions');
      this.level=clone(level); this.width=level.width;this.height=level.height;
      this.objs=(level.objects||[]).map((o,i)=>({id:i+1,x:o.x,y:o.y,type:o.type||'text',...(o.word?{word:o.word.toUpperCase()}:{}),dir:o.dir??1}));
      this.groupIds=new Set();this.nextId=this.objs.length+1; this.history=[];this.future=[];this.turn=0;this.won=false;
      this.refresh();
    }
    snapshot(){return clone({objs:this.objs,nextId:this.nextId,turn:this.turn,won:this.won});}
    restore(s){ this.objs=clone(s.objs);this.nextId=s.nextId;this.turn=s.turn;this.won=s.won;this.refresh(); }
    undo(){if(!this.history.length)return false;this.future.push(this.snapshot());this.restore(this.history.pop());return true;}
    redo(){if(!this.future.length)return false;this.history.push(this.snapshot());this.restore(this.future.pop());return true;}
    restart(){this.load(this.level);}
    inside(x,y){return x>=0&&y>=0&&x<this.width&&y<this.height;}
    at(x,y){return this.objs.filter(o=>o.x===x&&o.y===y);}
    get(id){return this.objs.find(o=>o.id===id);}
    isMatch(obj,subject,subjectNot=false) {
      let valid = subject==='ALL' ? !isText(obj) && obj.type!=='empty' : subject==='TEXT' ? isText(obj) : subject==='GROUP' ? this.groupIds.has(obj.id) : subject==='EMPTY' ? obj.type==='empty' : obj.type.toUpperCase()===subject;
      return subjectNot ? !valid : valid;
    }
    condition(obj,rule) {
      if (rule.lonely && this.at(obj.x,obj.y).some(other=>other.id!==obj.id)) return false;
      if (!rule.cond) return true;
      const c=rule.cond;
      const check = other => other.id!==obj.id && this.isMatch(other,c.target);
      let success=false;
      if(c.type==='ON') success=this.at(obj.x,obj.y).some(check);
      if(c.type==='NEAR') success=this.objs.some(other=>check(other)&&Math.abs(other.x-obj.x)<=1&&Math.abs(other.y-obj.y)<=1);
      if(c.type==='FACING') {const [dx,dy]=DIRS[obj.dir];success=this.at(obj.x+dx,obj.y+dy).some(check);}
      if(c.type==='WITHOUT') success=!this.objs.some(other=>check(other));
      return c.not ? !success : success;
    }
    refresh() {
      // WORD is bootstrapped from literal text on *each* refresh. A WORD object
      // cannot sustain its own WORD status once the originating text is broken.
      let result=parseRules(this.objs,this.width,this.height);
      let wordIds=new Set();
      const seen=new Set();
      for(let round=0;round<12;round++) {
        this.rules=result.rules;
        this.refreshGroups();
        const next=new Set(this.objs.filter(o=>!isText(o) && this.has(o,'WORD')).map(o=>o.id));
        const signature=[...next].sort((a,b)=>a-b).join(',');
        if(signature===[...wordIds].sort((a,b)=>a-b).join(','))break;
        if(seen.has(signature)) break; // cyclic WORD patterns: terminate safely
        seen.add(signature);wordIds=next;
        result=parseRules(this.objs,this.width,this.height,wordIds);
      }
      this.rules=result.rules;this.activeIds=result.activeIds;this.wordIds=wordIds;
      this.refreshGroups();
    }
    // GROUP is membership, not a physical object. Exclude GROUP-subject rules
    // from the seed so self-referential GROUP statements do not bootstrap.
    refreshGroups() {
      this.groupIds=new Set();
      for(let round=0;round<8;round++) {
        const next=new Set(this.groupIds);
        for(const o of this.objs) {
          const direct=this.rules.filter(r=>r.subject!=='GROUP' && r.verb==='IS' &&
            r.target==='GROUP' && this.isMatch(o,r.subject,r.subjectNot) && this.condition(o,r));
          if(direct.some(r=>!r.targetNot) && !direct.some(r=>r.targetNot))next.add(o.id);
        }
        if(next.size===this.groupIds.size)break;
        this.groupIds=next;
      }
    }
    // EMPTY represents absence of any real entity; it never becomes an object
    // in this.objs, so text/physics and empty-cell rules remain distinct.
    emptyAt(x,y){return this.inside(x,y)&&this.at(x,y).length===0;}
    emptyProxy(x,y){return {id:-1-x-y*this.width,x,y,type:'empty',dir:1};}
    emptyHas(prop,x,y){return this.emptyAt(x,y)&&this.has(this.emptyProxy(x,y),prop);}
    applicable(obj,verb) {return this.rules.filter(r=>r.verb===verb && this.isMatch(obj,r.subject,r.subjectNot) && this.condition(obj,r));}
    props(obj) {
      let set=new Set(isText(obj)?['PUSH']:[]), removes=new Set();
      for(const r of this.applicable(obj,'IS')) if(PROPS.has(r.target)) (r.targetNot?removes:set).add(r.target);
      for(const prop of removes) set.delete(prop);
      return set;
    }
    has(obj,prop) {return this.props(obj).has(prop);}
    sameFloat(a,b){return this.has(a,'FLOAT')===this.has(b,'FLOAT');}
    add(type,x,y,dir=1,word) {
      if (!this.inside(x,y)) return null;
      const o={id:this.nextId++,type,x,y,dir}; if (word) o.word=word;
      this.objs.push(o);return o;
    }
    destroy(ids) {
      if (!ids.size) return;
      const removed=this.objs.filter(o=>ids.has(o.id));
      // HAS spawns an object at the location where the source was destroyed.
      const spawns=[];
      for(const o of removed) for(const r of this.applicable(o,'HAS')) {
        if(r.targetNot||(!PHYSICAL_NOUNS.includes(r.target) && r.target!=='TEXT' && r.target!=='GROUP')) continue;
        const targets=r.target==='GROUP'?[...new Set(this.objs.filter(k=>this.groupIds.has(k.id)&&!isText(k)).map(k=>k.type.toUpperCase()))]:[r.target];
        for(const target of targets)spawns.push({type:target==='TEXT'?'text':target.toLowerCase(),word:target==='TEXT'?o.type.toUpperCase():undefined,x:o.x,y:o.y,dir:o.dir});
      }
      this.objs=this.objs.filter(o=>!ids.has(o.id));
      for(const s of spawns) this.add(s.type,s.x,s.y,s.dir,s.word);
      this.refresh();
    }
    // Movement is transactional: a blocked chain never leaves half-pushed objects behind.
    // One movement phase is transactional: failure restores positions, direction,
    // and all collision effects. Already-moved YOU objects must not move twice.
    attempt(id,dx,dy,chain=new Set(),allowPull=true,movedIds=new Set()) {
      const obj=this.get(id);
      if(!obj || this.has(obj,'STILL') || movedIds.has(id))return false;
      const nx=obj.x+dx,ny=obj.y+dy;
      if(chain.has(id))return false;
      if(!this.inside(nx,ny)) {
        if(this.has(obj,'WEAK')&&!this.has(obj,'SAFE')) {this.destroy(new Set([id]));movedIds.add(id);return true;}
        return false;
      }
      // Entering a truly empty space can itself be blocked by EMPTY IS STOP.
      // (EMPTY IS PUSH / EMPTY IS YOU have additional behaviors not claimed.)
      if(this.emptyHas('STOP',nx,ny) && !this.has(obj,'FLOAT'))return false;
      const backup=this.snapshot(), movedBackup=new Set(movedIds);
      const source={x:obj.x,y:obj.y};
      const rollback=()=>{this.restore(backup);movedIds.clear();for(const mid of movedBackup)movedIds.add(mid);chain.delete(id);return false;};
      chain.add(id);
      const occupants=this.at(nx,ny).filter(o=>o.id!==id&&this.sameFloat(obj,o));
      for(const target of occupants) {
        if(!this.get(target.id))continue;
        const unlock=(this.has(obj,'OPEN')&&this.has(target,'SHUT'))||(this.has(obj,'SHUT')&&this.has(target,'OPEN'));
        if(unlock && this.has(target,'STOP')){
          this.destroy(new Set([obj.id,target.id]));movedIds.add(id);chain.delete(id);return true;
        }
        // SWAP bypasses STOP/PUSH; objects moving into or out of SWAP switch places.
        if(this.has(obj,'SWAP')||this.has(target,'SWAP')) {
          target.x=source.x;target.y=source.y;movedIds.add(target.id);
        } else if(this.has(target,'PUSH')) {
          if(!this.attempt(target.id,dx,dy,chain,false,movedIds))return rollback();
        } else if(this.has(target,'STOP')) {
          // A non-pushable WEAK STOP may be entered; overlap reaction removes it.
          if(this.has(target,'WEAK')&&this.sameFloat(obj,target))continue;
          if(this.has(obj,'WEAK')&&!this.has(obj,'SAFE')){
            this.destroy(new Set([id]));movedIds.add(id);chain.delete(id);return true;
          }
          return rollback();
        }
      }
      const moved=this.get(id);
      if(moved){moved.x=nx;moved.y=ny;moved.dir=DIRS.findIndex(d=>d[0]===dx&&d[1]===dy);movedIds.add(id);}
      if(allowPull) {
        const trailing=this.at(source.x-dx,source.y-dy).filter(o=>o.id!==id&&this.sameFloat(obj,o)&&this.has(o,'PULL'));
        for(const pulled of trailing) this.attempt(pulled.id,dx,dy,new Set(),false,movedIds);
      }
      chain.delete(id);return true;
    }
    transforms() {
      const originals=[...this.objs], converted=[], erased=new Set();
      for(const obj of originals) {
        const rules=this.applicable(obj,'IS').filter(r=>NOUNS.has(r.target));
        const forbidden=new Set(rules.filter(r=>r.targetNot).map(r=>r.target));
        const original=obj.type.toUpperCase();
        // X IS NOT X destroys X; excludes any other transformations in that phase.
        if(forbidden.has(original) || rules.some(r=>!r.targetNot&&r.target==='EMPTY')) {erased.add(obj.id);continue;}
        const positive=rules.filter(r=>!r.targetNot && (PHYSICAL_NOUNS.includes(r.target)||r.target==='TEXT') && !forbidden.has(r.target));
        if(positive.some(r=>r.target===original))continue;
        const targets=[...new Set(positive.map(r=>r.target))].filter(t=>t!==original);
        if(targets.length)converted.push({obj,targets});
      }
      if(erased.size)this.destroy(erased);
      for(const {obj,targets} of converted) {
        const source=this.get(obj.id);if(!source)continue;
        const [first,...rest]=targets,originalType=obj.type;
        if(!source.origin)source.origin={type:source.type,word:source.word};
        source.type=first==='TEXT'?'text':first.toLowerCase();
        if(first==='TEXT')source.word=originalType.toUpperCase();else delete source.word;
        for(const t of rest)this.add(t==='TEXT'?'text':t.toLowerCase(),obj.x,obj.y,obj.dir,t==='TEXT'?originalType.toUpperCase():undefined);
      }
      // EMPTY IS NOUN: fill each unoccupied tile exactly once in this phase.
      // Snapshot empties before spawning so iteration cannot grow forever.
      const emptyRules=this.rules.filter(r=>r.subject==='EMPTY'&&r.verb==='IS'&&PHYSICAL_NOUNS.includes(r.target));
      let filled=0;
      if(emptyRules.length)for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++) {
        if(!this.emptyAt(x,y))continue;
        const empty=this.emptyProxy(x,y);
        const matching=emptyRules.filter(r=>this.condition(empty,r));
        const forbidden=new Set(matching.filter(r=>r.targetNot).map(r=>r.target));
        const targets=[...new Set(matching.filter(r=>!r.targetNot&&!forbidden.has(r.target)).map(r=>r.target))];
        for(const type of targets){this.add(type.toLowerCase(),x,y);filled++;}
      }
      if(converted.length||erased.size||filled)this.refresh();
    }
    make() {
      const spawned=[];
      for(const obj of [...this.objs]) for(const r of this.applicable(obj,'MAKE')) {
        if(r.targetNot || (!PHYSICAL_NOUNS.includes(r.target)&&r.target!=='TEXT'&&r.target!=='GROUP'))continue;
        const targets=r.target==='GROUP'?[...new Set(this.objs.filter(o=>this.groupIds.has(o.id)&&!isText(o)).map(o=>o.type.toUpperCase()))]:[r.target];
        for(const target of targets){
          const t=target==='TEXT'?'text':target.toLowerCase();
          if(this.at(obj.x,obj.y).some(other=>other.type===t && (t!=='text'||other.word===obj.type.toUpperCase())))continue;
          spawned.push({t,x:obj.x,y:obj.y,dir:obj.dir,word:t==='text'?obj.type.toUpperCase():undefined});
        }
      }
      for(const s of spawned)this.add(s.t,s.x,s.y,s.dir,s.word);
      if(spawned.length)this.refresh();
    }
    autonomous() {
      const movers=this.objs.filter(o=>this.has(o,'MOVE')).map(o=>o.id);
      for(const id of movers) {
        const o=this.get(id);if(!o)continue;
        const [dx,dy]=DIRS[o.dir];
        if(!this.attempt(id,dx,dy)) {const existing=this.get(id);if(existing)existing.dir=(existing.dir+2)%4;}
      }
      this.refresh();
      const shiftTiles=this.objs.filter(o=>this.has(o,'SHIFT'));
      const shifts=[];
      for(const tile of shiftTiles) for(const obj of this.at(tile.x,tile.y)) if(obj.id!==tile.id&&this.sameFloat(tile,obj)) shifts.push({id:obj.id,dir:tile.dir});
      for(const s of shifts) {const o=this.get(s.id);if(o){const [dx,dy]=DIRS[s.dir];this.attempt(s.id,dx,dy);}}
      this.refresh();
      const portals=this.objs.filter(o=>this.has(o,'TELE'));
      if(portals.length>1){
        const moves=[];
        for(const obj of this.objs) {
          if(portals.some(t=>t.id===obj.id))continue;
          const start=portals.findIndex(t=>t.x===obj.x&&t.y===obj.y&&this.sameFloat(t,obj));
          if(start>=0){const dest=portals[(start+1)%portals.length];moves.push({id:obj.id,x:dest.x,y:dest.y});}
        }
        for(const m of moves){const o=this.get(m.id);if(o){o.x=m.x;o.y=m.y;}}
      }
      this.refresh();
    }
    effects() {
      // Resolve destructive reactions before winning, like the original's broad ordering.
      let kills=new Set();
      const tiles=new Map();
      for(const o of this.objs) {
        const k=key(o.x,o.y);if(!tiles.has(k))tiles.set(k,[]);tiles.get(k).push(o);
      }
      for(const objs of tiles.values()) {
        for(let i=0;i<objs.length;i++)for(let j=i+1;j<objs.length;j++) {
          const a=objs[i],b=objs[j];if(!this.sameFloat(a,b))continue;
          const ap=this.props(a),bp=this.props(b);
          if((ap.has('SINK')||bp.has('SINK')) && a.id!==b.id){if(!ap.has('SAFE'))kills.add(a.id);if(!bp.has('SAFE'))kills.add(b.id);}
          if(ap.has('HOT')&&bp.has('MELT')&&!bp.has('SAFE'))kills.add(b.id);
          if(bp.has('HOT')&&ap.has('MELT')&&!ap.has('SAFE'))kills.add(a.id);
          if(ap.has('DEFEAT')&&(bp.has('YOU')||bp.has('YOU2'))&&!bp.has('SAFE'))kills.add(b.id);
          if(bp.has('DEFEAT')&&(ap.has('YOU')||ap.has('YOU2'))&&!ap.has('SAFE'))kills.add(a.id);
          if(ap.has('OPEN')&&bp.has('SHUT')){if(!ap.has('SAFE'))kills.add(a.id);if(!bp.has('SAFE'))kills.add(b.id);}
          if(bp.has('OPEN')&&ap.has('SHUT')){if(!ap.has('SAFE'))kills.add(a.id);if(!bp.has('SAFE'))kills.add(b.id);}
          if(ap.has('WEAK')&&!ap.has('SAFE'))kills.add(a.id);
          if(bp.has('WEAK')&&!bp.has('SAFE'))kills.add(b.id);
        }
      }
      this.destroy(kills);
      // EMPTY is a virtual cell; it does not coexist with a player. Two
      // properties on EMPTY itself can, however, win on the same empty cell.
      for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++) {
        if(this.emptyHas('YOU',x,y) && this.emptyHas('WIN',x,y)){this.won=true;return;}
      }
      for(const o of this.objs)if((this.has(o,'YOU')||this.has(o,'YOU2'))&&this.has(o,'WIN')){this.won=true;return;}
      for(const a of this.objs)if(this.has(a,'YOU')||this.has(a,'YOU2')){
        for(const b of this.at(a.x,a.y))if(a.id!==b.id&&this.sameFloat(a,b)&&this.has(b,'WIN')){this.won=true;return;}
      }
    }
    step(dir) {
      if(this.won)return false;
      if(dir!==null && (!Number.isInteger(dir)||dir<0||dir>3))return false;
      this.history.push(this.snapshot());if(this.history.length>300)this.history.shift();this.future=[];
      // Explicit facing rules apply before movement, but not as forced movement.
      for(const obj of this.objs){
        for(const [name,value] of [['UP',0],['RIGHT',1],['DOWN',2],['LEFT',3]])
          if(this.has(obj,name)){obj.dir=value;break;}
      }
      if(dir!==null) {
        const [dx,dy]=DIRS[dir],movedIds=new Set();
        const controllers=this.objs.filter(o=>this.has(o,'YOU')||this.has(o,'YOU2')).map(o=>o.id);
        controllers.sort((a,b)=>{const A=this.get(a),B=this.get(b);return dx ? dx*(B.x-A.x) : dy*(B.y-A.y);});
        for(const id of controllers) {const o=this.get(id);if(o&&!movedIds.has(id)) {o.dir=dir;this.attempt(id,dx,dy,new Set(),true,movedIds);}}
      }
      this.refresh();this.transforms();this.make();this.autonomous();this.effects();this.refresh();this.turn++;
      return true;
    }
  }

  const api={Game,parseRules,scanTokens,NOUNS,PHYSICAL_NOUNS,PROPS,VERBS,WORDS,DIRS};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BabaCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
