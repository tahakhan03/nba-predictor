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
    0: {
      0: { winner: null, games: null },  // 1 DET vs 8 ORL
      1: { winner: null, games: null },  // 4 CLE vs 5 TOR
      2: { winner: null, games: null },  // 3 NYK vs 6 ATL
      3: { winner: null, games: null },  // 2 BOS vs 7 PHI
    },
    1: {
      0: { winner: null, games: null },  // Winner (DET/ORL) vs Winner (CLE/TOR)
      1: { winner: null, games: null },  // Winner (NYK/ATL) vs Winner (BOS/PHI)
    },
    2: {
      0: { winner: null, games: null },  // East Conference Finals
    },
  },
  west: {
    0: {
      0: { winner: null, games: null },  // 1 OKC vs 8 PHX
      1: { winner: null, games: null },  // 4 LAL vs 5 HOU
      2: { winner: null, games: null },  // 3 DEN vs 6 MIN
      3: { winner: null, games: null },  // 2 SAS vs 7 POR
    },
    1: {
      0: { winner: null, games: null },  // Winner (OKC/PHX) vs Winner (LAL/HOU)
      1: { winner: null, games: null },  // Winner (DEN/MIN) vs Winner (SAS/POR)
    },
    2: {
      0: { winner: null, games: null },  // West Conference Finals
    },
  },
  finals: {
    winner: null,
    games:  null,
  },
};