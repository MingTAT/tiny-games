import {State,Entity,create} from './core';
export type Puzzle = {title:string;hint:string;concept:string; state:State};
const objects:Record<string,string>={'#':'WALL','b':'BABA','r':'ROCK','f':'FLAG','w':'WATER','s':'SKULL','k':'KEKE','d':'DOOR','g':'GRASS'};
function level(title:string,hint:string,concept:string,map:string[],phrases:[string,number,number,('h'|'v')?][],extras:[string,number,number][]=[],stacked:Omit<Entity,'id'|'dir'>[]=[]):Puzzle{
  const list:Omit<Entity,'id'|'dir'>[]=[];
  const w=Math.max(...map.map(x=>x.length));
  for(let y=0;y<map.length;y++)for(let x=0;x<w;x++)if(objects[map[y]?.[x]])list.push({kind:objects[map[y][x]],x,y});
  for(const [phrase,x,y,axis='h'] of phrases)for(const [i,word] of phrase.split(' ').entries())list.push({kind:'TEXT',word,x:x+(axis==='h'?i:0),y:y+(axis==='v'?i:0)});
  for(const [word,x,y] of extras)list.push({kind:'TEXT',word,x,y});
  list.push(...stacked);
  return {title,hint,concept,state:create(w,map.length,list)};
}
const BABA:['BABA IS YOU',number,number]=['BABA IS YOU',0,0];
const FLAG:['FLAG IS WIN',number,number]=['FLAG IS WIN',9,0];
const WALL:['WALL IS STOP',number,number]=['WALL IS STOP',0,8];
export const puzzles:Puzzle[]=[
  level('01 — 打断法律','不是墙消失，而是“墙必须阻挡你”这条法律失效。','规则失效',[
    '......#.....','..b...#..f..','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....'
  ],[BABA,FLAG,['WALL IS STOP',1,5]]),
  level('02 — 改写目标','墙另一侧的旗帜不一定是唯一的 WIN。','重定义胜利',[
    '......#.....','..b.r.#...f.','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....'
  ],[BABA,FLAG,WALL,['ROCK IS',1,5]],[['WIN',3,6]]),
  level('03 — 远方的你','你不必越过墙，只需要让墙另一侧的生物也成为 YOU。','转移控制权',[
    '......#.....','..b...#..f..','......#.....','......#..k..','......#.....','......#.....','......#.....','......#.....','......#.....'
  ],[BABA,FLAG,WALL,['KEKE IS',1,5]],[['YOU',3,6]]),
  level('04 — 对抗旧规则','WALL IS STOP 保留，同时建立 WALL IS NOT STOP。','规则冲突',[
    '......#.....','..b...#..f..','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....'
  ],[BABA,FLAG,WALL,['WALL IS NOT',1,4]],[['STOP',4,5]]),
  level('05 — 身份与胜利','两条规则需要同时成立：谁被控制，以及什么算胜利？','连锁改写',[
    '......#.....','..b...#.....','......#..f..','......#.....','......#.....','......#.....','......#.....','......#.....','......#.....'
  ],[BABA,WALL,['ROCK IS WIN',4,0],['FLAG IS',1,5],['ROCK IS',3,3]],[['ROCK',3,6],['YOU',5,4]]),
  level('06 — 石头就是单词','ROCK IS WORD 使岩石本身可以当作 ROCK 文字。先完成岩石旁边的句子。','物体参与组句',[
    '............','............','............','............','...r...b....','............','.........r..','............','............'
  ],[['ROCK IS WORD',0,0],['BABA IS YOU',7,0]],[['IS',4,4],['WIN',6,4]]),
  level('07 — 岩石变成文字','先完成 ROCK ON WATER IS TEXT。只有站在水上的岩石变成文字，再读取新的横向规则。','条件文字变形',[
    '............','............','............','....b.......','............','...r........','........r...','............','............'
  ],[['BABA IS YOU',6,0],['ROCK ON WATER IS',0,1]],[['TEXT',4,2],['IS',4,5],['WIN',5,5]],[{kind:'WATER',x:3,y:5}])
];
