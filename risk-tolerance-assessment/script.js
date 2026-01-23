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
// SELECTION MAP (SOURCE OF TRUTH)
// ===============================
const MAP = {
  objective: {
    12: "accumulation",
    6: "maintenance",
    1: "distribution"
  },
  horizon: {
    0: "0-3",
    3: "3-5",
    6: "6-10",
    9: "11-15",
    12: "15+"
  },
  portfolio: {
    12: "A",
    9: "B",
    6: "C",
    3: "D",
    0: "E"
  },
  recovery: {
    0: "lt-18mo",
    4: "18-24mo",
    8: "2-3yr",
    12: "3-5yr",
    16: "5+yr"
  },
  incomeStability: {
    12: "very-stable",
    9: "mostly-stable",
    6: "stable",
    3: "somewhat-stable",
    0: "not-stable"
  },
  emergency: {
    12: "very-able",
    9: "mostly-able",
    6: "able",
    3: "somewhat-able",
    0: "not-able"
  }
};

// ===============================
// HELPERS
// ===============================
function getSelectedScore(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? Number(el.value) : 0;
}

function hasAllSelections(step) {
  const groups = new Set();
  step.querySelectorAll("input[type='radio']").forEach(i => groups.add(i.name));

  for (const name of groups) {
    if (!step.querySelector(`input[name="${name}"]:checked`)) {
      return false;
    }
  }
  return true;
}

// ===============================
// SIGNATURE PREVIEW
// ===============================
const nameInput = document.getElementById("client-name");

nameInput.addEventListener("blur", () => {
  if (nameInput.value.trim()) nameInput.classList.add("is-signed");
});

nameInput.addEventListener("focus", () => {
  nameInput.classList.remove("is-signed");
});

// ===============================
// PAYLOAD BUILDER (FINAL)
// ===============================
function buildRiskPayload() {
  function buildSection(name) {
    const score = getSelectedScore(name);
    return {
      selected: MAP[name]?.[score] ?? null,
      score
    };
  }

  const sections = {
    objective: buildSection("objective"),
    horizon: buildSection("horizon"),
    portfolio: buildSection("portfolio"),
    risklevel: {
      selected: getSelectedScore("risklevel"),
      score: getSelectedScore("risklevel")
    },
    recovery: buildSection("recovery"),
    incomeStability: buildSection("incomeStability"),
    emergency: buildSection("emergency")
  };

  const totalRiskScore = Object.values(sections)
    .reduce((sum, s) => sum + (s.score || 0), 0);

  return {
    formId: "risk-tolerance-assessment",

    meta: {
      clientName: document.getElementById("client-name").value.trim(),
      submissionDate: document.getElementById("submission-date").value
    },

    sections,
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
  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === steps.length - 1 ? "none" : "inline-block";
  warning.style.display = "none";

  if (index === steps.length - 1) {
    updateRiskSummary();
  }
}

// ===============================
// NAVIGATION
// ===============================
nextBtn.addEventListener("click", () => {
  const currentSection = steps[currentStep];

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
// RISK SUMMARY UI
// ===============================
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

  document.getElementById("total-risk-score").textContent =
    Object.values(scores).reduce((a, b) => a + b, 0);
}

// ===============================
// API CONFIG
// ===============================
const API_URL = "https://api-marra-financial-group-form.vercel.app/api/submit";

// ===============================
// UNIVERSAL SUBMIT
// ===============================
async function submitForm(payload) {
  try {
    console.log("Submitting payload:", payload);

    // Optional: disable button
    const btn = document.querySelector(".submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting...";
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API error:", data);
      alert("❌ Submission failed. Please try again.");
      return;
    }

    console.log("API success:", data);

    window.location.href =
  "https://nicwaproject.github.io/Marra-Financial-Group-Form/thank-you/";

    // Optional: redirect / reset
    // window.location.href = "/thank-you.html";
    // document.querySelector("form")?.reset();

  } catch (err) {
    console.error("Submit error:", err);
    alert("❌ Network error. Please check your connection and try again.");
  } finally {
    const btn = document.querySelector(".submit-btn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Submit";
    }
  }
}

// ===============================
// SUBMIT HANDLER
// ===============================
document.querySelector(".submit-btn").addEventListener("click", e => {
  e.preventDefault();

  const payload = buildRiskPayload();
  console.log("RISK TOLERANCE SUBMIT PAYLOAD:", payload);

  submitForm(payload);
});