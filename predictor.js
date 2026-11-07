
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  const selected = document.getElementById(tabId);

  if (selected) selected.classList.add("active");
}

function saveMatch() {
  const team1 = document.getElementById("team1").value.trim();
  const team2 = document.getElementById("team2").value.trim();
  const goals1 = document.getElementById("goals1").value;
  const goals2 = document.getElementById("goals2").value;

  if (!team1 || !team2 || team1.toLowerCase() === team2.toLowerCase()) {
    alert("Entre deux équipes différentes.");
    return;
  }

  if (goals1 === "" || goals2 === "" ||
      !Number.isInteger(Number(goals1)) ||
      !Number.isInteger(Number(goals2)) ||
      Number(goals1) < 0 || Number(goals2) < 0) {
    alert("Entre deux scores valides.");
    return;
  }

  saveMatchData({
    team1,
    team2,
    goals1: Number(goals1),
    goals2: Number(goals2),
    source: "manual"
  });

  alert("Résultat enregistré !");
  document.getElementById("team1").value = "";
  document.getElementById("team2").value = "";
  document.getElementById("goals1").value = "";
  document.getElementById("goals2").value = "";
}

function teamStats(name) {
  const matches = getMatches().filter(m =>
    m.team1.toLowerCase() === name.toLowerCase() ||
    m.team2.toLowerCase() === name.toLowerCase()
  ).slice(-20);

  if (!matches.length) {
    return { attack: 4.5, defense: 4.5, count: 0 };
  }

  let scored = 0;
  let conceded = 0;

  matches.forEach(m => {
    if (m.team1.toLowerCase() === name.toLowerCase()) {
      scored += m.goals1;
      conceded += m.goals2;
    } else {
      scored += m.goals2;
      conceded += m.goals1;
    }
  });

  return {
    attack: scored / matches.length,
    defense: conceded / matches.length,
    count: matches.length
  };
}

function poissonProbability(k, lambda) {
  let factorial = 1;

  for (let i = 2; i <= k; i++) factorial *= i;

  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial;
}

function calculatePrediction(team1, team2) {
  const a = teamStats(team1);
  const b = teamStats(team2);

  const lambda1 = Math.max(0.5, Math.min(12,
    (a.attack + b.defense) / 2
  ));

  const lambda2 = Math.max(0.5, Math.min(12,
    (b.attack + a.defense) / 2
  ));

  let home = 0, draw = 0, away = 0;
  let over115 = 0, over125 = 0, over135 = 0;
  let over145 = 0, over155 = 0, over165 = 0, over175 = 0;
  let btts = 0;
  let bestScore = [];

  for (let x = 0; x <= 18; x++) {
    for (let y = 0; y <= 18; y++) {
      const probability =
        poissonProbability(x, lambda1) *
        poissonProbability(y, lambda2);

      if (x > y) home += probability;
      else if (x === y) draw += probability;
      else away += probability;

      if (x + y > 11.5) over115 += probability;
      if (x + y > 12.5) over125 += probability;
      if (x + y > 13.5) over135 += probability;
      if (x + y > 14.5) over145 += probability;
      if (x + y > 15.5) over155 += probability;
      if (x + y > 16.5) over165 += probability;
      if (x + y > 17.5) over175 += probability;

      if (x > 0 && y > 0) btts += probability;

      bestScore.push({ x, y, probability });
    }
  }

  bestScore.sort((a, b) => b.probability - a.probability);

  return {
    home, draw, away, btts,
    over115, over125, over135,
    over145, over155, over165, over175,
    bestScore: bestScore.slice(0, 5),
    lambda1, lambda2,
    sample: a.count + b.count
  };
}

function percent(value) {
  return (value * 100).toFixed(1) + "%";
}

function predictMatch() {
  const team1 = document.getElementById("predictTeam1").value.trim();
  const team2 = document.getElementById("predictTeam2").value.trim();
  const result = document.getElementById("predictionResult");

  if (!team1 || !team2 ||
      team1.toLowerCase() === team2.toLowerCase()) {
    alert("Entre deux équipes différentes.");
    return;
  }

  const p = calculatePrediction(team1, team2);

  result.innerHTML = `
    <h3>🧠 ANALYSE FIFA 3x3 AI</h3>
    <p><strong>${escapeHTML(team1)}</strong> : ${percent(p.home)}</p>
    <p><strong>Nul</strong> : ${percent(p.draw)}</p>
    <p><strong>${escapeHTML(team2)}</strong> : ${percent(p.away)}</p>
    <hr>
    <h3>PLUS DE BUTS</h3>
    <p>Over 11.5 : ${percent(p.over115)}</p>
    <p>Over 12.5 : ${percent(p.over125)}</p>
    <p>Over 13.5 : ${percent(p.over135)}</p>
    <p>Over 14.5 : ${percent(p.over145)}</p>
    <p>Over 15.5 : ${percent(p.over155)}</p>
    <p>Over 16.5 : ${percent(p.over165)}</p>
    <p>Over 17.5 : ${percent(p.over175)}</p>
    <hr>
    <p>Les deux équipes marquent : ${percent(p.btts)}</p>
    <h3>5 SCORES LES PLUS PROBABLES</h3>
    ${p.bestScore.map(s =>
      `<p>${s.x} - ${s.y} : ${percent(s.probability)}</p>`
    ).join("")}
    <hr>
    <p>Échantillon : ${p.sample} matchs d'équipe</p>
    <p>⚠️ Estimations statistiques, pas des garanties.</p>
  `;
}
