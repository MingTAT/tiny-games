const LEVELS = [
  {
    id: 1, chapter: "CHAPTER I · SENTENCES", title: "Break the Sentence",
    mechanic: "YOU · STOP · WIN",
    hint: "A wall only blocks you while WALL IS STOP remains a sentence.",
    width: 11, height: 9,
    entities: [
      O("PLAYER",2,6), O("FLAG",9,2),
      O("WALL",6,3),O("WALL",6,4),O("WALL",6,5),O("WALL",6,6),O("WALL",6,7),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("WALL","noun",1,3),W("IS","op",2,3),W("STOP","prop",3,3),
      W("FLAG","noun",7,1),W("IS","op",8,1),W("WIN","prop",9,1)
    ]
  },
  {
    id: 2, chapter: "CHAPTER I · SENTENCES", title: "The Push",
    mechanic: "PUSH",
    hint: "The rock is not an obstacle if the sentence says otherwise.",
    width: 11, height: 9,
    entities: [
      O("PLAYER",2,6),O("ROCK",5,6),O("FLAG",8,6),
      O("WALL",4,4),O("WALL",5,4),O("WALL",6,4),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("ROCK","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),
      W("FLAG","noun",7,1),W("IS","op",8,1),W("WIN","prop",9,1)
    ]
  },
  {
    id: 3, chapter: "CHAPTER I · SENTENCES", title: "And",
    mechanic: "AND",
    hint: "One subject can carry more than one property.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("FLAG",9,6),
      O("WALL",6,3),O("WALL",6,4),O("WALL",6,5),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("FLAG","noun",7,1),W("IS","op",8,1),W("WIN","prop",9,1),
      W("WALL","noun",1,3),W("IS","op",2,3),W("STOP","prop",3,3),
      W("AND","and",4,3),W("PUSH","prop",5,3)
    ]
  },
  {
    id: 4, chapter: "CHAPTER II · IDENTITY", title: "Become the Rock",
    mechanic: "NOUN → NOUN",
    hint: "ROCK IS PLAYER changes what the rocks are. PLAYER IS YOU then applies to them.",
    width: 12, height: 9,
    entities: [
      O("ROCK",2,6),O("ROCK",4,6),O("FLAG",9,2),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("FLAG","noun",8,1),W("IS","op",9,1),W("WIN","prop",10,1),
      W("ROCK","noun",3,7),W("IS","op",4,7),W("PLAYER","noun",5,7)
    ]
  },
  {
    id: 5, chapter: "CHAPTER II · IDENTITY", title: "Two Bodies",
    mechanic: "MULTIPLE YOU",
    hint: "If two objects are YOU, both move together.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("ROCK",2,7),O("FLAG",9,6),
      O("WALL",5,5),O("WALL",5,6),O("WALL",5,7),
      W("PLAYER","noun",1,1),W("AND","and",2,1),W("ROCK","noun",3,1),W("IS","op",4,1),W("YOU","prop",5,1),
      W("FLAG","noun",8,1),W("IS","op",9,1),W("WIN","prop",10,1)
    ]
  },
  {
    id: 6, chapter: "CHAPTER III · DANGER", title: "Water Takes All",
    mechanic: "SINK",
    hint: "Anything sharing a tile with SINK disappears — including the sink.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("WATER",6,6),O("FLAG",9,6),O("ROCK",4,6),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("ROCK","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),
      W("WATER","noun",5,1),W("IS","op",6,1),W("SINK","prop",7,1),
      W("FLAG","noun",9,1),W("IS","op",10,1),W("WIN","prop",11,1)
    ]
  },
  {
    id: 7, chapter: "CHAPTER III · DANGER", title: "Skull",
    mechanic: "DEFEAT",
    hint: "YOU touching DEFEAT is removed. Rewrite or avoid.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("SKULL",5,6),O("SKULL",6,6),O("FLAG",9,6),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("SKULL","noun",1,3),W("IS","op",2,3),W("DEFEAT","prop",3,3),
      W("FLAG","noun",8,1),W("IS","op",9,1),W("WIN","prop",10,1)
    ]
  },
  {
    id: 8, chapter: "CHAPTER IV · PAIRS", title: "Key and Door",
    mechanic: "OPEN · SHUT",
    hint: "OPEN and SHUT destroy one another when they meet.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("KEY",4,6),O("DOOR",7,6),O("FLAG",9,6),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("KEY","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),
      W("KEY","noun",1,4),W("IS","op",2,4),W("OPEN","prop",3,4),
      W("DOOR","noun",5,1),W("IS","op",6,1),W("SHUT","prop",7,1),
      W("DOOR","noun",5,2),W("IS","op",6,2),W("STOP","prop",7,2),
      W("FLAG","noun",9,1),W("IS","op",10,1),W("WIN","prop",11,1)
    ]
  },
  {
    id: 9, chapter: "CHAPTER IV · PAIRS", title: "Heat",
    mechanic: "HOT · MELT",
    hint: "MELT disappears on HOT.",
    width: 12, height: 9,
    entities: [
      O("PLAYER",2,6),O("ICE",5,6),O("LAVA",7,6),O("FLAG",10,6),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("ICE","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),W("AND","and",4,3),W("MELT","prop",5,3),
      W("LAVA","noun",6,1),W("IS","op",7,1),W("HOT","prop",8,1),
      W("FLAG","noun",9,1),W("IS","op",10,1),W("WIN","prop",11,1)
    ]
  },
  {
    id: 10, chapter: "CHAPTER V · MOTION", title: "The Walker",
    mechanic: "MOVE",
    hint: "MOVE objects keep moving after each of your turns. They reverse when blocked.",
    width: 13, height: 9,
    entities: [
      O("PLAYER",2,6),O("GHOST",5,6,"right"),O("FLAG",10,6),
      O("WALL",8,5),O("WALL",8,6),O("WALL",8,7),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("GHOST","noun",1,3),W("IS","op",2,3),W("MOVE","prop",3,3),
      W("WALL","noun",5,1),W("IS","op",6,1),W("STOP","prop",7,1),
      W("FLAG","noun",10,1),W("IS","op",11,1),W("WIN","prop",12,1)
    ]
  },
  {
    id: 11, chapter: "CHAPTER V · CONSEQUENCE", title: "What Remains",
    mechanic: "HAS · WEAK",
    hint: "A WEAK object breaks when it shares a tile. HAS decides what appears afterward.",
    width: 13, height: 9,
    entities: [
      O("PLAYER",2,6),O("CRATE",6,6),O("FLAG",10,6),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("CRATE","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),W("AND","and",4,3),W("WEAK","prop",5,3),
      W("CRATE","noun",1,4),W("HAS","op",2,4),W("KEY","noun",3,4),
      W("KEY","noun",5,1),W("IS","op",6,1),W("PUSH","prop",7,1),
      W("FLAG","noun",10,1),W("IS","op",11,1),W("WIN","prop",12,1)
    ]
  },
  {
    id: 12, chapter: "CHAPTER VI · THE LAST RULE", title: "World Is Open",
    mechanic: "COMBINATION",
    hint: "The final room asks you to combine identity, PUSH, STOP and WIN. No single sentence is enough.",
    width: 14, height: 10,
    entities: [
      O("PLAYER",2,7),O("ROCK",5,7),O("DOOR",9,7),O("FLAG",12,7),
      O("WALL",7,5),O("WALL",7,6),O("WALL",7,7),O("WALL",7,8),
      W("PLAYER","noun",1,1),W("IS","op",2,1),W("YOU","prop",3,1),
      W("ROCK","noun",1,3),W("IS","op",2,3),W("PUSH","prop",3,3),
      W("WALL","noun",5,1),W("IS","op",6,1),W("STOP","prop",7,1),
      W("DOOR","noun",8,1),W("IS","op",9,1),W("STOP","prop",10,1),
      W("FLAG","noun",11,1),W("IS","op",12,1),W("WIN","prop",13,1),
      W("ROCK","noun",4,8),W("IS","op",5,8),W("KEY","noun",6,8),
      W("KEY","noun",8,8),W("IS","op",9,8),W("OPEN","prop",10,8),
      W("DOOR","noun",8,9),W("IS","op",9,9),W("SHUT","prop",10,9)
    ]
  }
];

function O(noun,x,y,dir="right"){ return {type:"object",noun,x,y,dir}; }
function W(word,kind,x,y){ return {type:"word",word,kind,x,y}; }
