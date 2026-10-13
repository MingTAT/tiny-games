/* Hand-authored, original puzzles. They teach changes to the rules, not pushing a box onto a flag. */
const LEVELS = (()=>{
  const types={'#':'WALL','b':'BABA','r':'ROCK','f':'FLAG','w':'WATER','s':'SKULL','k':'KEKE','d':'DOOR','g':'GRASS'};
  function build(name,board,phrases,extras,hint,concept){
    const w=Math.max(...board.map(row=>row.length));
    const units=[];
    for(let y=0;y<board.length;y++)for(let x=0;x<w;x++){
      const type=types[(board[y]||'')[x]];
      if(type)units.push({type,x,y});
    }
    for(const [phrase,x,y,axis='h'] of phrases){
      phrase.split(' ').forEach((word,i)=>units.push({type:'TEXT',word,x:x+(axis==='h'?i:0),y:y+(axis==='v'?i:0)}));
    }
    for(const [word,x,y] of extras)units.push({type:'TEXT',word,x,y});
    return {name,w,h:board.length,units,hint,concept};
  }
  const baseBaba=['BABA IS YOU',0,0];
  const baseFlag=['FLAG IS WIN',9,0];
  const baseWall=['WALL IS STOP',0,8];
  const levels=[
    build('01 · 一堵会消失的墙',[
      '......#.....',
      '..b...#..f..',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,['WALL IS STOP',1,5]],[],
    '墙不会消失；消失的是“墙必须阻挡你”这条规定。试着推动 STOP 让它离开句子。','打断一条规则'),
    build('02 · 更换终点',[
      '......#.....',
      '..b.r.#...f.',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,baseWall,['ROCK IS',1,5]], [['WIN',3,6]],
    '旗帜无法到达。别再想怎么去旗帜那里：尝试把 ROCK IS ... 补完整。','重新定义胜利'),
    build('03 · 远处的你',[
      '......#.....',
      '..b...#..f..',
      '......#.....',
      '......#..k..',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,baseWall,['KEKE IS',1,5]], [['YOU',3,6]],
    '你并不需要跨过那道墙。你可以让隔墙另一侧的生物也变成 YOU。','转移控制权'),
    build('04 · 隔墙变身',[
      '......#.....',
      '..b...#..f..',
      '......#.....',
      '......#.r...',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,baseWall,['ROCK IS',1,5]], [['BABA',3,6]],
    '隔墙右侧只有 ROCK。把 ROCK IS BABA 拼好，那里就会出现新的 BABA。','改变实体身份'),
    build('05 · 消失的河',[
      '......#.....',
      '......#.....',
      '......#..f..',
      '......#.....',
      '..b.r.w.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,['WALL IS STOP',0,8],['ROCK IS PUSH',3,0],['WATER IS SINK',6,1]],[],
    '唯一的通路被水占据：水与岩石重叠会一起消失。先把 ROCK 推到水里。','物体接触与消除'),
    build('06 · 两道定义',[
      '......#.....',
      '..b...#.....',
      '......#..f..',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseWall,['ROCK IS WIN',4,0],['FLAG IS',1,5],['ROCK IS',3,3]], [['ROCK',3,6],['YOU',5,4]],
    '一个变化还不够。先把旗帜变成 ROCK，再让 ROCK 同时拥有 YOU 和 WIN。','组合变形与控制规则'),
    build('07 · 重写门的含义',[
      '......#.....',
      '..b...#..f..',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,baseWall,['WALL IS NOT',1,4]], [['STOP',4,5]],
    '有时不需要拆开句子。你可以改变句子表达的意思。把 NOT 插入合适的位置。','否定规则'),
    build('08 · 世界会回答',[
      '............',
      '..b...#..f..',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....'
    ],[baseBaba,baseFlag,baseWall,['BABA IS',1,5]], [['WIN',3,6]],
    '也许你不需要旗帜。你已经拥有一种身份，只差给它增加一个条件。','自身成为胜利条件')
  ];
  return levels;
})();
if(typeof module!=='undefined')module.exports=LEVELS;
