// ─────────────────────────────────────────────────────────────────────────────
// results.js  —  UPDATE THIS FILE AS THE PLAYOFFS PROGRESS
//
// HOW TO UPDATE:
//   1. Open this file in VS Code
//   2. Find the series that just finished
//   3. Set winner: to the team abbreviation that won
//   4. Set games: to how many games the LOSER won (e.g. if final is 4-2,
//      the loser won 2 games, so games: 2)
//   5. Save → git add . → git commit -m "update results" → git push
//
// LEAVE winner: null and games: null for unfinished series.
// ─────────────────────────────────────────────────────────────────────────────

const RESULTS = {
  east: {
    // Round 0 = First Round
    0: {
      0: { winner: 'DET', games: 3 },  // 1 DET def. 8 ORL  4-3
      1: { winner: 'CLE', games: 3 },  // 4 CLE def. 5 TOR  4-3
      2: { winner: 'NYK', games: 2 },  // 3 NYK def. 6 ATL  4-2
      3: { winner: 'PHI', games: 3 },  // 7 PHI def. 2 BOS  4-3
    },
    // Round 1 = Conf. Semifinals
    1: {
      0: { winner: null, games: null },  // DET vs CLE
      1: { winner: null, games: null },  // NYK vs PHI
    },
    // Round 2 = Conf. Finals
    2: {
      0: { winner: null, games: null },
    },
  },
  west: {
    // Round 0 = First Round
    0: {
      0: { winner: 'OKC', games: 0 },  // 1 OKC def. 8 PHX  4-0
      1: { winner: 'LAL', games: 2 },  // 4 LAL def. 5 HOU  4-2
      2: { winner: 'MIN', games: 2 },  // 6 MIN def. 3 DEN  4-2
      3: { winner: 'SAS', games: 1 },  // 2 SAS def. 7 POR  4-1
    },
    // Round 1 = Conf. Semifinals
    1: {
      0: { winner: null, games: null },  // OKC vs LAL
      1: { winner: null, games: null },  // MIN vs SAS
    },
    // Round 2 = Conf. Finals
    2: {
      0: { winner: null, games: null },
    },
  },
  finals: {
    winner: null,
    games:  null,
  },
};