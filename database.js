
const STORAGE_KEY = "FIFA3X3AI_MATCHES";

function getMatches() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch (error) {
    return [];
  }
}

function saveMatchData(match) {
  const matches = getMatches();

  const newMatch = {
    id: Date.now(),
    team1: match.team1,
    team2: match.team2,
    goals1: Number(match.goals1),
    goals2: Number(match.goals2),
    source: match.source || "manual",
    date: new Date().toISOString()
  };

  matches.push(newMatch);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(matches)
  );

  updateDashboard();
  return newMatch;
}

function updateDashboard() {
  const matches = getMatches();

  const total = document.getElementById("totalMatches");
  const history = document.getElementById("history");

  if (total) {
    total.textContent = matches.length;
  }

  if (history) {
    if (matches.length === 0) {
      history.textContent = "Aucun match enregistré.";
    } else {
      history.innerHTML = matches
        .slice(-10)
        .reverse()
        .map(match => `
          <p>
            <strong>${escapeHTML(match.team1)}</strong>
            ${match.goals1} - ${match.goals2}
            <strong>${escapeHTML(match.team2)}</strong>
          </p>
        `).join("");
    }
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.addEventListener("DOMContentLoaded", updateDashboard);
