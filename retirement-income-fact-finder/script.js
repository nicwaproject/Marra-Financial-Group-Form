/* ===============================
   CONFIG
================================= */
const formId = "retirement-income-fact-finder";

/* ===============================
   HELPERS
================================= */
function getNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

function formatCurrency(value) {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/* ===============================
   MONTHLY INCOME TOTALS (STEP 2)
================================= */
function calculateMonthlyIncomeTotals() {
  const section = document.querySelector(".monthly-income");
  if (!section) return;

  const totals = {
    client: 0,
    spouse: 0,
    joint: 0,
    currentValue: 0,
    currentInvestment: 0
  };

  section.querySelectorAll("input[type='number']").forEach(input => {
    const val = getNumber(input.value);

    if (input.name.endsWith("Client")) totals.client += val;
    if (input.name.endsWith("Spouse")) totals.spouse += val;
    if (input.name.endsWith("Joint")) totals.joint += val;
    if (input.name.endsWith("CurrentValue")) totals.currentValue += val;
    if (input.name.endsWith("CurrentInvestment")) totals.currentInvestment += val;
  });

  document.getElementById("income-client-total").textContent = formatCurrency(totals.client);
  document.getElementById("income-spouse-total").textContent = formatCurrency(totals.spouse);
  document.getElementById("income-joint-total").textContent = formatCurrency(totals.joint);
  document.getElementById("income-currentValue-total").textContent = formatCurrency(totals.currentValue);
  document.getElementById("income-currentInvestment-total").textContent = formatCurrency(totals.currentInvestment);
}

/* ===============================
   ASSETS TOTALS (STEP 3)
================================= */
function calculateAssetsTotals() {
  const section = document.querySelector(".assets-section");
  if (!section) return;

  const totals = {
    client: 0,
    spouse: 0,
    joint: 0,
    currentValue: 0
  };

  section.querySelectorAll("input[type='number']").forEach(input => {
    const val = getNumber(input.value);

    if (input.name.endsWith("Client")) totals.client += val;
    if (input.name.endsWith("Spouse")) totals.spouse += val;
    if (input.name.endsWith("Joint")) totals.joint += val;
    if (input.name.endsWith("CurrentValue")) totals.currentValue += val;
  });

  document.getElementById("assets-client-total").textContent = formatCurrency(totals.client);
  document.getElementById("assets-spouse-total").textContent = formatCurrency(totals.spouse);
  document.getElementById("assets-joint-total").textContent = formatCurrency(totals.joint);
  document.getElementById("assets-currentValue-total").textContent = formatCurrency(totals.currentValue);
}

/* ===============================
   STEP NAVIGATION
================================= */
let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const stepIndicator = document.getElementById("current-step");
const warning = document.getElementById("step-warning");

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  stepIndicator.textContent = `Step ${index + 1} of ${steps.length}`;

  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === steps.length - 1 ? "none" : "inline-block";

  warning.style.display = "none";
}

nextBtn.addEventListener("click", () => {
  currentStep++;
  showStep(currentStep);
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

/* ===============================
   PAYLOAD BUILDER
================================= */
function buildPayload() {
  const payload = {
    formId,
    meta: {
      clientName: document.getElementById("client-name")?.value || "",
      submissionDate: document.getElementById("submission-date")?.value || ""
    },
    clientInfo: {},
    monthlyIncome: {},
    assets: {},
    additionalDetails: {}
  };

  /* Client Info */
  document.querySelectorAll("[name]").forEach(input => {
    if (input.closest(".form-grid")) {
      payload.clientInfo[input.name] = input.value;
    }
  });

  /* Monthly Income */
  document.querySelectorAll(".monthly-income input[type='number']").forEach(input => {
    payload.monthlyIncome[input.name] = getNumber(input.value);
  });

  /* Assets */
  document.querySelectorAll(".assets-section input[type='number']").forEach(input => {
    payload.assets[input.name] = getNumber(input.value);
  });

  /* Additional Details */
  document.querySelectorAll("textarea").forEach(input => {
    payload.additionalDetails[input.name] = input.value;
  });

  return payload;
}

/* ===============================
   SUBMIT HANDLER
================================= */
document.querySelector(".submit-btn")?.addEventListener("click", e => {
  e.preventDefault();

  const payload = buildPayload();
  console.log("RETIREMENT FACT FINDER PAYLOAD:", payload);

  // next step: fetch(endpoint, { method: "POST", body: JSON.stringify(payload) })
});

/* ===============================
   AUTO INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("submission-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  showStep(0);
  calculateMonthlyIncomeTotals();
  calculateAssetsTotals();
});

/* ===============================
   INPUT LISTENERS
================================= */
document.addEventListener("input", e => {
  if (e.target.type === "number") {
    calculateMonthlyIncomeTotals();
    calculateAssetsTotals();
  }
});