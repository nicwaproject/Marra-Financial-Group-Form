let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const indicator = document.getElementById("current-step");

function hasSelection(step) {
  return step.querySelector("input:checked, input[type='range']");
}

function showStep(index) {
  steps.forEach((s, i) => s.classList.toggle("active", i === index));
  indicator.textContent = `Step ${index + 1} of ${steps.length}`;

  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === steps.length - 1 ? "none" : "inline-block";
}

nextBtn.onclick = () => {
  const step = steps[currentStep];
  if (!hasSelection(step)) {
    document.getElementById("step-warning").style.display = "block";
    return;
  }

  document.getElementById("step-warning").style.display = "none";
  currentStep++;
  showStep(currentStep);
};

prevBtn.onclick = () => {
  currentStep--;
  showStep(currentStep);
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submission-date").value =
    new Date().toISOString().split("T")[0];

  showStep(0);
});