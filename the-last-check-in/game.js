const COPY = {
  en: {
    lang: 'en', title: 'The Last Check-In', dateLine: 'NIGHT DESK / OCTOBER 3 / 02:17', window: 'EAST WING',
    briefingMain: 'Four names appear in tonight\'s register. At 02:12 the desk phone rang. A voice said: “One of them never arrived.”',
    briefingSub: 'Inspect the desk. Record the evidence. Then decide which guest does not belong.',
    soundOff: 'sound: off', soundOn: 'sound: on', restart: 'restart', caseLabel: 'CASE NOTES', evidenceHeading: 'Evidence',
    empty: 'Nothing recorded yet.', conclude: 'make a conclusion', need: n => `Find ${n} more piece${n===1?'':'s'} of evidence.`,
    canConclude: 'You can conclude now, or inspect the rest.', allFound: 'All evidence collected.', finalLabel: 'FINAL DECISION',
    accuseTitle: 'Who never arrived?', accuseHint: "Choose one name. You can keep investigating if you're not ready.", endingBtn: 'return to the desk',
    objectLabels: {register:'guest register',keys:'key board',note:'porter note',paper:'evening paper',letter:'sealed letter',photo:'lobby photo'},
    notePreview: 'three arrivals.<br>east wing shut.', paperName: 'THE HARBOR GAZETTE', paperHeadline: 'WATER MAIN BURST CLOSES HOTEL WING', stamp: 'POST',
    rooms: {hana:'Room 203 · 21:40',leon:'Room 108 · 22:15',clara:'Room 206 · 23:05',elias:'Room 214 · 00:20'},
    evidence: {
      register:{kicker:'DOCUMENT 01',title:'Night Register',body:'Four entries were written between 21:40 and 00:20. The first three press unevenly into the paper. The final line is unusually neat.',observation:'A name in the register proves only that someone wrote it down.',clueTitle:'Four names, one suspicious line',clueText:"Elias Vale's entry looks different from the first three.",visual:`<div class="doc-register"><div class="row"><strong>Hana Mori</strong><span>203</span><span>21:40</span></div><div class="row"><strong>Leon Bell</strong><span>108</span><span>22:15</span></div><div class="row"><strong>Clara Weiss</strong><span>206</span><span>23:05</span></div><div class="row"><strong>Elias Vale</strong><span>214</span><span>00:20</span></div></div>`},
      keys:{kicker:'OBJECT 02',title:'Room Key Board',body:'Rooms 108, 203, and 206 have empty hooks. Their keys were taken. Room 214 still has its brass key hanging in place.',observation:'If Elias Vale checked into Room 214, why was the room key never removed?',clueTitle:'Room 214 key still present',clueText:'Keys 108, 203 and 206 are gone. 214 is still on the board.',visual:`<div class="key-visual"><div class="key-tag missing">108<br><small>empty hook</small></div><div class="key-tag missing">203<br><small>empty hook</small></div><div class="key-tag missing">206<br><small>empty hook</small></div><div class="key-tag">214<br><small>key present</small></div></div>`},
      note:{kicker:'DOCUMENT 03',title:"Porter's Note",body:'A note written by the night porter before he left the desk at 00:45.',observation:'The note records three arrivals. It also says the east wing is shut.',clueTitle:'Only three arrivals',clueText:'The porter counted three guests entering before 00:45.',visual:`<div class="note-visual">11:58 — kettle still broken.<br>Three late arrivals total.<br>East wing stays shut. Do not issue those keys.<br>— M.</div>`},
      paper:{kicker:'DOCUMENT 04',title:'The Harbor Gazette',body:"Yesterday's local paper reports a burst water main inside the hotel. Rooms 210 through 218 are closed until repairs are completed.",observation:'Room 214 is inside the closed section.',clueTitle:'Room 214 is in a closed wing',clueText:'Rooms 210–218 were officially closed before tonight.',visual:`<div class="paper-visual"><h3>THE HARBOR GAZETTE</h3><p><strong>WATER MAIN BURST CLOSES HOTEL EAST WING</strong></p><p>Management confirmed that rooms 210–218 will remain inaccessible until Friday morning following damage to the second-floor pipework.</p></div>`},
      letter:{kicker:'DOCUMENT 05',title:'Unsent Letter',body:'The envelope is addressed to Elias Vale. It was returned to the front desk because no guest by that name had collected it.',observation:'Inside, the sender writes: “I will meet you here on Friday.” Tonight is Thursday.',clueTitle:'Elias was expected tomorrow',clueText:'A letter says Elias Vale was due to arrive Friday, not Thursday.',visual:`<div class="letter-visual">Elias —<br><br>I checked the reservation. Friday is still good. I'll meet you in the lobby after six.<br><br>Don't arrive early. The east wing is a mess.<br><br>— S.</div>`},
      photo:{kicker:'OBJECT 06',title:'Lobby Photograph',body:'A disposable camera photo from the lobby clocked at 00:32. Three late guests are visible: a woman with a red scarf, a man carrying a sample case, and a woman holding a violin case.',observation:'Those details match Hana Mori, Leon Bell, and Clara Weiss. There is no fourth guest in frame.',clueTitle:'Three people in the lobby',clueText:'The 00:32 photograph shows the other three registered guests.',visual:`<div class="photo-visual"><span class="guest g1"></span><span class="guest g2"></span><span class="guest g3"></span></div>`}
    },
    correct:{kicker:'CASE CLOSED',title:'Elias Vale never checked in.',body:'The room key never left the board. Room 214 was closed. The porter counted only three arrivals. The photograph confirms those three. The final register line was added after the fact—by someone expecting Elias tomorrow. At 02:19 the phone rings again. This time, no one speaks.'},
    wrong:{kicker:'UNRESOLVED',title:'The evidence does not hold.',body:'That guest is supported by the physical record: a missing key, the porter\'s count, or the lobby photograph. Something about your conclusion is wrong. The desk clock advances to 02:18.'}
  },
  zh: {
    lang: 'zh-CN', title: '最后一次入住', dateLine: '夜班前台 / 10月3日 / 02:17', window: '东翼',
    briefingMain: '今晚的入住登记簿上写着四个名字。02:12，前台电话响了。电话那头只说了一句：“他们之中，有一个人今晚根本没有来。”',
    briefingSub: '检查桌面上的东西，记录证据，然后判断哪一位住客不应该出现在今晚的登记簿里。',
    soundOff: '声音：关', soundOn: '声音：开', restart: '重新开始', caseLabel: '案件笔记', evidenceHeading: '证据',
    empty: '尚未记录任何证据。', conclude: '作出结论', need: n => `还需要找到 ${n} 条证据。`,
    canConclude: '现在已经可以作出结论，也可以继续检查剩余物件。', allFound: '所有证据已收集。', finalLabel: '最终判断',
    accuseTitle: '谁今晚根本没有入住？', accuseHint: '选一个名字。如果你还没有把握，也可以继续调查。', endingBtn: '回到前台',
    objectLabels: {register:'入住登记簿',keys:'房间钥匙板',note:'门房便条',paper:'晚报',letter:'未领取的信',photo:'大堂照片'},
    notePreview: '共三人入住。<br>东翼封闭。', paperName: '海港公报', paperHeadline: '水管爆裂，旅馆东翼关闭', stamp: '邮',
    rooms: {hana:'203号房 · 21:40',leon:'108号房 · 22:15',clara:'206号房 · 23:05',elias:'214号房 · 00:20'},
    evidence: {
      register:{kicker:'证据 01 / 文件',title:'夜间入住登记簿',body:'四条入住记录分别写于 21:40 至 00:20。前三行的笔迹有明显轻重变化，墨迹也压进纸面；最后一行却异常工整。',observation:'登记簿上出现一个名字，只能证明有人把这个名字写了下来，不能证明这个人真的走进过旅馆。',clueTitle:'四个名字，一行异常笔迹',clueText:'Elias Vale 的登记笔迹与前三位明显不同。',visual:`<div class="doc-register"><div class="row"><strong>Hana Mori</strong><span>203</span><span>21:40</span></div><div class="row"><strong>Leon Bell</strong><span>108</span><span>22:15</span></div><div class="row"><strong>Clara Weiss</strong><span>206</span><span>23:05</span></div><div class="row"><strong>Elias Vale</strong><span>214</span><span>00:20</span></div></div>`},
      keys:{kicker:'证据 02 / 物件',title:'房间钥匙板',body:'108、203、206 三个挂钩都是空的，对应钥匙已经被取走。214 的黄铜钥匙仍然挂在原处。',observation:'如果 Elias Vale 已经办理了 214 号房的入住，为什么钥匙从未被取走？',clueTitle:'214 号房钥匙仍在',clueText:'108、203、206 的钥匙均已取走，只有 214 仍挂在钥匙板上。',visual:`<div class="key-visual"><div class="key-tag missing">108<br><small>空挂钩</small></div><div class="key-tag missing">203<br><small>空挂钩</small></div><div class="key-tag missing">206<br><small>空挂钩</small></div><div class="key-tag">214<br><small>钥匙仍在</small></div></div>`},
      note:{kicker:'证据 03 / 文件',title:'夜班门房的便条',body:'这是夜班门房在 00:45 离开前台之前留下的一张便条。',observation:'便条明确记载今晚只有三位迟到住客入住，并再次提醒东翼已经封闭。',clueTitle:'门房只记录了三人',clueText:'截至 00:45，门房只看到三位住客进入旅馆。',visual:`<div class="note-visual">23:58 —— 水壶还是坏的。<br>今晚迟到住客，共三人。<br>东翼继续封闭，不要发那边的钥匙。<br>—— M.</div>`},
      paper:{kicker:'证据 04 / 文件',title:'《海港公报》',body:'昨天的本地报纸报道：旅馆内部一处水管爆裂。维修完成之前，210 至 218 号房全部关闭。',observation:'214 号房就在被关闭的区域之内。',clueTitle:'214 位于封闭区域',clueText:'210—218 号房在今晚之前就已经正式停止使用。',visual:`<div class="paper-visual"><h3>海港公报</h3><p><strong>水管爆裂，旅馆东翼关闭</strong></p><p>旅馆管理方证实，由于二楼管道受损，210 至 218 号房在周五上午之前均无法使用。</p></div>`},
      letter:{kicker:'证据 05 / 文件',title:'一封未领取的信',body:'信封上写着 Elias Vale 的名字。由于没有同名住客前来领取，这封信一直留在前台。',observation:'信里写着：“周五我会在这里见你。”而今晚还是周四。',clueTitle:'Elias 应该明天才到',clueText:'信中显示 Elias Vale 原定周五入住，而不是今晚。',visual:`<div class="letter-visual">Elias：<br><br>我确认过预订，周五还是照旧。六点以后我会在大堂等你。<br><br>别提前来，东翼现在一团糟。<br><br>—— S.</div>`},
      photo:{kicker:'证据 06 / 物件',title:'大堂照片',body:'一张一次性相机拍下的照片，时间标记为 00:32。画面里有三位迟到住客：一位围着红围巾的女人、一位提着样品箱的男人，以及一位拿着小提琴盒的女人。',observation:'这些特征分别与 Hana Mori、Leon Bell 和 Clara Weiss 的登记备注吻合。照片中没有第四个人。',clueTitle:'大堂里只有三位迟到住客',clueText:'00:32 的照片可以对应另外三位登记住客。',visual:`<div class="photo-visual"><span class="guest g1"></span><span class="guest g2"></span><span class="guest g3"></span></div>`}
    },
    correct:{kicker:'案件结案',title:'Elias Vale 今晚从未入住。',body:'214 号房的钥匙从未离开钥匙板；214 位于封闭的东翼；门房只记录了三位迟到住客；大堂照片也恰好证明了另外三个人确实出现过。最后那条入住记录，是后来被人补写上去的——写下它的人，大概以为 Elias 会在明天到来。02:19，电话再次响起。这一次，电话那头没有任何声音。'},
    wrong:{kicker:'结论无法成立',title:'证据并不支持这个判断。',body:'你选择的这位住客，在钥匙、门房记录或大堂照片中都有现实痕迹。你的推断中还有一处没有解释通。前台时钟跳到了 02:18。'}
  }
};

const found = new Set();
const $ = id => document.getElementById(id);
let locale = 'en';
let currentEvidence = null;
let currentEnding = null;
let audioCtx = null, hum = null, humGain = null;

function t(){ return COPY[locale]; }
function soundIsOn(){ return document.body.classList.contains('sound-on'); }

function clickSound(freq=180,duration=.04){
  if(!audioCtx) return;
  const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
  osc.type='triangle'; osc.frequency.value=freq;
  gain.gain.setValueAtTime(.035,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
  osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime+duration);
}

function toggleSound(){
  if(!audioCtx){
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    hum=audioCtx.createOscillator(); humGain=audioCtx.createGain();
    hum.type='sine'; hum.frequency.value=48; humGain.gain.value=.012;
    hum.connect(humGain).connect(audioCtx.destination); hum.start();
    document.body.classList.add('sound-on');
    $('soundBtn').setAttribute('aria-pressed','true'); clickSound(240,.06);
  } else {
    const on=document.body.classList.toggle('sound-on');
    humGain.gain.value=on?.012:0; $('soundBtn').setAttribute('aria-pressed',String(on));
    if(on) clickSound(240,.06);
  }
  $('soundBtn').textContent=soundIsOn()?t().soundOn:t().soundOff;
}

function applyLanguage(nextLocale){
  locale = nextLocale;
  const c=t();
  document.documentElement.lang=c.lang;
  document.title = locale==='zh' ? '最后一次入住 · The Last Check-In' : 'The Last Check-In';
  $('langEn').classList.toggle('active', locale==='en');
  $('langZh').classList.toggle('active', locale==='zh');
  $('langEn').setAttribute('aria-pressed', String(locale==='en'));
  $('langZh').setAttribute('aria-pressed', String(locale==='zh'));
  $('dateLine').textContent=c.dateLine; $('gameTitle').textContent=c.title;
  $('briefingMain').textContent=c.briefingMain; $('briefingSub').textContent=c.briefingSub;
  $('windowCopy').textContent=c.window; $('soundBtn').textContent=soundIsOn()?c.soundOn:c.soundOff; $('resetBtn').textContent=c.restart;
  $('caseLabel').textContent=c.caseLabel; $('evidenceHeading').textContent=c.evidenceHeading; $('accuseBtn').textContent=c.conclude;
  $('finalLabel').textContent=c.finalLabel; $('accuseTitle').textContent=c.accuseTitle; $('accuseHint').textContent=c.accuseHint; $('endingBtn').textContent=c.endingBtn;
  $('notePreview').innerHTML=c.notePreview; $('paperName').textContent=c.paperName; $('paperHeadline').textContent=c.paperHeadline; $('stampText').textContent=c.stamp;
  document.querySelectorAll('[data-object-label]').forEach(el=>el.textContent=c.objectLabels[el.dataset.objectLabel]);
  document.querySelectorAll('[data-room]').forEach(el=>el.textContent=c.rooms[el.dataset.room]);
  $('scene').setAttribute('aria-label', locale==='zh'?'旅馆夜班前台':'Hotel night desk');
  $('closeOverlay').setAttribute('aria-label', locale==='zh'?'关闭':'Close');
  $('closeAccuse').setAttribute('aria-label', locale==='zh'?'关闭':'Close');
  renderClues();
  if(currentEvidence && !$('overlay').hidden) renderEvidence(currentEvidence);
  if(currentEnding && !$('endingOverlay').hidden) renderEnding(currentEnding);
}

function renderClues(){
  const c=t(); $('count').textContent=String(found.size);
  $('clueList').innerHTML = found.size ? [...found].map(key=>{
    const item=c.evidence[key]; return `<div class="clue"><strong>${item.clueTitle}</strong><span>${item.clueText}</span></div>`;
  }).join('') : `<p class="empty-state">${c.empty}</p>`;
  $('accuseBtn').disabled=found.size<4;
  $('unlockText').textContent = found.size<4 ? c.need(4-found.size) : found.size<6 ? c.canConclude : c.allFound;
}

function renderEvidence(key){
  const item=t().evidence[key];
  $('evidenceKicker').textContent=item.kicker; $('evidenceTitle').textContent=item.title;
  $('evidenceVisual').innerHTML=item.visual; $('evidenceBody').textContent=item.body; $('evidenceObservation').textContent=item.observation;
}

function openEvidence(key){
  currentEvidence=key; found.add(key); renderClues(); renderEvidence(key);
  $('overlay').hidden=false; document.body.style.overflow='hidden'; $('closeOverlay').focus(); clickSound(150,.05);
}
function closeEvidence(){ $('overlay').hidden=true; currentEvidence=null; document.body.style.overflow=''; }
function openAccuse(){ if($('accuseBtn').disabled)return; $('accuseOverlay').hidden=false; document.body.style.overflow='hidden'; $('closeAccuse').focus(); clickSound(120,.06); }
function closeAccusation(){ $('accuseOverlay').hidden=true; document.body.style.overflow=''; }

function renderEnding(kind){
  const data=t()[kind]; $('endingKicker').textContent=data.kicker; $('endingTitle').textContent=data.title; $('endingBody').textContent=data.body;
}
function resolveAccusation(suspect){
  $('accuseOverlay').hidden=true; $('endingOverlay').hidden=false;
  currentEnding = suspect==='elias' ? 'correct' : 'wrong'; renderEnding(currentEnding); clickSound(suspect==='elias'?240:90,.18);
}
function resetGame(){
  found.clear(); currentEvidence=null; currentEnding=null; renderClues();
  $('overlay').hidden=true; $('accuseOverlay').hidden=true; $('endingOverlay').hidden=true; document.body.style.overflow=''; window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.scene-object').forEach(b=>b.addEventListener('click',()=>openEvidence(b.dataset.evidence)));
document.querySelectorAll('.suspect').forEach(b=>b.addEventListener('click',()=>resolveAccusation(b.dataset.suspect)));
$('closeOverlay').addEventListener('click',closeEvidence); $('closeAccuse').addEventListener('click',closeAccusation); $('accuseBtn').addEventListener('click',openAccuse);
$('endingBtn').addEventListener('click',()=>{$('endingOverlay').hidden=true;currentEnding=null;document.body.style.overflow=''});
$('resetBtn').addEventListener('click',resetGame); $('soundBtn').addEventListener('click',toggleSound);
$('langEn').addEventListener('click',()=>applyLanguage('en')); $('langZh').addEventListener('click',()=>applyLanguage('zh'));
$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeEvidence()}); $('accuseOverlay').addEventListener('click',e=>{if(e.target===$('accuseOverlay'))closeAccusation()});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('endingOverlay').hidden){$('endingOverlay').hidden=true;currentEnding=null;document.body.style.overflow=''}else if(!$('accuseOverlay').hidden)closeAccusation();else if(!$('overlay').hidden)closeEvidence()});
applyLanguage('en');
