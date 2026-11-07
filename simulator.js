
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function poisson(lambda) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count++;
    product *= Math.random();
  } while (product > limit && count < 30);

  return count - 1;
}

function generateGoals(team, opponent) {
  const attack = team.attack || 80;
  const defense = opponent.defense || 80;

  const expectedGoals = Math.max(
    2,
    Math.min(
      9,
      4.5 + (attack - defense) * 0.075
    )
  );

  return poisson(expectedGoals);
}

function simulateMatch() {
  if (typeof teams === "undefined" || teams.length < 2) {
    alert("Les équipes ne sont pas disponibles.");
    return;
  }

  const index1 = randomNumber(0, teams.length - 1);
  let index2;

  do {
    index2 = randomNumber(0, teams.length - 1);
  } while (index1 === index2);

  const team1 = teams[index1];
  const team2 = teams[index2];

  const goals1 = generateGoals(team1, team2);
  const goals2 = generateGoals(team2, team1);

  const match = {
    team1: team1.name,
    team2: team2.name,
    goals1,
    goals2,
    source: "simulation"
  };

  saveMatchData(match);

  const result = document.getElementById("simulationResult");

  result.innerHTML = `
    <h3>⚽ MATCH TERMINÉ</h3>
    <h2>${escapeHTML(team1.name)}
    ${goals1} - ${goals2}
    ${escapeHTML(team2.name)}</h2>
    <p>Résultat généré par FIFA 3x3 AI.</p>
  `;
}
