// ===============================
// CONFIG
// ===============================
const formId = "retirement-budget";

const stepLabels = [
  "Housing",
  "Transportation",
  "Daily Living",
  "Health & Insurance",
  "Lifestyle",
  "Debt & Obligations",
  "Summary",
  "Confirmation"
];

// ===============================
// HELPERS
// ===============================
function getNumberValue(input) {
  const val = parseFloat(input.value);
  return isNaN(val) ? 0 : val;
}

function formatCurrency(value) {
  return value.toFixed(2);
}

function hasAnyValueInStep(stepElement) {
  const inputs = stepElement.querySelectorAll("input[type='number']");
  return Array.from(inputs).some(input => {
    const val = parseFloat(input.value);
    return !isNaN(val) && val > 0;
  });
}

// ===============================
// CALCULATION
// ===============================
function calculateGroup(groupName, totalId, summaryId) {
  const inputs = document.querySelectorAll(
    `input[data-group="${groupName}"]`
  );

  let sum = 0;
  inputs.forEach(input => {
    sum += getNumberValue(input);
  });

  document.getElementById(totalId).textContent = formatCurrency(sum);

  if (summaryId) {
    document.getElementById(summaryId).textContent = formatCurrency(sum);
  }

  return sum;
}

function calculateAll() {
  const housing = calculateGroup("housing", "housing-total", "summary-housing");
  const transport = calculateGroup("transport", "transport-total", "summary-transport");
  const living = calculateGroup("living", "living-total", "summary-living");
  const health = calculateGroup("health", "health-total", "summary-health");
  const lifestyle = calculateGroup("lifestyle", "lifestyle-total", "summary-lifestyle");
  const debt = calculateGroup("debt", "debt-total", "summary-debt");

  const grandTotal =
    housing + transport + living + health + lifestyle + debt;

  document.getElementById("grand-total").textContent =
    formatCurrency(grandTotal);
}

// ===============================
// PAYLOAD BUILDER (FINAL)
// ===============================
function buildPayload() {
  const payload = {
    formId,

    meta: {
      clientName: document.getElementById("client-name")?.value.trim() || "",
      submissionDate: document.getElementById("submission-date")?.value || ""
    },

    data: {},   // ⬅️ HARUS data (bukan budget)
    summary: {
      housing: 0,
      transport: 0,
      living: 0,
      health: 0,
      lifestyle: 0,
      debt: 0,
      grandTotal: 0
    }
  };

  const groups = [
    "housing",
    "transport",
    "living",
    "health",
    "lifestyle",
    "debt"
  ];

  groups.forEach(group => {
    const inputs = document.querySelectorAll(
      `input[data-group="${group}"]`
    );

    let total = 0;
    const groupData = {};

    inputs.forEach(input => {
      const value = getNumberValue(input);
      groupData[input.name] = value;
      total += value;
    });

    // ⬇️ SESUAI TEMPLATE SERVER
    groupData.total = total;
    payload.data[group] = groupData;

    payload.summary[group] = total;
    payload.summary.grandTotal += total;
  });

  return payload;
}

// ===============================
// STEPPER
// ===============================
let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const currentStepEl = document.getElementById("current-step");

function updateNextButtonState() {
  const currentSection = steps[currentStep];

  // Always allow Summary & Confirmation
  if (
    currentSection.classList.contains("summary") ||
    currentStep === steps.length - 1
  ) {
    nextBtn.disabled = false;
    return;
  }

  nextBtn.disabled = !hasAnyValueInStep(currentSection);
}

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  currentStepEl.textContent =
    `${stepLabels[index]} · Step ${index + 1} of ${steps.length}`;

  prevBtn.style.display = index === 0 ? "none" : "inline-block";

  if (index === steps.length - 1) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = "Next";
  }

  updateNextButtonState();
}

// ===============================
// NAVIGATION
// ===============================
nextBtn.addEventListener("click", () => {
  const currentSection = steps[currentStep];
  const warning = document.getElementById("step-warning");

  if (
    !currentSection.classList.contains("summary") &&
    !hasAnyValueInStep(currentSection)
  ) {
    warning.style.display = "block";
    return;
  }

  warning.style.display = "none";
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
// INPUT LISTENERS
// ===============================
document.querySelectorAll("input[type='number']").forEach(input => {
  input.addEventListener("input", () => {
    calculateAll();
    updateNextButtonState();

    const warning = document.getElementById("step-warning");
    if (warning) warning.style.display = "none";
  });
});

// ===============================
// DATE AUTO-FILL
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("submission-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  calculateAll();
  showStep(0);
});


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

    alert(
      "✅ Your form was submitted successfully!\n\n" +
      "A PDF copy has been sent to Marra Financial Group."
    );

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

  const payload = buildPayload();
  console.log("RETIREMENT BUDGET PAYLOAD:", payload);

  submitForm(payload);
});