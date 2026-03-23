// ─── Seedings ──────────────────────────────────────────────────────
// Update these any time the playoff picture changes.
const SEEDS = {
  east: [
    [{ seed: 1, abb: 'DET' }, { seed: 8, abb: 'ORL' }],
    [{ seed: 4, abb: 'CLE' }, { seed: 5, abb: 'TOR' }],
    [{ seed: 3, abb: 'NYK' }, { seed: 6, abb: 'ATL' }],
    [{ seed: 2, abb: 'BOS' }, { seed: 7, abb: 'PHI' }],
  ],
  west: [
    [{ seed: 1, abb: 'OKC' }, { seed: 8, abb: 'LAC' }],
    [{ seed: 4, abb: 'HOU' }, { seed: 5, abb: 'DEN' }],
    [{ seed: 3, abb: 'LAL' }, { seed: 6, abb: 'MIN' }],
    [{ seed: 2, abb: 'SAS' }, { seed: 7, abb: 'PHX' }],
  ],
};

// ─── State ─────────────────────────────────────────────────────────
// picks[conf][round][seriesIndex] = { winner, games, reason }
let picks = {
  east: { 0: {}, 1: {}, 2: {} },
  west: { 0: {}, 1: {}, 2: {} },
};
let champPick = null;

// submissions is populated by firebase.js via window.setSubmissions()
let submissions = [];

// Called by firebase.js whenever Firestore data updates
window.setSubmissions = function (data) {
  submissions = data;
  renderSubs();
};

// Called by firebase.js to expose the save function
window.saveEntry = null; // will be set by firebase.js

// ─── Team Resolution ───────────────────────────────────────────────
function getTeams(conf, round, seriesIdx) {
  if (round === 0) return SEEDS[conf][seriesIdx];

  if (round === 1) {
    const top = picks[conf][0][seriesIdx * 2]?.winner;
    const bot = picks[conf][0][seriesIdx * 2 + 1]?.winner;
    return [
      { seed: '', abb: top || 'TBD' },
      { seed: '', abb: bot || 'TBD' },
    ];
  }

  if (round === 2) {
    const top = picks[conf][1][0]?.winner;
    const bot = picks[conf][1][1]?.winner;
    return [
      { seed: '', abb: top || 'TBD' },
      { seed: '', abb: bot || 'TBD' },
    ];
  }
}

// ─── Render Conference ─────────────────────────────────────────────
function renderConf(conf) {
  const colsEl = document.getElementById(conf + '-cols');
  colsEl.innerHTML = '';

  const roundNames = ['First Round', 'Conf. Semifinals', 'Conf. Finals'];
  const seriesCounts = [4, 2, 1];
  const topOffsets = [0, 52, 158]; // vertical padding to center later rounds

  for (let r = 0; r < 3; r++) {
    const col = document.createElement('div');
    col.className = 'round-col';

    const title = document.createElement('div');
    title.className = 'round-title';
    title.textContent = roundNames[r];
    col.appendChild(title);

    const wrap = document.createElement('div');
    wrap.className = 'series-wrap';
    wrap.style.paddingTop = topOffsets[r] + 'px';

    const count = seriesCounts[r];
    for (let s = 0; s < count; s++) {
      const teams = getTeams(conf, r, s);
      wrap.appendChild(buildCard(conf, r, s, teams));
      // Extra gap between the two semi pairs
      if (r === 1 && s === 0) {
        const sp = document.createElement('div');
        sp.style.height = '20px';
        wrap.appendChild(sp);
      }
    }

    col.appendChild(wrap);

    if (r < 2) {
      colsEl.appendChild(col);
      colsEl.appendChild(buildConnectors(r, seriesCounts[r], topOffsets[r]));
    } else {
      colsEl.appendChild(col);
    }
  }

  updateFinalsDisplay();
}

// ─── SVG Bracket Connectors ────────────────────────────────────────
function buildConnectors(fromRound, count, topOffset) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.style.marginTop = topOffset + 28 + 'px';
  svg.style.flexShrink = '0';

  const pairs = count / 2;
  const cardH = 94;
  const gapBetween = fromRound === 0 ? 8 : 28;
  const pairH = cardH * 2 + gapBetween;
  const totalH = pairs * pairH;

  svg.setAttribute('height', totalH);
  svg.setAttribute('viewBox', `0 0 14 ${totalH}`);

  const color = '#1E3A52';

  for (let p = 0; p < pairs; p++) {
    const y1 = p * pairH + cardH * 0.5;
    const y2 = p * pairH + cardH * 1.5 + gapBetween;
    const ym = (y1 + y2) / 2;
    const mx = 7;

    const mkPath = (d) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1');
      return path;
    };

    svg.appendChild(mkPath(`M 0 ${y1} H ${mx} V ${ym}`));
    svg.appendChild(mkPath(`M 0 ${y2} H ${mx} V ${ym}`));
    svg.appendChild(mkPath(`M ${mx} ${ym} H 14`));
  }

  return svg;
}

// ─── Series Card ───────────────────────────────────────────────────
function buildCard(conf, round, seriesIdx, teams) {
  const pick = picks[conf][round][seriesIdx] || {};

  const card = document.createElement('div');
  card.className = 'series-card' + (pick.winner ? ' has-pick' : '');
  card.id = `card_${conf}_${round}_${seriesIdx}`;

  teams.forEach((team, ti) => {
    const isTbd = team.abb === 'TBD';

    const row = document.createElement('div');
    row.className = 'matchup-row' + (isTbd ? ' tbd' : '');
    if (!isTbd && pick.winner) {
      row.classList.add(pick.winner === team.abb ? 'winner' : 'loser');
    }

    const seedEl = document.createElement('span');
    seedEl.className = 'seed';
    seedEl.textContent = team.seed || '';

    const abbEl = document.createElement('span');
    abbEl.className = 'team-abb';
    abbEl.textContent = team.abb;

    // Games selector (4-0 through 4-3)
    const sel = document.createElement('select');
    sel.className = 'games-sel';
    [0, 1, 2, 3].forEach((g) => {
      const o = document.createElement('option');
      o.value = g;
      o.textContent = `4-${g}`;
      if (pick.winner === team.abb && pick.games === g) o.selected = true;
      sel.appendChild(o);
    });

    sel.addEventListener('change', (e) => {
      e.stopPropagation();
      if (picks[conf][round][seriesIdx]?.winner === team.abb) {
        picks[conf][round][seriesIdx].games = parseInt(e.target.value);
      }
    });

    row.appendChild(seedEl);
    row.appendChild(abbEl);
    row.appendChild(sel);

    if (!isTbd) {
      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'SELECT') return;
        pickWinner(conf, round, seriesIdx, team.abb, parseInt(sel.value));
      });
    }

    card.appendChild(row);

    if (ti === 0) {
      const d = document.createElement('div');
      d.className = 'divider';
      card.appendChild(d);
    }
  });

  // Reasoning textarea
  const ta = document.createElement('textarea');
  ta.className = 'reason-box';
  ta.rows = 2;
  ta.placeholder = 'Why? (optional)';
  ta.value = pick.reason || '';
  ta.addEventListener('input', () => {
    if (!picks[conf][round][seriesIdx]) picks[conf][round][seriesIdx] = {};
    picks[conf][round][seriesIdx].reason = ta.value;
  });

  card.appendChild(ta);
  return card;
}

// ─── Pick a Winner ─────────────────────────────────────────────────
function pickWinner(conf, round, seriesIdx, winner, games) {
  picks[conf][round][seriesIdx] = {
    winner,
    games: games || 3,
    reason: picks[conf][round][seriesIdx]?.reason || '',
  };
  cascadeInvalidate(conf, round, seriesIdx, winner);
  renderConf(conf);
}

// ─── Cascade Invalidation ──────────────────────────────────────────
// Clears downstream picks that are no longer possible after a change.
function cascadeInvalidate(conf, round, seriesIdx, newWinner) {
  if (round === 0) {
    const semiIdx = Math.floor(seriesIdx / 2);
    const prevSemiWinner = picks[conf][1][semiIdx]?.winner;
    const semiTeams = teamsForSemi(conf, semiIdx);

    if (prevSemiWinner && !semiTeams.find((t) => t.abb === prevSemiWinner)) {
      delete picks[conf][1][semiIdx];

      const prevFinalsWinner = picks[conf][2][0]?.winner;
      const finTeams = teamsForFinals(conf);
      if (prevFinalsWinner && !finTeams.find((t) => t.abb === prevFinalsWinner)) {
        delete picks[conf][2][0];
        if (champPick === prevFinalsWinner) champPick = null;
      }
    }
  }

  if (round === 1) {
    const prevFinalsWinner = picks[conf][2][0]?.winner;
    const finTeams = teamsForFinals(conf);
    if (prevFinalsWinner && !finTeams.find((t) => t.abb === prevFinalsWinner)) {
      delete picks[conf][2][0];
      if (champPick === prevFinalsWinner) champPick = null;
    }
  }

  if (round === 2) {
    const eastConf = picks.east[2][0]?.winner;
    const westConf = picks.west[2][0]?.winner;
    if (champPick && champPick !== eastConf && champPick !== westConf) {
      champPick = null;
    }
  }
}

function teamsForSemi(conf, semiIdx) {
  const top = picks[conf][0][semiIdx * 2]?.winner;
  const bot = picks[conf][0][semiIdx * 2 + 1]?.winner;
  return [{ abb: top || 'TBD' }, { abb: bot || 'TBD' }];
}

function teamsForFinals(conf) {
  const top = picks[conf][1][0]?.winner;
  const bot = picks[conf][1][1]?.winner;
  return [{ abb: top || 'TBD' }, { abb: bot || 'TBD' }];
}

// ─── Finals Display ────────────────────────────────────────────────
function updateFinalsDisplay() {
  const eConf = picks.east[2][0]?.winner;
  const wConf = picks.west[2][0]?.winner;

  const finEast = document.getElementById('fin-east');
  const finWest = document.getElementById('fin-west');
  finEast.textContent = eConf || 'East ?';
  finEast.className = 'finalist-chip' + (eConf ? ' set' : ' empty');
  finWest.textContent = wConf || 'West ?';
  finWest.className = 'finalist-chip' + (wConf ? ' set' : ' empty');

  const btnE = document.getElementById('champ-btn-east');
  const btnW = document.getElementById('champ-btn-west');
  btnE.textContent = eConf || '?';
  btnW.textContent = wConf || '?';

  btnE.className =
    'champ-btn' +
    (champPick === eConf && eConf ? ' selected-champ' : '') +
    (eConf ? '' : ' empty-btn');
  btnW.className =
    'champ-btn' +
    (champPick === wConf && wConf ? ' selected-champ' : '') +
    (wConf ? '' : ' empty-btn');
}

// ─── Pick Champion ─────────────────────────────────────────────────
function pickChamp(side) {
  const winner =
    side === 'east' ? picks.east[2][0]?.winner : picks.west[2][0]?.winner;
  if (!winner) return;
  champPick = winner;
  updateFinalsDisplay();
}

// ─── Submit Prediction ─────────────────────────────────────────────
async function submitPrediction() {
  const name = document.getElementById('userName').value.trim();
  if (!name) { showToast('Enter your name first!', '#C8102E'); return; }
  if (!champPick) { showToast('Pick your NBA champion!', '#C8102E'); return; }

  const eConf = picks.east[2][0]?.winner;
  const wConf = picks.west[2][0]?.winner;
  if (!eConf || !wConf) {
    showToast('Pick both conference champions first!', '#C8102E');
    return;
  }

  const entry = {
    name,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString(),
    champion: champPick,
    champGames: document.getElementById('champ-games').value,
    champReason: document.getElementById('finals-reason').value,
    eastConf: eConf,
    westConf: wConf,
    picks: JSON.parse(JSON.stringify(picks)),
  };

  // Save to Firestore if firebase.js has wired it up, otherwise local fallback
  if (typeof window.saveEntry === 'function') {
    try {
      await window.saveEntry(entry);
      showToast('Prediction locked in! 🏆', '#1A7A3A');
    } catch (err) {
      console.error('Firestore save failed:', err);
      showToast('Save failed — check console', '#C8102E');
    }
  } else {
    // Fallback: localStorage only (no Firebase yet)
    submissions.unshift(entry);
    try { localStorage.setItem('nba_preds_v3', JSON.stringify(submissions)); } catch (e) {}
    renderSubs();
    showToast('Prediction locked in! 🏆', '#1A7A3A');
  }
}

// ─── Render Submissions ────────────────────────────────────────────
function renderSubs() {
  const el = document.getElementById('sub-list');
  if (!submissions.length) {
    el.innerHTML =
      '<div style="font-size:.8rem;color:#6A8FAF">No predictions yet — be the first!</div>';
    return;
  }
  el.innerHTML = submissions
    .map(
      (s) => `
    <div class="sub-item">
      <div>
        <div class="sub-name">${s.name}</div>
        <div class="sub-detail">🏆 ${s.champion} in ${s.champGames} &nbsp;|&nbsp; ${s.eastConf} vs ${s.westConf}</div>
        ${
          s.champReason
            ? `<div class="sub-note">"${s.champReason.slice(0, 70)}${s.champReason.length > 70 ? '...' : ''}"</div>`
            : ''
        }
      </div>
      <div class="sub-time">${s.displayTime || s.timestamp}</div>
    </div>`
    )
    .join('');
}

// ─── Toast ─────────────────────────────────────────────────────────
function showToast(msg, bg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = bg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── Init ──────────────────────────────────────────────────────────
renderConf('east');
renderConf('west');
renderSubs();
