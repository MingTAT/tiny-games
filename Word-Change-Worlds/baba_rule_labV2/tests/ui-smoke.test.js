const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
function mockApp(){
 const nodes=new Map(),handlers={};
 function element(id=''){
  const events={};const el={id,style:{},dataset:{},textContent:'',disabled:false,children:[],
   classList:{add(){},remove(){},toggle(){}},
   getContext(){return new Proxy({}, {get:(o,p)=>o[p]||(()=>{}),set:(o,p,v)=>{o[p]=v;return true}})},
   getBoundingClientRect(){return {width:820,height:620}},
   addEventListener(k,cb){events[k]=cb},dispatch(k,e){events[k]?.(e)},
   replaceChildren(){this.children=[]},appendChild(n){this.children.push(n)},
   set innerHTML(value){this._innerHTML=value},get innerHTML(){return this._innerHTML||''},
  };return el;
 }
 const ids=['board','chooser','victory','winText','continueButton','chapter','levelTitle','turnCount','ruleList','hintText','hintButton','undoButton','redoButton','winChapter','levels','resetButton','chooseButton','closeChooser','replayButton'];
 ids.forEach(id=>nodes.set(id,element(id)));
 const buttons=['up','right','down','left'].map(d=>{let b=element(d);b.dataset.dir=d;return b;});
 const env={window:{devicePixelRatio:1,addEventListener(k,cb){handlers[k]=cb}},
   document:{getElementById(id){return nodes.get(id)},querySelectorAll(){return buttons},createElement:()=>element()},
   ResizeObserver:class{observe(){}},localStorage:{getItem(){return null},setItem(){}},console};
 const context=vm.createContext(env);
 for(const file of ['engine.js','levels.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return {nodes,handlers,buttons};
}
test('offline browser entrypoint initializes a board, rules and event handlers',()=>{
 const app=mockApp();assert.equal(app.nodes.get('chapter').textContent,'01 / 08');
 assert.ok(app.nodes.get('ruleList').children.length>0);
 assert.equal(app.nodes.get('turnCount').textContent,'00');
 app.handlers.keydown({key:'ArrowRight',preventDefault(){}});
 assert.equal(app.nodes.get('turnCount').textContent,'01');
 app.nodes.get('undoButton').onclick();assert.equal(app.nodes.get('turnCount').textContent,'00');
 app.nodes.get('redoButton').onclick();assert.equal(app.nodes.get('turnCount').textContent,'01');
});
test('level chooser and hint button respond to user interaction',()=>{
 const app=mockApp();app.nodes.get('chooseButton').onclick();
 assert.equal(app.nodes.get('levels').children.length,8);
 app.nodes.get('levels').children[5].dispatch('click');
 assert.equal(app.nodes.get('chapter').textContent,'06 / 08');
 app.nodes.get('hintButton').onclick();assert.match(app.nodes.get('hintText').textContent,/旗帜/);
});
