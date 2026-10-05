function O(noun,x,y){return{type:"object",noun,x,y,dir:"right"}}
function W(word,kind,x,y){return{type:"word",word,kind,x,y}}

const LEVELS = [
{
 id:1, chapter:"I · BREAK", title:"The Wall Is Only a Sentence", mechanic:"BREAK STOP",
 hint:"You cannot cross the wall. The word STOP is reachable.",
 width:9,height:7,
 entities:[
  O("PLAYER",1,5),O("FLAG",7,3),
  O("WALL",5,0),O("WALL",5,0),O("WALL",5,1),O("WALL",5,2),O("WALL",5,3),O("WALL",5,4),O("WALL",5,5),O("WALL",5,6),O("WALL",5,6),
  W("PLAYER","noun",0,0),W("IS","op",1,0),W("YOU","prop",2,0),
  W("FLAG","noun",6,0),W("IS","op",7,0),W("WIN","prop",8,0),
  W("WALL","noun",1,2),W("IS","op",2,2),W("STOP","prop",3,2)
 ]
},
{
 id:2, chapter:"I · BUILD", title:"There Is No Victory Yet", mechanic:"CREATE WIN",
 hint:"Touching the flag does nothing until you finish a sentence.",
 width:9,height:7,
 entities:[
  O("PLAYER",1,5),O("FLAG",7,5),
  W("PLAYER","noun",0,0),W("IS","op",1,0),W("YOU","prop",2,0),
  W("FLAG","noun",5,1),W("IS","op",6,1),
  W("WIN","prop",7,4)
 ]
},
{
 id:3, chapter:"II · IDENTITY", title:"Give Control Away", mechanic:"TRANSFER YOU",
 hint:"The player can never reach the flag. Something on the other side can.",
 width:10,height:7,
 entities:[
  O("PLAYER",1,5),O("WALL",6,5),O("FLAG",8,5),
  O("ROCK",4,0),O("ROCK",4,1),O("ROCK",4,2),O("ROCK",4,3),O("ROCK",4,4),O("ROCK",4,5),O("ROCK",4,6),
  W("PLAYER","noun",0,1),W("IS","op",1,1),W("YOU","prop",2,1),
  W("WALL","noun",0,2),W("IS","op",1,2),
  W("ROCK","noun",6,1),W("IS","op",7,1),W("STOP","prop",8,1),
  W("FLAG","noun",6,0),W("IS","op",7,0),W("WIN","prop",8,0)
 ]
},
{
 id:4, chapter:"II · IDENTITY", title:"Rewrite the Object", mechanic:"NOUN → NOUN",
 hint:"A rock is stranded beyond the barrier. Make it become something that already has YOU.",
 width:11,height:7,
 entities:[
  O("PLAYER",1,5),O("ROCK",7,5),O("FLAG",9,5),
  O("WALL",5,1),O("WALL",5,2),O("WALL",5,3),O("WALL",5,4),O("WALL",5,5),
  W("PLAYER","noun",0,0),W("IS","op",1,0),W("YOU","prop",2,0),
  W("WALL","noun",6,0),W("IS","op",7,0),W("STOP","prop",8,0),
  W("FLAG","noun",8,1),W("IS","op",9,1),W("WIN","prop",10,1),
  W("ROCK","noun",1,2),W("IS","op",2,2),
  W("PLAYER","noun",3,4)
 ]
},
{
 id:5, chapter:"III · PROPERTY", title:"Become the Goal", mechanic:"YOU AND WIN",
 hint:"There is no target object. Make the controlled object become the victory condition.",
 width:9,height:7,
 entities:[
  O("PLAYER",1,5),
  W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),W("AND","and",4,1),
  W("WIN","prop",5,4)
 ]
},
{
 id:6, chapter:"IV · CONSEQUENCE", title:"Drain the Passage", mechanic:"CREATE SINK",
 hint:"A column of WATER is DEFEAT. Make WATER become SINK, then sacrifice the rock to open one safe gap.",
 width:10,height:7,
 entities:[
  O("PLAYER",1,5),O("ROCK",3,5),O("FLAG",8,5),
  O("WATER",6,0),O("WATER",6,1),O("WATER",6,2),O("WATER",6,3),O("WATER",6,4),O("WATER",6,5),O("WATER",6,6),
  W("PLAYER","noun",0,0),W("IS","op",1,0),W("YOU","prop",2,0),
  W("ROCK","noun",0,1),W("IS","op",1,1),W("PUSH","prop",2,1),
  W("WATER","noun",0,3),W("IS","op",1,3),
  W("SINK","prop",2,5),
  W("WATER","noun",7,0),W("IS","op",8,0),W("DEFEAT","prop",9,0),
  W("FLAG","noun",7,1),W("IS","op",8,1),W("WIN","prop",9,1)
 ]
},
{
 id:7, chapter:"IV · CONSEQUENCE", title:"The Door Does Not Know the Key", mechanic:"CREATE OPEN",
 hint:"The door column is STOP and SHUT. Complete KEY IS OPEN, then push the key into one door.",
 width:11,height:7,
 entities:[
  O("PLAYER",1,5),O("KEY",3,5),O("FLAG",9,5),
  O("DOOR",6,0),O("DOOR",6,1),O("DOOR",6,2),O("DOOR",6,3),O("DOOR",6,4),O("DOOR",6,5),O("DOOR",6,6),
  W("PLAYER","noun",0,0),W("IS","op",1,0),W("YOU","prop",2,0),
  W("KEY","noun",0,1),W("IS","op",1,1),W("PUSH","prop",2,1),
  W("KEY","noun",0,3),W("IS","op",1,3),
  W("OPEN","prop",2,5),
  W("DOOR","noun",7,0),W("IS","op",8,0),W("SHUT","prop",9,0),
  W("DOOR","noun",7,1),W("IS","op",8,1),W("STOP","prop",9,1),
  W("FLAG","noun",8,2),W("IS","op",9,2),W("WIN","prop",10,2)
 ]
},
{
 id:8, chapter:"V · SELF", title:"The Last Rule", mechanic:"BUILD YOU + WIN",
 hint:"The wall on the far side can never meet you. Make the wall become both the controller and the goal.",
 width:11,height:8,
 entities:[
  O("PLAYER",1,6),O("WALL",8,6),
  O("ROCK",6,0),O("ROCK",6,1),O("ROCK",6,2),O("ROCK",6,3),O("ROCK",6,4),O("ROCK",6,5),O("ROCK",6,6),O("ROCK",6,7),
  W("PLAYER","noun",8,0),W("IS","op",9,0),W("YOU","prop",10,0),
  W("ROCK","noun",8,1),W("IS","op",9,1),W("STOP","prop",10,1),
  W("WALL","noun",1,2),W("IS","op",2,2),
  W("YOU","prop",3,5),W("AND","and",4,5),W("WIN","prop",5,5)
 ]
}
];
