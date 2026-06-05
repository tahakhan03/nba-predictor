const RESULTS = {
  east: {
    0: {
      0: { winner: 'DET', games: 3 },  // 1 DET def. 8 ORL  4-3
      1: { winner: 'CLE', games: 3 },  // 4 CLE def. 5 TOR  4-3
      2: { winner: 'NYK', games: 2 },  // 3 NYK def. 6 ATL  4-2
      3: { winner: 'PHI', games: 3 },  // 7 PHI def. 2 BOS  4-3
    },
    1: {
      0: { winner: 'CLE', games: 3 },  // CLE def. DET  4-3
      1: { winner: 'NYK', games: 0 },  // NYK def. PHI  4-0
    },
    2: {
      0: { winner: 'NYK', games: 0 },  // NYK def. CLE  4-0  — East Champions
    },
  },
  west: {
    0: {
      0: { winner: 'OKC', games: 0 },  // 1 OKC def. 8 PHX  4-0
      1: { winner: 'LAL', games: 2 },  // 4 LAL def. 5 HOU  4-2
      2: { winner: 'MIN', games: 2 },  // 6 MIN def. 3 DEN  4-2
      3: { winner: 'SAS', games: 1 },  // 2 SAS def. 7 POR  4-1
    },
    1: {
      0: { winner: 'OKC', games: 0 },  // OKC def. LAL  4-0
      1: { winner: 'SAS', games: 2 },  // SAS def. MIN  4-2
    },
    2: {
      0: { winner: 'SAS', games: 3 },  // SAS def. OKC  4-3  — West Champions
    },
  },
  finals: {
    winner: null,
    games:  null,
  },
};