// ===============================
// STEPPER CONFIG
// ===============================
let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const indicator = document.getElementById("current-step");
const warning = document.getElementById("step-warning");

// ===============================
// HELPERS
// ===============================
function hasAllSelections(step) {
  const questionGroups = new Set();

  step.querySelectorAll("input[type='radio']").forEach(input => {
    questionGroups.add(input.name);
  });

  for (const name of questionGroups) {
    if (!step.querySelector(`input[name="${name}"]:checked`)) {
      return false;
    }
  }

  return true;
}

// ===============================
// PAYLOAD BUILDER
// ===============================
function buildRiskPayload() {
  const answers = {
    objective: getSelectedScore("objective"),
    horizon: getSelectedScore("horizon"),
    portfolio: getSelectedScore("portfolio"),
    risklevel: getSelectedScore("risklevel"),
    recovery: getSelectedScore("recovery"),
    incomeStability: getSelectedScore("incomeStability"),
    emergency: getSelectedScore("emergency")
  };

  const totalRiskScore =
    answers.objective +
    answers.horizon +
    answers.portfolio +
    answers.risklevel +
    answers.recovery +
    answers.incomeStability +
    answers.emergency;

  return {
    formId: "risk-tolerance-assessment",
    meta: {
      clientName: document.getElementById("client-name").value.trim(),
      submissionDate: document.getElementById("submission-date").value
    },
    answers,
    totalRiskScore
  };
}

// ===============================
// STEP DISPLAY
// ===============================
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  indicator.textContent = `Step ${index + 1} of ${steps.length}`;

  // Prev button
  prevBtn.style.display = index === 0 ? "none" : "inline-block";

  // Next button
  nextBtn.style.display = index === steps.length - 1 ? "none" : "inline-block";

  // Hide warning on step change
  warning.style.display = "none";

  // When entering Confirmation step → update summary
  if (index === steps.length - 1) {
    updateRiskSummary();
  }
}

// ===============================
// NAVIGATION
// ===============================
nextBtn.addEventListener("click", () => {
  const currentSection = steps[currentStep];

  // Validate only on Step 1
  if (currentStep === 0 && !hasAllSelections(currentSection)) {
    warning.style.display = "block";
    return;
  }

  currentStep++;
  showStep(currentStep);
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

// ===============================
// DATE AUTO FILL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("submission-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  showStep(0);
});

// ===============================
// RISK SCORE LOGIC
// ===============================
function getSelectedScore(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? parseInt(selected.value, 10) : 0;
}

function updateRiskSummary() {
  const scores = {
    objective: getSelectedScore("objective"),
    horizon: getSelectedScore("horizon"),
    portfolio: getSelectedScore("portfolio"),
    risklevel: getSelectedScore("risklevel"),
    recovery: getSelectedScore("recovery"),
    income: getSelectedScore("incomeStability"),
    emergency: getSelectedScore("emergency")
  };

  document.getElementById("score-objective").textContent = scores.objective;
  document.getElementById("score-horizon").textContent = scores.horizon;
  document.getElementById("score-portfolio").textContent = scores.portfolio;
  document.getElementById("score-risklevel").textContent = scores.risklevel;
  document.getElementById("score-recovery").textContent = scores.recovery;
  document.getElementById("score-income").textContent = scores.income;
  document.getElementById("score-emergency").textContent = scores.emergency;

  const totalScore =
    scores.objective +
    scores.horizon +
    scores.portfolio +
    scores.risklevel +
    scores.recovery +
    scores.income +
    scores.emergency;

  document.getElementById("total-risk-score").textContent = totalScore;
}

// ===============================
// SUBMIT HANDLER
// ===============================
document.querySelector(".submit-btn").addEventListener("click", e => {
  e.preventDefault();

  const payload = buildRiskPayload();

  console.log("RISK TOLERANCE SUBMIT PAYLOAD:", payload);

  // NEXT STEP (nanti):
  // fetch(apiEndpoint, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload)
  // });
});