// ─── Seedings ──────────────────────────────────────────────────────
const SEEDS = {
  east: [
    [{ seed: 1, abb: 'DET' }, { seed: 8, abb: 'ORL' }],
    [{ seed: 4, abb: 'CLE' }, { seed: 5, abb: 'TOR' }],
    [{ seed: 3, abb: 'NYK' }, { seed: 6, abb: 'ATL' }],
    [{ seed: 2, abb: 'BOS' }, { seed: 7, abb: 'PHI' }],
  ],
  west: [
    [{ seed: 1, abb: 'OKC' }, { seed: 8, abb: 'PHX' }],
    [{ seed: 4, abb: 'LAL' }, { seed: 5, abb: 'HOU' }],
    [{ seed: 3, abb: 'DEN' }, { seed: 6, abb: 'MIN' }],
    [{ seed: 2, abb: 'SAS' }, { seed: 7, abb: 'POR' }],
  ],
};

// ─── State ─────────────────────────────────────────────────────────
let picks = { east: { 0:{}, 1:{}, 2:{} }, west: { 0:{}, 1:{}, 2:{} } };
let champPick = null;
let pendingPick = null;
let allSubmissions = [];

// Called by firebase.js when Firestore loads
window.setSubmissions = function(data) { allSubmissions = data; };
window.saveEntry = null;

// ─── Progress bar ──────────────────────────────────────────────────
function updateProgress() {
  let done = 0;
  ['east','west'].forEach(conf => {
    [0,1,2].forEach(r => {
      const count = r===0?4:r===1?2:1;
      for(let s=0;s<count;s++) if(picks[conf][r][s]?.winner) done++;
    });
  });
  if(champPick) done++;
  const pct = Math.round((done/15)*100);
  const fill = document.getElementById('progress-fill');
  const count = document.getElementById('progress-count');
  if(fill) fill.style.width = pct+'%';
  if(count) count.textContent = `${done} of 15 series picked`;
}

// ─── Games Modal ───────────────────────────────────────────────────
function showGamesModal(conf, round, seriesIdx, winner) {
  pendingPick = { conf, round, seriesIdx, winner };
  document.getElementById('games-modal-title').textContent = winner + ' wins in how many games?';
  document.getElementById('games-modal').style.display = 'flex';
}
function closeGamesModal() {
  document.getElementById('games-modal').style.display = 'none';
  pendingPick = null;
}
function confirmGames(loserGames) {
  if(!pendingPick) return;
  const { conf, round, seriesIdx, winner } = pendingPick;
  picks[conf][round][seriesIdx] = { winner, games: loserGames };
  cascadeInvalidate(conf, round, seriesIdx);
  closeGamesModal();
  renderConf(conf);
  updateProgress();
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeGamesModal(); });

// ─── Team resolution ───────────────────────────────────────────────
function getTeams(conf, round, seriesIdx) {
  if(round===0) return SEEDS[conf][seriesIdx];
  if(round===1) {
    return [
      {seed:'',abb:picks[conf][0][seriesIdx*2]?.winner||'TBD'},
      {seed:'',abb:picks[conf][0][seriesIdx*2+1]?.winner||'TBD'}
    ];
  }
  return [
    {seed:'',abb:picks[conf][1][0]?.winner||'TBD'},
    {seed:'',abb:picks[conf][1][1]?.winner||'TBD'}
  ];
}

// ─── Render conference ─────────────────────────────────────────────
function renderConf(conf) {
  const colsEl = document.getElementById(conf+'-cols');
  colsEl.innerHTML = '';
  const roundNames = ['First Round','Conf. Semifinals','Conf. Finals'];
  const seriesCounts = [4,2,1];
  const topOffsets = [0,52,158];
  for(let r=0;r<3;r++) {
    const col = document.createElement('div');
    col.className = 'round-col';
    const title = document.createElement('div');
    title.className = 'round-title';
    title.textContent = roundNames[r];
    col.appendChild(title);
    const wrap = document.createElement('div');
    wrap.className = 'series-wrap';
    wrap.style.paddingTop = topOffsets[r]+'px';
    for(let s=0;s<seriesCounts[r];s++) {
      wrap.appendChild(buildCard(conf,r,s,getTeams(conf,r,s)));
      if(r===1&&s===0) { const sp=document.createElement('div'); sp.style.height='20px'; wrap.appendChild(sp); }
    }
    col.appendChild(wrap);
    if(r<2) { colsEl.appendChild(col); colsEl.appendChild(buildConnectors(r,seriesCounts[r],topOffsets[r])); }
    else colsEl.appendChild(col);
  }
  updateFinalsDisplay();
}

// ─── SVG Connectors ────────────────────────────────────────────────
function buildConnectors(fromRound, count, topOffset) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','14');
  svg.style.marginTop = topOffset+28+'px';
  svg.style.flexShrink='0';
  const pairs=count/2, cardH=98, gap=fromRound===0?8:28;
  const pairH=cardH*2+gap, totalH=pairs*pairH;
  svg.setAttribute('height',totalH);
  svg.setAttribute('viewBox',`0 0 14 ${totalH}`);
  for(let p=0;p<pairs;p++) {
    const y1=p*pairH+cardH*0.5, y2=p*pairH+cardH*1.5+gap, ym=(y1+y2)/2, mx=7;
    const mk=d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','#1E3A52');path.setAttribute('stroke-width','1');return path;};
    svg.appendChild(mk(`M 0 ${y1} H ${mx} V ${ym}`));
    svg.appendChild(mk(`M 0 ${y2} H ${mx} V ${ym}`));
    svg.appendChild(mk(`M ${mx} ${ym} H 14`));
  }
  return svg;
}

// ─── Series card ───────────────────────────────────────────────────
function buildCard(conf, round, seriesIdx, teams) {
  const pick = picks[conf][round][seriesIdx]||{};
  const card = document.createElement('div');
  card.className = 'series-card'+(pick.winner?' has-pick':'');
  teams.forEach((team,ti) => {
    const isTbd = team.abb==='TBD';
    const row = document.createElement('div');
    row.className = 'matchup-row'+(isTbd?' tbd':'');
    if(!isTbd&&pick.winner) row.classList.add(pick.winner===team.abb?'winner':'loser');
    const seedEl=document.createElement('span'); seedEl.className='seed'; seedEl.textContent=team.seed||'';
    const abbEl=document.createElement('span'); abbEl.className='team-abb'; abbEl.textContent=team.abb;
    const badge=document.createElement('span');
    if(pick.winner===team.abb&&pick.games!==undefined) {
      badge.textContent=`4-${pick.games}`;
      badge.style.cssText='font-size:.72rem;color:#C8A84B;font-weight:600;margin-left:auto;';
    }
    row.appendChild(seedEl); row.appendChild(abbEl); row.appendChild(badge);
    if(!isTbd) row.addEventListener('click',()=>showGamesModal(conf,round,seriesIdx,team.abb));
    card.appendChild(row);
    if(ti===0){const d=document.createElement('div');d.className='divider';card.appendChild(d);}
  });
  return card;
}

// ─── Cascade invalidation ──────────────────────────────────────────
function cascadeInvalidate(conf, round, seriesIdx) {
  if(round===0) {
    const si=Math.floor(seriesIdx/2);
    const prev=picks[conf][1][si]?.winner;
    const teams=[{abb:picks[conf][0][si*2]?.winner||'TBD'},{abb:picks[conf][0][si*2+1]?.winner||'TBD'}];
    if(prev&&!teams.find(t=>t.abb===prev)) {
      delete picks[conf][1][si];
      const pf=picks[conf][2][0]?.winner;
      const ft=[{abb:picks[conf][1][0]?.winner||'TBD'},{abb:picks[conf][1][1]?.winner||'TBD'}];
      if(pf&&!ft.find(t=>t.abb===pf)) { delete picks[conf][2][0]; if(champPick===pf) champPick=null; }
    }
  }
  if(round===1) {
    const pf=picks[conf][2][0]?.winner;
    const ft=[{abb:picks[conf][1][0]?.winner||'TBD'},{abb:picks[conf][1][1]?.winner||'TBD'}];
    if(pf&&!ft.find(t=>t.abb===pf)) { delete picks[conf][2][0]; if(champPick===pf) champPick=null; }
  }
  if(round===2) {
    const e=picks.east[2][0]?.winner, w=picks.west[2][0]?.winner;
    if(champPick&&champPick!==e&&champPick!==w) champPick=null;
  }
}

// ─── Finals display ────────────────────────────────────────────────
function updateFinalsDisplay() {
  const eConf=picks.east[2][0]?.winner, wConf=picks.west[2][0]?.winner;
  const fe=document.getElementById('fin-east'), fw=document.getElementById('fin-west');
  fe.textContent=eConf||'East ?'; fe.className='finalist-chip'+(eConf?' set':' empty');
  fw.textContent=wConf||'West ?'; fw.className='finalist-chip'+(wConf?' set':' empty');
  const btnE=document.getElementById('champ-btn-east'), btnW=document.getElementById('champ-btn-west');
  btnE.textContent=eConf||'?'; btnW.textContent=wConf||'?';
  btnE.className='champ-btn'+(champPick===eConf&&eConf?' selected-champ':'')+(eConf?'':' empty-btn');
  btnW.className='champ-btn'+(champPick===wConf&&wConf?' selected-champ':'')+(wConf?'':' empty-btn');
  const inst=document.querySelector('.finals-instruction');
  if(inst) {
    if(eConf&&wConf) inst.textContent='Click your champion below';
    else if(eConf||wConf) inst.textContent='Complete the other conference first';
    else inst.textContent='Complete both conferences first';
  }
}

function pickChamp(side) {
  const w=side==='east'?picks.east[2][0]?.winner:picks.west[2][0]?.winner;
  if(!w) return;
  champPick=w; updateFinalsDisplay(); updateProgress();
}

// ─── Submit ────────────────────────────────────────────────────────
async function submitPrediction() {
  const DEADLINE = new Date('2026-04-30T04:59:00Z');
  if(new Date()>=DEADLINE) { showToast('Brackets are locked — playoffs have started!','#C8102E'); return; }

  const name = document.getElementById('userName').value.trim();
  if(!name) { showToast('Enter your name first!','#C8102E'); return; }

  // ── Profanity filter ────────────────────────────────────────────
  const blocked=['fag','fuck','dumb','idiot','scam','scammer','shit','bitch','retarded','retard'];
  if(blocked.some(w=>name.toLowerCase().includes(w))) { showToast('Please enter an appropriate name.','#C8102E'); return; }

  // ── #1 Duplicate check ──────────────────────────────────────────
  const nameLower = name.toLowerCase().trim();
  const duplicate = allSubmissions.some(s => s.name?.toLowerCase().trim() === nameLower);
  if(duplicate) { showToast(`A bracket for "${name}" already exists!`,'#C8102E'); return; }

  // ── Completeness check ──────────────────────────────────────────
  let missing=false;
  ['east','west'].forEach(conf=>{[0,1,2].forEach(r=>{const c=r===0?4:r===1?2:1;for(let s=0;s<c;s++){const p=picks[conf][r][s];if(!p?.winner||p.games===undefined) missing=true;}});});
  if(missing) { showToast('Pick a winner & score for every series!','#C8102E'); return; }
  if(!champPick) { showToast('Pick your NBA champion!','#C8102E'); return; }

  const eConf=picks.east[2][0]?.winner, wConf=picks.west[2][0]?.winner;
  const entry = {
    name,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString(),
    champion: champPick,
    champGames: parseInt(document.getElementById('champ-games').value),
    champReason: document.getElementById('finals-reason').value,
    eastConf: eConf,
    westConf: wConf,
    picks: JSON.parse(JSON.stringify(picks)),
  };

  // ── #6 Generate shareable ID ────────────────────────────────────
  entry.shareId = Math.random().toString(36).slice(2,10);

  if(typeof window.saveEntry==='function') {
    try {
      await window.saveEntry(entry);
      // Show success with share link
      const shareUrl = `${window.location.origin}/brackets.html?id=${entry.shareId}`;
      showShareModal(name, shareUrl);
    } catch(err) {
      showToast('Save failed — try again','#C8102E');
    }
  } else {
    showToast('Bracket locked in! 🏆','#1A6B35');
  }
}

// ─── Share modal ───────────────────────────────────────────────────
function showShareModal(name, url) {
  const modal = document.getElementById('share-modal');
  document.getElementById('share-url').value = url;
  modal.style.display = 'flex';
}

function closeShareModal() {
  document.getElementById('share-modal').style.display = 'none';
}

function copyShareLink() {
  const input = document.getElementById('share-url');
  input.select();
  navigator.clipboard.writeText(input.value).then(()=>{
    showToast('Link copied to clipboard!','#1A6B35');
    closeShareModal();
  }).catch(()=>{
    document.execCommand('copy');
    showToast('Link copied!','#1A6B35');
    closeShareModal();
  });
}

// ─── Toast ─────────────────────────────────────────────────────────
function showToast(msg, bg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.background=bg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

// ─── Init ──────────────────────────────────────────────────────────
renderConf('east');
renderConf('west');
updateProgress();