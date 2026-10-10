(function(root){
'use strict';
// Original maps authored specifically for this implementation; not copied from any commercial game.
const levels=[];
function create(title,subtitle,goal,build){
 const a=[];const o=(type,x,y,dir=1)=>a.push({type,x,y,dir});
 // Separate word helper so every text tile carries its token.
 const words=(words,x,y,dx=1,dy=0)=>words.split(' ').forEach((word,i)=>a.push({type:'text',word,x:x+dx*i,y:y+dy*i}));
 const row=(type,x1,x2,y)=>{for(let x=x1;x<=x2;x++)o(type,x,y);};
 const col=(type,x,y1,y2)=>{for(let y=y1;y<=y2;y++)o(type,x,y);};
 const rect=(type,x1,y1,x2,y2)=>{row(type,x1,x2,y1);row(type,x1,x2,y2);col(type,x1,y1+1,y2-1);col(type,x2,y1+1,y2-1);};
 const dots=(type,positions)=>positions.forEach(([x,y])=>o(type,x,y));
 build({o,words,row,col,rect,dots});
 levels.push({title,subtitle,goal,width:16,height:12,objects:a});
}
create('01 · 一句话，整个世界','规则诞生','理解 YOU 与 WIN：移动白色生物，接触旗帜。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',10,1);o('baba',2,8);o('flag',13,8);
 dots('rock',[[7,5],[8,5],[7,6],[8,6],[10,8]]);
});
create('02 · 墙只是一个词','破坏规则','墙不会天生阻挡你。将 STOP 从句子里推走。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('WALL IS STOP',1,3);words('FLAG IS WIN',11,1);
 col('wall',8,0,11);o('baba',2,8);o('flag',13,8);
});
create('03 · 单词比石头重要','移动文字','推动 WIN，补完 FLAG IS WIN；石头可以推开。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('ROCK IS PUSH',8,1);words('FLAG IS',9,4);
 o('text',11,7); // temporary loose text replaced below
 o('baba',2,8);o('flag',13,8);dots('rock',[[7,6],[8,6],[9,6]]);
 // last loose tile token supplied by the postprocessor below
});
// Fix intentionally separated movable predicate.
levels[2].objects.find(o=>o.type==='text'&&!o.word).word='WIN';
create('04 · 世界可以变形','名词转换','推动 FLAG 补完 ROCK IS FLAG；让石头成为旗帜。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('ROCK IS',5,4);words('FLAG',8,6);
 o('baba',2,9);dots('rock',[[11,7],[12,7],[11,8],[12,8]]);
});
create('05 · 你是谁？','切换控制对象','补完 KEKE IS YOU：成为另一个角色。',({o,words,rect})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',5,1);
 words('KEKE IS',7,5);words('YOU',10,7);o('baba',2,8);o('keke',12,7);o('flag',13,9);
 rect('wall',11,6,14,10);
});
create('06 · 水不会主动伤害','危险由文字决定','打断 WATER IS SINK，才能安全地穿过水域。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('WATER IS SINK',1,3);words('FLAG IS WIN',11,1);
 col('water',8,0,11);o('baba',2,8);o('flag',13,8);
});
create('07 · 冰与熔岩','属性相互作用','LAVA IS HOT 与 BABA IS MELT 同时成立时，穿越熔岩会被消灭。打断其中一条规则。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('BABA IS MELT',1,3);words('LAVA IS HOT',1,5);
 o('baba',2,9);o('flag',13,9);col('lava',8,0,11);
});
create('08 · 钥匙和门','OPEN + SHUT','让钥匙与门相遇，观察这两个属性怎样相互抵消。',({o,words,col,row})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);
 words('KEY IS OPEN',1,3);words('DOOR IS SHUT',9,3);words('WALL IS STOP',5,1);
 words('KEY IS PUSH',1,5);words('DOOR IS STOP',10,5);
 row('wall',0,15,7);row('wall',0,15,9);o('baba',2,8);o('key',6,8);o('door',10,8);o('flag',13,8);
});
create('09 · 一接触就消失','DEFEAT','骷髅拥有 DEFEAT；试着拆掉 SKULL IS DEFEAT。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('SKULL IS DEFEAT',1,3);
 col('skull',8,0,11);o('baba',2,9);o('flag',13,9);
});
create('10 · 旗子不是终点','改变胜利条件','想办法拼出 ROCK IS WIN，然后触碰岩石。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',5,1);
 words('ROCK IS',5,4);words('WIN',8,6);o('baba',2,9);o('rock',4,9);o('flag',13,8);
 dots('wall',[[11,7],[12,7],[13,7],[14,7],[11,8],[14,8],[11,9],[12,9],[13,9],[14,9]]);
});
create('11 · 我即终点','自身即胜利','尝试构成 BABA IS YOU AND WIN。',({o,words})=>{
 words('BABA IS YOU',4,3);words('WIN',9,7);words('AND',6,7);
 o('baba',2,9);o('rock',11,8);
});
create('12 · 自己行走','MOVE','KEKE IS MOVE：它会按朝向自动行动，碰壁会转身。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('KEKE IS MOVE',5,3);words('ROCK IS PUSH',1,4);
 o('baba',2,9);o('flag',13,9);o('keke',7,8,1);dots('rock',[[9,8],[10,8],[11,8]]);
});
create('13 · 两条命令','PUSH 与 STOP','同一个物体可以同时拥有两种属性，文字规则会竞争。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',1,3);words('WALL IS PUSH',1,5);
 o('baba',2,9);o('flag',13,9);for(let y=0;y<12;y++)o('wall',8,y);
});
create('14 · 在不同的层','FLOAT','幽灵能穿过普通墙壁，但同样必须让旗帜拥有 FLOAT 才能触发胜利。',({o,words,col})=>{
 words('GHOST IS YOU',1,1);words('GHOST IS FLOAT',6,1);words('FLAG IS WIN',11,3);words('FLAG IS FLOAT',1,5);words('WALL IS STOP',1,3);
 o('ghost',2,8);o('flag',13,8);col('wall',8,0,11);
});
create('15 · 地面也会移动','SHIFT','踩上 BELT IS SHIFT 的传送带，探索主动位移。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('BELT IS SHIFT',5,3);
 o('baba',2,8);o('flag',13,8);dots('belt',[[6,8],[7,8],[8,8],[9,8],[10,8]]);
});
create('16 · 星间跃迁','TELE','STAR IS TELE：重叠在星星上的角色会跳往另一颗星星。',({o,words,dots})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('STAR IS TELE',5,3);words('WALL IS STOP',1,3);
 o('baba',2,8);o('flag',13,8);dots('star',[[5,8],[11,8]]);
 for(let y=0;y<12;y++)o('wall',8,y);
});
create('17 · 复数的你','AND','BABA 和 KEKE 都由你控制；只靠墙左边的角色无法接触旗帜。',({o,words,col})=>{
 words('BABA AND KEKE IS YOU',2,2);words('FLAG IS WIN',11,4);words('WALL IS STOP',1,5);
 o('baba',2,8);o('keke',11,8);o('flag',13,8);col('wall',8,0,11);
});
create('18 · 有条件的世界','ON','BABA ON ROCK IS WIN：只有叠在岩石上才会胜利。',({o,words})=>{
 words('BABA IS YOU',1,1);words('BABA ON ROCK IS WIN',3,3);
 o('baba',2,9);o('rock',11,9);o('flag',13,7);
});
create('19 · 消失之后','HAS','让 BABA 触碰骷髅，生成拥有 YOU 与 SAFE 的 KEY，再用钥匙抵达旗帜。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('BABA HAS KEY',1,3);words('KEY IS YOU',1,5);words('KEY IS SAFE',1,7);words('SKULL IS DEFEAT',9,3);words('FLAG IS WIN',11,1);
 o('baba',2,9);o('flag',13,9);col('skull',8,0,11);
});
create('20 · 世界创造者','MAKE','BABA MAKE ROCK 创造新角色。ROCK IS YOU：即使 BABA 会熔化，你仍可控制岩石穿过熔岩。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('BABA MAKE ROCK',1,3);words('ROCK IS YOU',1,5);
 words('BABA IS MELT',1,7);words('LAVA IS HOT',10,3);
 o('baba',2,9);o('flag',13,9);col('lava',8,0,11);
});

// v0.2: Five small conformance puzzles emphasizing actual rule semantics.
create('21 · 石头也会说话','WORD · 物体当作文字','ROCK IS WORD 让石头本身成为 ROCK 这个词。观察它如何组成 ROCK IS WIN。',({o,words})=>{
 words('ROCK IS WORD',1,1);words('BABA IS YOU',1,3);
 words('IS WIN',9,8);o('rock',8,8);o('baba',2,8);
});
create('22 · 否定高于肯定','IS NOT STOP','上方写着 WALL IS STOP。把独立的 STOP 推进 WALL IS NOT 后面，取消墙的阻挡。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',1,2);
 words('WALL IS NOT',1,4);words('STOP',4,6);
 col('wall',8,0,11);o('baba',4,7);o('flag',13,8);
});
create('23 · 自相矛盾的墙','IS NOT 同名词','完成 WALL IS NOT WALL。墙不会变成别的东西，而会从世界中消失。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',1,2);
 words('WALL IS NOT',1,3);words('WALL',4,5);
 col('wall',8,0,11);o('baba',4,6);o('flag',13,8);
});
create('24 · 对调空间','SWAP · 换位','先组成 BABA IS SWAP 穿墙。靠近旗帜时，BABA NEAR FLAG IS NOT SWAP 将自动解除换位效果。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',1,3);
 words('BABA IS',2,4);words('SWAP',4,6);words('BABA NEAR FLAG IS NOT SWAP',9,5);
 col('wall',8,0,11);o('baba',4,7);o('flag',13,8);
});
create('25 · 脆弱的障碍','WEAK · 接触破坏','即使墙有 STOP，只要同时拥有 WEAK，触碰它就会令它消失。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('FLAG IS WIN',11,1);words('WALL IS STOP',1,3);words('WALL IS WEAK',1,5);
 col('wall',8,0,11);o('baba',2,8);o('flag',13,8);
});

// v0.3: membership, multi-cell word spelling, and virtual EMPTY puzzles.
create('26 · 群体的力量','GROUP · 成员共享属性','先完成 GROUP IS PUSH。拥有 GROUP 身份的岩石才可以被推过走廊。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('ROCK IS GROUP',1,2);words('ROCK IS STOP',10,1);words('FLAG IS WIN',10,3);
 words('GROUP IS',2,4);words('PUSH',4,6);o('baba',4,7);col('rock',8,0,11);o('flag',13,8);
});
create('27 · 群体不止一种','GROUP · 多成员','同时让岩石和 KEKE 成为 GROUP，再拼出 GROUP IS WIN。群体中的任何成员都能成为终点。',({o,words})=>{
 words('BABA IS YOU',1,1);words('ROCK IS GROUP',1,2);words('KEKE IS GROUP',1,3);
 words('GROUP IS',4,4);words('WIN',6,6);o('baba',6,7);o('rock',11,9);o('keke',13,9);
});
create('28 · 字母的誓言','LETTERS · 拼出 WIN','把单独的 N 推上去。W、I、N 三个格子拼成 WIN，便可补成 FLAG IS WIN。',({o,words})=>{
 words('BABA IS YOU',1,1);words('FLAG IS',6,4);
 o('letter',8,4);o('letter',9,4);o('letter',10,6);
 o('baba',10,7);o('flag',13,9);
});
// Set individual letter glyphs. Letter objects remain physical PUSH text.
{const a=levels[27].objects.filter(o=>o.type==='letter');[a[0].word,a[1].word,a[2].word]=['W','I','N'];}
create('29 · 每个字母都重要','LETTERS · 拼出 ROCK','把 K 推进 R O C 的末尾，形成 ROCK IS PUSH。原本 STOP 的岩石才会让出通道。',({o,words,col})=>{
 words('BABA IS YOU',1,1);words('ROCK IS STOP',1,2);words('FLAG IS WIN',11,1);
 for(const [i,w] of ['R','O','C'].entries())o('letter',2+i,4);
 o('letter',5,6);words('IS PUSH',6,4);
 o('baba',5,7);col('rock',8,0,11);o('flag',13,9);
});
levels[28].objects.filter(o=>o.type==='letter').forEach((o,i)=>o.word=['R','O','C','K'][i]);
create('30 · 空白变成实体','EMPTY · 空格变形','把 ROCK 补上 EMPTY IS，空着的格子会变成岩石。再触碰一块拥有 WIN 的岩石。',({o,words})=>{
 words('BABA IS YOU',1,1);words('ROCK IS WIN',11,1);
 words('EMPTY IS',2,4);words('ROCK',4,6);
 o('baba',4,7);
});
create('31 · 空白本身获胜','EMPTY · YOU 与 WIN','让 EMPTY 同时拥有 YOU 和 WIN，空格自己便可以达成胜利，而不需要把 Baba 放进空格。',({o,words})=>{
 words('BABA IS YOU',1,1);words('EMPTY IS YOU AND',2,4);words('WIN',6,6);o('baba',6,7);
});

const exported={levels};
if(typeof module!=='undefined'&&module.exports)module.exports=exported;
root.BabaLevels=exported;
})(typeof globalThis!=='undefined'?globalThis:this);
