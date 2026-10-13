const E=require('../engine.js'),ls=require('../levels.js');
const plans=[
 'R D D D D U U U U R R R R R R',
 'R R D D D D D D L U R U U U U U',
 'R R D D D D D D L U R U U L',
 'R R D D D D D D L U R U U',
 'R R R R R R U U R',
 'L L D D D D D D R R R U R R U U',
 'R R R D D D D D L U R R R U U U U R R',
 'R R D D D D D D L U'
];
const names={R:'right',L:'left',U:'up',D:'down'};
for(let i=0;i<ls.length;i++){
 let s=E.make(ls[i]),before=E.parse(s).rules.map(r=>r.display).join('; '),touched=new Set(before.split('; '));
 for(const m of plans[i].split(' ')){s=E.step(s,names[m]);E.parse(s).rules.forEach(r=>touched.add(r.display));if(s.status==='won')break;}
 console.log(i+1,s.status,'turns',s.turn,'baba',s.units.filter(u=>u.type==='BABA').map(u=>[u.x,u.y]),'rules:',E.parse(s).rules.map(r=>r.display).join('; '));
 console.log('  touched:',[...touched].filter(r=>!before.includes(r)));
}
