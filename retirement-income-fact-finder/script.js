/* ===============================
   CONFIG
================================= */
const formId = "retirement-income-fact-finder";

/* ===============================
   HELPERS
================================= */
const num = v => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

const additionalSection = document.querySelector(".additional-section");

const byAdditional = name =>
  additionalSection?.querySelector(`[name="${name}"]`)?.value || "";

const byName = name =>
  document.querySelector(`[name="${name}"]`)?.value || "";


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
  steps.forEach((step, i) =>
    step.classList.toggle("active", i === index)
  );

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
  if (currentStep > 0) currentStep--;
  showStep(currentStep);
});

/* ===============================
   TOTAL CALCULATIONS
================================= */
function calcIncomeTotals() {
  const totals = {
    client: 0,
    spouse: 0,
    joint: 0,
  };

  document
    .querySelectorAll(".monthly-income input[type='number']")
    .forEach(i => {
      const v = num(i.value);
      if (i.name.endsWith("Client")) totals.client += v;
      if (i.name.endsWith("Spouse")) totals.spouse += v;
      if (i.name.endsWith("Joint")) totals.joint += v;
    });

  document.getElementById("income-client-total").textContent =
    "$" + totals.client.toLocaleString("en-US");
  document.getElementById("income-spouse-total").textContent =
    "$" + totals.spouse.toLocaleString("en-US");
  document.getElementById("income-joint-total").textContent =
    "$" + totals.joint.toLocaleString("en-US");

  return totals;
}

function calcAssetTotals() {
  const totals = {
    client: 0,
    spouse: 0,
    joint: 0,
    currentValue: 0
  };

  document
    .querySelectorAll(".assets-section input[type='number']")
    .forEach(i => {
      const v = num(i.value);
      if (i.name.endsWith("Client")) totals.client += v;
      if (i.name.endsWith("Spouse")) totals.spouse += v;
      if (i.name.endsWith("Joint")) totals.joint += v;
      if (i.name.endsWith("CurrentValue")) totals.currentValue += v;
    });

    document.getElementById("assets-client-total").textContent =
    "$" + totals.client.toLocaleString("en-US");
    document.getElementById("assets-spouse-total").textContent =
    "$" + totals.spouse.toLocaleString("en-US");
    document.getElementById("assets-joint-total").textContent =
    "$" + totals.joint.toLocaleString("en-US");
    document.getElementById("assets-currentValue-total").textContent =
    "$" + totals.currentValue.toLocaleString("en-US");

  return totals;
}

function calcAssetRowCurrentValue() {
  document.querySelectorAll(".assets-section tbody tr").forEach(row => {
    const inputs = row.querySelectorAll("input[type='number']");
    if (inputs.length < 4) return;

    const client = num(inputs[0].value);
    const spouse = num(inputs[1].value);
    const joint = num(inputs[2].value);

    const currentValueInput = inputs[3];

    const total = client + spouse + joint;

    currentValueInput.value = total ? total : "";
  });
}
/* ===============================
   PAYLOAD BUILDER (FINAL)
================================= */
function buildPayload() {
  return {
    formId,

    meta: {
      clientName: byName("clientName"),
      spouseName: byName("spouseName"),
      phone: byName("phone"),
      clientDob: byName("clientDob"),
      spouseDob: byName("spouseDob"),
      retirementClient: byName("retirementClient"),
      retirementSpouse: byName("retirementSpouse"),
      submissionDate: document.getElementById("submission-date")?.value || ""
    },

    income: {
      ss62: buildIncomeRow("ss62"),
      ss67: buildIncomeRow("ss67"),
      ss70: buildIncomeRow("ss70"),
      pension: buildIncomeRow("pension"),
      rental: buildIncomeRow("rental"),
      other: buildIncomeRow("other"),
      totals: calcIncomeTotals()
    },

    assets: {
      savings: buildAssetRow("savings"),
      checking: buildAssetRow("checking"),
      cds: buildAssetRow("cds"),
      annuities: buildAssetRow("annuities"),
      brokerage: buildAssetRow("brokerage"),
      crypto: buildAssetRow("cryptocurrency"),
      gold: buildAssetRow("gold"),
      inheritance: buildAssetRow("inheritance"),
      ira: buildAssetRow("ira"),
      rothIra: buildAssetRow("rothIra"),
      k401: buildAssetRow("401k"),
      roth401: buildAssetRow("roth401k"),
      totals: calcAssetTotals()
    },

    additional: {
      desiredIncome: byName("desiredIncome"),
      homeValue: byName("homeValue"),
      totalDebt: byName("totalDebt"),

      largePurchasesYN: byName("largePurchasesYN"),
      longTermCareYN: byName("longTermCareYN"),
      estatePlanningYN: byName("estatePlanningYN"),
      costLivingYN: byName("costLivingYN"),
      downsizingYN: byName("downsizingYN"),
      realEstateYN: byName("realEstateYN"),

      additionalComments: byName("additionalComments")
    }
  };
}

/* ===============================
   ROW BUILDERS
================================= */
function buildIncomeRow(prefix) {
  return {
    client: num(byName(`${prefix}Client`)),
    spouse: num(byName(`${prefix}Spouse`)),
    joint: num(byName(`${prefix}Joint`)),
  };
}

function buildAssetRow(prefix) {
  return {
    client: num(byName(`${prefix}Client`)),
    spouse: num(byName(`${prefix}Spouse`)),
    joint: num(byName(`${prefix}Joint`)),
    currentValue: num(byName(`${prefix}CurrentValue`))
  };
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
  "https://marrafinancialgroup.com/forms/thank-you/";

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

/* ===============================
   SUBMIT HANDLER
================================= */
document.querySelector(".submit-btn")?.addEventListener("click", e => {
  e.preventDefault();

  const payload = buildPayload();
  console.log("INCOME FACT FINDER PAYLOAD:", payload);

  submitForm(payload);
});

/* ===============================
   INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("submission-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  calcAssetRowCurrentValue();
  showStep(0);
});

document.addEventListener("input", e => {
  if (e.target.type === "number") {
    calcAssetRowCurrentValue();
    calcIncomeTotals();
    calcAssetTotals();
  }
});