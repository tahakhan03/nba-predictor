// ─── Scoring constants ─────────────────────────────────────────────
const PTS_WINNER = 5;   // correct series winner
const PTS_EXACT  = 15;  // correct winner AND exact series score

// ─── State ─────────────────────────────────────────────────────────
let allSubmissions = [];

// Called by firebase-brackets.js when Firestore data loads / updates
window.setSubmissions = function (data) {
  allSubmissions = data;
  renderLeaderboard();
};

// ─── Score a single submission ─────────────────────────────────────
function scoreSubmission(sub) {
  const picks = sub.picks || { east: { 0:{}, 1:{}, 2:{} }, west: { 0:{}, 1:{}, 2:{} } };
  let winnerPicks = 0;
  let exactPicks  = 0;
  let totalPts    = 0;

  // Score East + West bracket rounds
  ['east', 'west'].forEach((conf) => {
    for (let round = 0; round < 3; round++) {
      const resultRound = RESULTS[conf][round];
      const pickRound   = picks[conf]?.[round] || {};

      for (let series = 0; series < Object.keys(resultRound).length; series++) {
        const result = resultRound[series];
        const pick   = pickRound[series];

        // Skip series not yet finished
        if (!result?.winner || pick?.winner === undefined) continue;

        if (pick.winner === result.winner) {
          // Correct winner
          winnerPicks++;
          totalPts += PTS_WINNER;

          // Check exact score bonus
          if (pick.games !== undefined && pick.games === result.games) {
            exactPicks++;
            totalPts += PTS_EXACT;
          }
        }
      }
    }
  });

  // Score NBA Finals
  const finalsResult = RESULTS.finals;
  const finalsPickWinner = sub.champion;
  const finalsPickGames  = sub.champGames !== undefined ? parseInt(sub.champGames) : undefined;

  if (finalsResult?.winner && finalsPickWinner) {
    if (finalsPickWinner === finalsResult.winner) {
      winnerPicks++;
      totalPts += PTS_WINNER;

      if (finalsPickGames !== undefined && finalsPickGames === finalsResult.games) {
        exactPicks++;
        totalPts += PTS_EXACT;
      }
    }
  }

  return { winnerPicks, exactPicks, totalPts };
}

// ─── Count completed series ────────────────────────────────────────
function countCompleted() {
  let completed = 0;
  const total   = 15; // 4 + 4 + 2 + 2 + 1 + 1 + 1 (East + West + Finals)

  ['east', 'west'].forEach((conf) => {
    for (let r = 0; r < 3; r++) {
      Object.values(RESULTS[conf][r]).forEach((s) => {
        if (s.winner !== null) completed++;
      });
    }
  });

  if (RESULTS.finals.winner !== null) completed++;
  return { completed, total };
}

// ─── Main render ───────────────────────────────────────────────────
function renderLeaderboard() {
  const loading  = document.getElementById('lb-loading');
  const empty    = document.getElementById('lb-empty');
  const podium   = document.getElementById('podium-row');
  const rowsEl   = document.getElementById('lb-rows');
  const tableWrap = document.querySelector('.lb-table-wrap');

  loading.style.display = 'none';

  if (!allSubmissions.length) {
    empty.style.display   = 'block';
    tableWrap.style.display = 'none';
    podium.style.display  = 'none';
    return;
  }

  // Update progress bar
  const { completed, total } = countCompleted();
  document.getElementById('progress-count').textContent =
    `${completed} / ${total} series complete`;
  document.getElementById('progress-bar').style.width =
    Math.round((completed / total) * 100) + '%';

  // Score everyone and sort
  const ranked = allSubmissions
    .map((sub) => ({ sub, ...scoreSubmission(sub) }))
    .sort((a, b) => b.totalPts - a.totalPts || a.sub.name.localeCompare(b.sub.name));

  // Assign ranks (handle ties)
  let currentRank = 1;
  ranked.forEach((entry, i) => {
    if (i > 0 && entry.totalPts < ranked[i - 1].totalPts) {
      currentRank = i + 1;
    }
    entry.rank = currentRank;
  });

  // Render podium (top 3)
  podium.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉'];
  ranked.slice(0, 3).forEach((entry, i) => {
    podium.appendChild(buildPodiumCard(entry, i + 1, medals[i]));
  });

  // Render full table
  rowsEl.innerHTML = '';

  if (completed === 0) {
    rowsEl.innerHTML = `
      <div class="no-results-notice">
        Playoffs haven't started yet — scores will appear here once series finish.
      </div>`;
  } else {
    ranked.forEach((entry, i) => {
      rowsEl.appendChild(buildRow(entry, i));
    });
  }

  tableWrap.style.display = 'block';
}

// ─── Podium card ───────────────────────────────────────────────────
function buildPodiumCard(entry, visualRank, medal) {
  const card = document.createElement('div');
  card.className = `podium-card rank-${visualRank}`;
  card.style.animationDelay = (visualRank * 0.1) + 's';

  const initials = getInitials(entry.sub.name);

  card.innerHTML = `
    <div class="podium-medal">${medal}</div>
    <div class="podium-avatar">${initials}</div>
    <div class="podium-name">${entry.sub.name}</div>
    <div class="podium-pts">${entry.totalPts}</div>
    <div class="podium-pts-label">pts</div>
    <div class="podium-breakdown">
      ${entry.winnerPicks} winner${entry.winnerPicks !== 1 ? 's' : ''}
      · ${entry.exactPicks} exact
    </div>
  `;
  return card;
}

// ─── Table row ─────────────────────────────────────────────────────
function buildRow(entry, idx) {
  const row = document.createElement('div');
  row.className = 'lb-row' + (entry.rank <= 3 ? ' top-row' : '');
  row.style.animationDelay = (idx * 0.04) + 's';

  const rankColors = { 1: 'gold', 2: 'silver', 3: 'bronze' };
  const rankClass  = rankColors[entry.rank] || '';
  const isTie      = countTies(entry.rank);
  const initials   = getInitials(entry.sub.name);

  row.innerHTML = `
    <div class="col-rank">
      <span class="rank-num ${rankClass}">${entry.rank}</span>
      ${isTie ? '<span class="tie-badge">T</span>' : ''}
    </div>
    <div class="col-name">
      <div class="row-avatar">${initials}</div>
      <div class="row-name-text">${entry.sub.name}</div>
    </div>
    <div class="col-winner"><span>${entry.winnerPicks}</span> correct</div>
    <div class="col-exact"><span>${entry.exactPicks}</span> exact</div>
    <div class="col-pts ${entry.totalPts === 0 ? 'pts-zero' : ''}">${entry.totalPts}</div>
  `;
  return row;
}

// ─── Count ties at a given rank ────────────────────────────────────
function countTies(rank) {
  const ranked = allSubmissions
    .map((sub) => scoreSubmission(sub))
    .sort((a, b) => b.totalPts - a.totalPts);
  // Find how many people share this rank
  const atRank = ranked.filter((_, i) => {
    let r = 1;
    for (let j = 0; j < i; j++) {
      if (ranked[j].totalPts > ranked[i].totalPts) r = j + 2;
    }
    return r === rank;
  });
  return atRank.length > 1;
}

// ─── Helpers ───────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
