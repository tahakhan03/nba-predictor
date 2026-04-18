// ─── Seedings (must match bracket.js) ─────────────────────────────
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

let allSubmissions = [];

// Called by firebase-brackets.js when data loads / updates
window.setSubmissions = function (data) {
  allSubmissions = data;
  const sel = document.getElementById('sort-select');
  renderAll(sel ? sel.value : 'newest');

  // #6 If opened via share link, auto-open that person's bracket
  const params = new URLSearchParams(window.location.search);
  const shareId = params.get('id');
  if (shareId) {
    const target = allSubmissions.find(s => s.shareId === shareId);
    if (target) {
      setTimeout(() => openModal(target), 300);
    }
  }
};

// ─── Sort ──────────────────────────────────────────────────────────
function sortSubmissions(method) {
  renderAll(method);
}

function sorted(data, method) {
  const copy = [...data];
  if (method === 'oldest') return copy.reverse();
  if (method === 'name')   return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy; // newest first (default from Firestore)
}

// ─── Render all cards ──────────────────────────────────────────────
function renderAll(method = 'newest') {
  const loading = document.getElementById('loading-state');
  const empty   = document.getElementById('empty-state');
  const grid    = document.getElementById('cards-grid');
  const count   = document.getElementById('sub-count');

  loading.style.display = 'none';

  if (!allSubmissions.length) {
    empty.style.display = 'block';
    grid.style.display  = 'none';
    count.textContent   = '0 predictions submitted';
    return;
  }

  empty.style.display = 'none';
  grid.style.display  = 'grid';
  count.textContent   = `${allSubmissions.length} prediction${allSubmissions.length !== 1 ? 's' : ''} submitted`;

  const list = sorted(allSubmissions, method);
  grid.innerHTML = '';
  list.forEach((sub, i) => {
    grid.appendChild(buildCard(sub, i));
  });
}

// ─── Build a submission card ───────────────────────────────────────
function buildCard(sub, idx) {
  const card = document.createElement('div');
  card.className = 'sub-card';
  card.style.animationDelay = Math.min(idx * 0.04, 0.3) + 's';

  const initials = getInitials(sub.name);
  const picks    = sub.picks || { east: { 0: {}, 1: {}, 2: {} }, west: { 0: {}, 1: {}, 2: {} } };

  // ── Header ──
  const header = document.createElement('div');
  header.className = 'card-header';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:.6rem">
      <div class="card-avatar">${initials}</div>
      <div>
        <div class="card-name">${sub.name}</div>
        <div class="card-time">${sub.displayTime || sub.timestamp || ''}</div>
      </div>
    </div>
    <div class="card-champ-badge">🏆 ${sub.champion || '?'}</div>
  `;

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'card-body';

  // East mini bracket
  body.appendChild(buildMiniConf('east', picks.east || {}));

  const div1 = document.createElement('div');
  div1.className = 'card-divider';
  body.appendChild(div1);

  // West mini bracket
  body.appendChild(buildMiniConf('west', picks.west || {}));

  const div2 = document.createElement('div');
  div2.className = 'card-divider';
  body.appendChild(div2);

  // Finals row
  const finalsRow = document.createElement('div');
  finalsRow.className = 'card-finals-row';
  const eastRep = picks.east?.[2]?.[0]?.winner || '?';
  const westRep = picks.west?.[2]?.[0]?.winner || '?';
  finalsRow.innerHTML = `
    <div class="finals-matchup">
      <span>${eastRep}</span> <span style="color:#6A8FAF;font-size:.75rem">vs</span> <span>${westRep}</span>
    </div>
    <div style="font-size:.7rem;color:#6A8FAF">Finals</div>
  `;
  body.appendChild(finalsRow);

  // Champ reason if provided
  if (sub.champReason) {
    const reason = document.createElement('div');
    reason.className = 'card-reason';
    reason.textContent = `"${sub.champReason}"`;
    body.appendChild(reason);
  }

  // View full button
  const btn = document.createElement('button');
  btn.className = 'view-full-btn';
  btn.textContent = 'View full bracket →';
  btn.onclick = () => openModal(sub);
  body.appendChild(btn);

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

// ─── Mini conference bracket (card view) ──────────────────────────
function buildMiniConf(conf, confPicks) {
  const wrap = document.createElement('div');
  wrap.className = 'conf-section-mini';

  const label = document.createElement('div');
  label.className = `conf-label-mini ${conf}-mini`;
  label.textContent = conf === 'east' ? 'Eastern' : 'Western';
  wrap.appendChild(label);

  const row = document.createElement('div');
  row.className = 'rounds-row';

  const roundLabels = ['R1', 'Semis', 'Finals'];
  const seriesCounts = [4, 2, 1];

  for (let r = 0; r < 3; r++) {
    const col = document.createElement('div');
    col.className = 'round-mini';

    const rLabel = document.createElement('div');
    rLabel.className = 'round-name-mini';
    rLabel.textContent = roundLabels[r];
    col.appendChild(rLabel);

    for (let s = 0; s < seriesCounts[r]; s++) {
      const pick = confPicks[r]?.[s];
      const chip = document.createElement('div');

      if (pick?.winner) {
        chip.className = 'pick-chip';
        chip.textContent = pick.winner;
        if (r === 2) chip.classList.add('champion');
      } else {
        chip.className = 'pick-chip empty';
        chip.textContent = '—';
      }
      col.appendChild(chip);
    }
    row.appendChild(col);
  }

  wrap.appendChild(row);
  return wrap;
}

// ─── Modal: full bracket view ──────────────────────────────────────
function openModal(sub) {
  const overlay  = document.getElementById('modal-overlay');
  const nameEl   = document.getElementById('modal-name');
  const champEl  = document.getElementById('modal-champ');
  const bodyEl   = document.getElementById('modal-body');

  nameEl.textContent  = sub.name;
  champEl.textContent = `🏆 Predicts ${sub.champion || '?'} in ${sub.champGames || '?'} games`;

  bodyEl.innerHTML = '';

  const picks = sub.picks || { east: { 0: {}, 1: {}, 2: {} }, west: { 0: {}, 1: {}, 2: {} } };

  // East full bracket
  bodyEl.appendChild(buildModalConf('east', picks.east || {}));
  // West full bracket
  bodyEl.appendChild(buildModalConf('west', picks.west || {}));
  // Finals section
  bodyEl.appendChild(buildModalFinals(sub, picks));

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Full conference bracket inside modal ─────────────────────────
function buildModalConf(conf, confPicks) {
  const wrap = document.createElement('div');

  const label = document.createElement('div');
  label.className = `modal-conf-title modal-${conf}`;
  label.textContent = conf === 'east' ? 'Eastern Conference' : 'Western Conference';
  wrap.appendChild(label);

  const roundsRow = document.createElement('div');
  roundsRow.className = 'modal-rounds';

  const roundNames   = ['First Round', 'Conf. Semis', 'Conf. Finals'];
  const seriesCounts = [4, 2, 1];

  for (let r = 0; r < 3; r++) {
    const col = document.createElement('div');
    col.className = 'modal-round-col';

    const title = document.createElement('div');
    title.className = 'modal-round-title';
    title.textContent = roundNames[r];
    col.appendChild(title);

    for (let s = 0; s < seriesCounts[r]; s++) {
      col.appendChild(buildModalSeries(conf, r, s, confPicks));
    }

    roundsRow.appendChild(col);
  }

  wrap.appendChild(roundsRow);
  return wrap;
}

function buildModalSeries(conf, round, seriesIdx, confPicks) {
  const pick  = confPicks[round]?.[seriesIdx] || {};
  const teams = getModalTeams(conf, round, seriesIdx, confPicks);

  const card = document.createElement('div');
  card.className = 'modal-series' + (pick.winner ? ' has-winner' : '');

  teams.forEach((team, ti) => {
    const row = document.createElement('div');
    row.className = 'modal-team-row';
    if (pick.winner) {
      row.classList.add(pick.winner === team.abb ? 'winner' : 'loser');
    }

    const seed  = document.createElement('span');
    seed.className = 'modal-team-seed';
    seed.textContent = team.seed || '';

    const abb   = document.createElement('span');
    abb.className = 'modal-team-abb';
    abb.textContent = team.abb;

    const games = document.createElement('span');
    games.className = 'modal-team-games';
    if (pick.winner === team.abb && pick.games !== undefined) {
      games.textContent = `4-${pick.games}`;
    }

    row.appendChild(seed);
    row.appendChild(abb);
    row.appendChild(games);
    card.appendChild(row);

    if (ti === 0) {
      const d = document.createElement('div');
      d.className = 'modal-divider';
      card.appendChild(d);
    }
  });

  if (pick.reason) {
    const reason = document.createElement('div');
    reason.className = 'modal-reason';
    reason.textContent = `"${pick.reason}"`;
    card.appendChild(reason);
  }

  return card;
}

function getModalTeams(conf, round, seriesIdx, confPicks) {
  if (round === 0) return SEEDS[conf][seriesIdx];

  if (round === 1) {
    const top = confPicks[0]?.[seriesIdx * 2]?.winner;
    const bot = confPicks[0]?.[seriesIdx * 2 + 1]?.winner;
    return [
      { seed: '', abb: top || 'TBD' },
      { seed: '', abb: bot || 'TBD' },
    ];
  }

  if (round === 2) {
    const top = confPicks[1]?.[0]?.winner;
    const bot = confPicks[1]?.[1]?.winner;
    return [
      { seed: '', abb: top || 'TBD' },
      { seed: '', abb: bot || 'TBD' },
    ];
  }
}

function buildModalFinals(sub, picks) {
  const section = document.createElement('div');
  section.className = 'modal-finals-section';

  const title = document.createElement('div');
  title.className = 'modal-finals-title';
  title.textContent = 'NBA Finals';
  section.appendChild(title);

  const eastRep = picks.east?.[2]?.[0]?.winner || '?';
  const westRep = picks.west?.[2]?.[0]?.winner || '?';
  const champ   = sub.champion || '?';

  const matchup = document.createElement('div');
  matchup.className = 'modal-finals-matchup';

  const eastChip = document.createElement('div');
  eastChip.className = 'modal-finalist' + (champ === eastRep ? ' champ' : '');
  eastChip.textContent = eastRep;

  const vs = document.createElement('div');
  vs.className = 'modal-vs';
  vs.textContent = 'vs';

  const westChip = document.createElement('div');
  westChip.className = 'modal-finalist' + (champ === westRep ? ' champ' : '');
  westChip.textContent = westRep;

  matchup.appendChild(eastChip);
  matchup.appendChild(vs);
  matchup.appendChild(westChip);
  section.appendChild(matchup);

  const detail = document.createElement('div');
  detail.className = 'modal-champ-detail';
  detail.innerHTML = `<span>${champ}</span> wins in <span>${sub.champGames || '?'}</span> games`;
  section.appendChild(detail);

  if (sub.champReason) {
    const reason = document.createElement('div');
    reason.className = 'modal-finals-reason';
    reason.textContent = `"${sub.champReason}"`;
    section.appendChild(reason);
  }

  return section;
}

// ─── Helpers ───────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});