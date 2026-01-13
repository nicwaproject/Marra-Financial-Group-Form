
// CONFIG
const formId = "retirement-budget";
const apiEndpoint = "";

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

function updateNextButtonState() {
  const currentSection = steps[currentStep];

  // Always enable on Summary & Confirmation
  if (
    currentSection.classList.contains("summary") ||
    currentStep === steps.length - 1
  ) {
    nextBtn.disabled = false;
    return;
  }

  nextBtn.disabled = !hasAnyValueInStep(currentSection);
}

function getNumberValue(input) {
  const val = parseFloat(input.value);
  return isNaN(val) ? 0 : val;
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
    const val = parseFloat(input.value);
    if (!isNaN(val)) sum += val;
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

  const grandTotal = housing + transport + living + health + lifestyle + debt;

  document.getElementById("grand-total").textContent =
    formatCurrency(grandTotal);
}

// ===============================
// PAYLOAD
// ===============================

function buildPayload() {
  const payload = {
    formId,
    meta: {
      clientName: document.getElementById("client-name").value.trim(),
      submissionDate: document.getElementById("submission-date").value
    },
    data: {},
    totals: {}
  };

  const groups = ["housing", "transport", "living", "health", "lifestyle", "debt"];

  groups.forEach(group => {
    const inputs = document.querySelectorAll(`input[data-group="${group}"]`);
    let groupTotal = 0;
    payload.data[group] = {};

    inputs.forEach(input => {
      const key = input.name;
      const value = getNumberValue(input);
      payload.data[group][key] = value;
      groupTotal += value;
    });

    payload.data[group].total = groupTotal;
  });

  payload.totals.monthlyTotal = parseFloat(
    document.getElementById("grand-total").textContent
  );

  return payload;
}

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
});

// ===============================
// STEPPER
// ===============================
let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const currentStepEl = document.getElementById("current-step");

// ===============================
// SHOW STEP
// ===============================
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  // Contextual step indicator
  currentStepEl.textContent = `${stepLabels[index]} · Step ${index + 1} of ${steps.length}`;

  // Back button
  prevBtn.style.display = index === 0 ? "none" : "inline-block";

  // Hide Next button on Confirmation
  if (index === steps.length - 1) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = "Next";
  }
}

// ===============================
// NAVIGATION
// ===============================
nextBtn.addEventListener("click", () => {
  const currentSection = steps[currentStep];
  const warning = document.getElementById("step-warning");

  // Skip validation for Summary
  if (currentSection.classList.contains("summary")) {
    warning.style.display = "none";
    currentStep++;
    showStep(currentStep);
    return;
  }

  // Validation for input steps
  if (!hasAnyValueInStep(currentSection)) {
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
// INIT
// ===============================
showStep(currentStep);
updateNextButtonState();

// ===============================
// SUBMIT HANDLER
// ===============================

document.querySelector(".submit-btn").addEventListener("click", e => {
  e.preventDefault();

  const payload = buildPayload();
  console.log("SUBMIT PAYLOAD:", payload);

  // next step: fetch(apiEndpoint, ...)
});