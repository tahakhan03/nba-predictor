const PTS_WINNER = 5;
const PTS_EXACT  = 15;

let allSubmissions = [];

window.setSubmissions = function(data) {
  allSubmissions = data;
  renderLeaderboard();
};

// ─── Score a submission ────────────────────────────────────────────
function scoreSubmission(sub) {
  const picks = sub.picks || { east:{0:{},1:{},2:{}}, west:{0:{},1:{},2:{}} };
  let winnerPicks=0, exactPicks=0, totalPts=0;
  const breakdown = []; // {conf, round, series, pick, result, status}

  ['east','west'].forEach(conf => {
    for(let round=0;round<3;round++) {
      const resultRound = RESULTS[conf][round];
      const pickRound   = picks[conf]?.[round]||{};
      for(let series=0;series<Object.keys(resultRound).length;series++) {
        const result = resultRound[series];
        const pick   = pickRound[series];
        if(!result?.winner) { breakdown.push({conf,round,series,pick,result,status:'pending'}); continue; }
        if(!pick?.winner)   { breakdown.push({conf,round,series,pick,result,status:'missed'}); continue; }
        if(pick.winner===result.winner) {
          winnerPicks++;
          totalPts+=PTS_WINNER;
          if(pick.games!==undefined&&pick.games===result.games) {
            exactPicks++; totalPts+=PTS_EXACT;
            breakdown.push({conf,round,series,pick,result,status:'exact'});
          } else {
            breakdown.push({conf,round,series,pick,result,status:'winner'});
          }
        } else {
          breakdown.push({conf,round,series,pick,result,status:'wrong'});
        }
      }
    }
  });

  // Finals
  const fr=RESULTS.finals;
  if(fr?.winner&&sub.champion) {
    if(sub.champion===fr.winner) {
      winnerPicks++; totalPts+=PTS_WINNER;
      if(sub.champGames!==undefined&&parseInt(sub.champGames)===fr.games) {
        exactPicks++; totalPts+=PTS_EXACT;
      }
    }
  }

  return { winnerPicks, exactPicks, totalPts, breakdown };
}

// ─── Count completed series ────────────────────────────────────────
function countCompleted() {
  let completed=0;
  ['east','west'].forEach(conf => {
    for(let r=0;r<3;r++) Object.values(RESULTS[conf][r]).forEach(s=>{ if(s.winner!==null) completed++; });
  });
  if(RESULTS.finals.winner!==null) completed++;
  return { completed, total:15 };
}

// ─── Results banner ────────────────────────────────────────────────
function buildResultsBanner() {
  const banner = document.getElementById('results-banner');
  if(!banner) return;
  const items = [];
  ['east','west'].forEach(conf => {
    for(let r=0;r<3;r++) {
      for(let s=0;s<Object.keys(RESULTS[conf][r]).length;s++) {
        const res = RESULTS[conf][r][s];
        if(res.winner) {
          const loser = getLoser(conf,r,s,res.winner);
          items.push(`🏀 ${res.winner} def. ${loser} 4-${res.games}`);
        }
      }
    }
  });
  if(RESULTS.finals.winner) {
    items.push(`🏆 ${RESULTS.finals.winner} wins the NBA Championship 4-${RESULTS.finals.games}`);
  }
  if(!items.length) { banner.style.display='none'; return; }
  banner.style.display='flex';
  banner.innerHTML = `
    <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:#5A7A96;white-space:nowrap;">Latest Results</div>
    <div style="display:flex;gap:1.5rem;overflow-x:auto;padding-bottom:2px;flex:1;">
      ${items.map(i=>`<span style="font-size:.78rem;color:#9BB5CC;white-space:nowrap;">${i}</span>`).join('')}
    </div>
  `;
}

function getLoser(conf, round, seriesIdx, winner) {
  if(round===0) {
    const matchup = {east:[[['DET','ORL'],['CLE','TOR'],['NYK','ATL'],['BOS','PHI']]], west:[[['OKC','LAC'],['HOU','DEN'],['LAL','MIN'],['SAS','PHX']]]}
    const teams = conf==='east' ? [['DET','ORL'],['CLE','TOR'],['NYK','ATL'],['BOS','PHI']][seriesIdx]
                                : [['OKC','LAC'],['HOU','DEN'],['LAL','MIN'],['SAS','PHX']][seriesIdx];
    return teams.find(t=>t!==winner)||'?';
  }
  return '?';
}

// ─── Main render ───────────────────────────────────────────────────
function renderLeaderboard() {
  const loading = document.getElementById('lb-loading');
  const empty   = document.getElementById('lb-empty');
  const podium  = document.getElementById('podium-row');
  const rowsEl  = document.getElementById('lb-rows');
  const tableWrap = document.querySelector('.lb-table-wrap');

  loading.style.display='none';
  buildResultsBanner();

  if(!allSubmissions.length) {
    empty.style.display='block'; tableWrap.style.display='none'; podium.style.display='none'; return;
  }

  const { completed, total } = countCompleted();
  document.getElementById('progress-count').textContent = `${completed} / ${total} series complete`;
  document.getElementById('progress-bar').style.width = Math.round((completed/total)*100)+'%';

  const ranked = allSubmissions
    .map(sub => ({ sub, ...scoreSubmission(sub) }))
    .sort((a,b) => b.totalPts-a.totalPts || a.sub.name.localeCompare(b.sub.name));

  let currentRank=1;
  ranked.forEach((entry,i) => {
    if(i>0&&entry.totalPts<ranked[i-1].totalPts) currentRank=i+1;
    entry.rank=currentRank;
  });

  podium.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  ranked.slice(0,3).forEach((entry,i) => podium.appendChild(buildPodiumCard(entry,i+1,medals[i])));

  rowsEl.innerHTML='';
  if(completed===0) {
    rowsEl.innerHTML=`<div class="no-results-notice">Playoffs haven't started yet — scores will appear once series finish.</div>`;
  } else {
    ranked.forEach((entry,i) => rowsEl.appendChild(buildRow(entry,i)));
  }
  tableWrap.style.display='block';
}

// ─── Podium card ───────────────────────────────────────────────────
function buildPodiumCard(entry, visualRank, medal) {
  const card = document.createElement('div');
  card.className = `podium-card rank-${visualRank}`;
  card.style.animationDelay = (visualRank*0.1)+'s';
  card.innerHTML = `
    <div class="podium-medal">${medal}</div>
    <div class="podium-avatar">${getInitials(entry.sub.name)}</div>
    <div class="podium-name">${entry.sub.name}</div>
    <div style="background:#1A1A0F;border:1px solid #4A3A10;border-radius:20px;padding:2px 10px;display:inline-block;margin:.25rem 0;">
      <span style="font-size:.72rem;color:#C8A84B;">🏆 ${entry.sub.champion||'?'}</span>
    </div>
    <div class="podium-pts">${entry.totalPts}</div>
    <div class="podium-pts-label">pts</div>
    <div class="podium-breakdown">${entry.winnerPicks} winner${entry.winnerPicks!==1?'s':''} · ${entry.exactPicks} exact</div>
  `;
  return card;
}

// ─── #2 Champion badge + #5 Clickable row for breakdown ────────────
function buildRow(entry, idx) {
  const row = document.createElement('div');
  row.className = 'lb-row'+(entry.rank<=3?' top-row':'');
  row.style.animationDelay = (idx*0.04)+'s';
  row.style.cursor='pointer';
  const rankColors={1:'gold',2:'silver',3:'bronze'};
  const rankClass=rankColors[entry.rank]||'';
  const isTie=checkTie(entry.rank, ranked_global);

  row.innerHTML = `
    <div class="col-rank">
      <span class="rank-num ${rankClass}">${entry.rank}</span>
      ${isTie?'<span class="tie-badge">T</span>':''}
    </div>
    <div class="col-name">
      <div class="row-avatar">${getInitials(entry.sub.name)}</div>
      <div>
        <div class="row-name-text">${entry.sub.name}</div>
        <div style="font-size:.65rem;color:#C8A84B;margin-top:1px;">🏆 ${entry.sub.champion||'?'}</div>
      </div>
    </div>
    <div class="col-winner"><span>${entry.winnerPicks}</span> correct</div>
    <div class="col-exact"><span>${entry.exactPicks}</span> exact</div>
    <div class="col-pts ${entry.totalPts===0?'pts-zero':''}">${entry.totalPts}</div>
  `;

  row.addEventListener('click', () => openBreakdown(entry));
  return row;
}

// store ranked globally so buildRow can reference it for tie check
let ranked_global = [];
const origRender = renderLeaderboard;

// ─── #5 Breakdown modal ────────────────────────────────────────────
function openBreakdown(entry) {
  const modal = document.getElementById('breakdown-modal');
  document.getElementById('bd-name').textContent = entry.sub.name + "'s Picks";
  document.getElementById('bd-pts').textContent = entry.totalPts + ' pts';

  const body = document.getElementById('bd-body');
  body.innerHTML = '';

  const roundNames = ['First Round','Conf. Semis','Conf. Finals'];
  const confs = ['east','west'];

  confs.forEach(conf => {
    const confTitle = document.createElement('div');
    confTitle.style.cssText = 'font-size:.65rem;text-transform:uppercase;letter-spacing:1.5px;color:#5A7A96;margin:10px 0 5px;';
    confTitle.textContent = conf==='east'?'Eastern Conference':'Western Conference';
    body.appendChild(confTitle);

    for(let r=0;r<3;r++) {
      entry.breakdown.filter(b=>b.conf===conf&&b.round===r).forEach(b => {
        const item = document.createElement('div');
        const statusColor = b.status==='exact'?'#C8A84B':b.status==='winner'?'#4A9A6A':b.status==='wrong'?'#C8102E':'#5A7A96';
        const statusIcon  = b.status==='exact'?'★':b.status==='winner'?'✓':b.status==='wrong'?'✗':'–';
        const statusLabel = b.status==='exact'?`+${PTS_WINNER+PTS_EXACT}pts`:b.status==='winner'?`+${PTS_WINNER}pts`:b.status==='wrong'?'0pts':'Pending';
        const scoreStr = b.pick?.winner&&b.pick?.games!==undefined?`4-${b.pick.games}`:'';
        item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;margin-bottom:3px;background:#132033;';
        item.innerHTML = `
          <span style="font-size:.9rem;color:${statusColor};width:16px;text-align:center;">${statusIcon}</span>
          <span style="flex:1;font-size:.8rem;color:#E8F0F8;">${b.pick?.winner||'—'} ${scoreStr}</span>
          <span style="font-size:.7rem;color:${statusColor};font-weight:600;">${statusLabel}</span>
        `;
        body.appendChild(item);
      });
    }
  });

  // Finals
  const finTitle = document.createElement('div');
  finTitle.style.cssText = 'font-size:.65rem;text-transform:uppercase;letter-spacing:1.5px;color:#5A7A96;margin:10px 0 5px;';
  finTitle.textContent = 'NBA Finals Champion';
  body.appendChild(finTitle);
  const finItem = document.createElement('div');
  const fr = RESULTS.finals;
  const finCorrect = fr.winner && entry.sub.champion===fr.winner;
  const finExact = finCorrect && parseInt(entry.sub.champGames)===fr.games;
  const fColor = finExact?'#C8A84B':finCorrect?'#4A9A6A':fr.winner?'#C8102E':'#5A7A96';
  const fIcon  = finExact?'★':finCorrect?'✓':fr.winner?'✗':'–';
  const fLabel = finExact?`+${PTS_WINNER+PTS_EXACT}pts`:finCorrect?`+${PTS_WINNER}pts`:fr.winner?'0pts':'Pending';
  finItem.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;margin-bottom:3px;background:#132033;';
  finItem.innerHTML=`
    <span style="font-size:.9rem;color:${fColor};width:16px;text-align:center;">${fIcon}</span>
    <span style="flex:1;font-size:.8rem;color:#E8F0F8;">🏆 ${entry.sub.champion||'—'} in ${entry.sub.champGames||'?'}</span>
    <span style="font-size:.7rem;color:${fColor};font-weight:600;">${fLabel}</span>
  `;
  body.appendChild(finItem);

  // Share link
  if(entry.sub.shareId) {
    const shareDiv = document.createElement('div');
    shareDiv.style.cssText='margin-top:12px;padding-top:12px;border-top:1px solid #1E3A52;display:flex;gap:8px;';
    const shareUrl = `${window.location.origin}/brackets.html?id=${entry.sub.shareId}`;
    shareDiv.innerHTML=`
      <input value="${shareUrl}" readonly style="flex:1;background:#0B1520;border:1px solid #1E3A52;color:#9BB5CC;padding:6px 8px;border-radius:6px;font-size:.72rem;font-family:'DM Sans',sans-serif;" />
      <button onclick="navigator.clipboard.writeText('${shareUrl}').then(()=>showLbToast('Link copied!'))" style="background:#C8A84B;color:#0B1520;border:none;padding:6px 12px;border-radius:6px;font-family:'Bebas Neue',sans-serif;font-size:.85rem;cursor:pointer;letter-spacing:1px;">Copy</button>
    `;
    body.appendChild(shareDiv);
  }

  modal.style.display='flex';
}

function closeBreakdown() {
  document.getElementById('breakdown-modal').style.display='none';
}

function showLbToast(msg) {
  const t=document.getElementById('lb-toast');
  if(!t) return;
  t.textContent=msg; t.style.opacity='1';
  setTimeout(()=>t.style.opacity='0',2000);
}

function checkTie(rank, ranked) {
  return ranked.filter(e=>e.rank===rank).length>1;
}

function getInitials(name) {
  if(!name) return '?';
  const parts=name.trim().split(' ');
  return parts.length===1?parts[0][0].toUpperCase():(parts[0][0]+parts[parts.length-1][0]).toUpperCase();
}