// ─────────────────────────────────────────────────────────────────────────────
// results.js  —  UPDATE THIS FILE AS THE PLAYOFFS PROGRESS
//
// HOW TO UPDATE:
//   1. Open this file in VS Code
//   2. Find the series that just finished
//   3. Set winner: to the team abbreviation that won
//   4. Set games: to how many games the LOSER won (e.g. if final score is 4-2,
//      the loser won 2 games, so games: 2)
//   5. Save the file
//   6. In terminal: git add . → git commit -m "update results" → git push
//   Vercel redeploys in ~30 seconds and scores update for everyone.
//
// LEAVE winner: null and games: null for series that haven't finished yet.
// ─────────────────────────────────────────────────────────────────────────────

const RESULTS = {
  east: {
    // Round 0 = First Round
    0: {
      0: { winner: null, games: null },  // 1 DET vs 8 ORL
      1: { winner: null, games: null },  // 4 CLE vs 5 TOR
      2: { winner: null, games: null },  // 3 NYK vs 6 ATL
      3: { winner: null, games: null },  // 2 BOS vs 7 PHI
    },
    // Round 1 = Conf. Semifinals
    1: {
      0: { winner: null, games: null },  // Winner of (DET/ORL) vs Winner of (CLE/TOR)
      1: { winner: null, games: null },  // Winner of (NYK/ATL) vs Winner of (BOS/PHI)
    },
    // Round 2 = Conf. Finals
    2: {
      0: { winner: null, games: null },  // East Conference Finals
    },
  },
  west: {
    // Round 0 = First Round
    0: {
      0: { winner: null, games: null },  // 1 OKC vs 8 LAC
      1: { winner: null, games: null },  // 4 HOU vs 5 DEN
      2: { winner: null, games: null },  // 3 LAL vs 6 MIN
      3: { winner: null, games: null },  // 2 SAS vs 7 PHX
    },
    // Round 1 = Conf. Semifinals
    1: {
      0: { winner: null, games: null },  // Winner of (OKC/LAC) vs Winner of (HOU/DEN)
      1: { winner: null, games: null },  // Winner of (LAL/MIN) vs Winner of (SAS/PHX)
    },
    // Round 2 = Conf. Finals
    2: {
      0: { winner: null, games: null },  // West Conference Finals
    },
  },
  // NBA Finals
  finals: {
    winner: null,   // e.g. 'OKC'
    games:  null,   // games the LOSER won, e.g. 2 means the series was 4-2
  },
};

// ─── EXAMPLE of a completed series ───────────────────────────────────────────
// If OKC beat LAC 4-1 in the first round:
//   east.0[0] stays null (that's a different series)
//   west.0[0] = { winner: 'OKC', games: 1 }
//
// If BOS beat PHI 4-3 in the first round:
//   east.0[3] = { winner: 'BOS', games: 3 }
// ─────────────────────────────────────────────────────────────────────────────
