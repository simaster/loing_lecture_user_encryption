const tableBody = document.getElementById("dataTable");
const searchInput = document.getElementById("searchInput");
const simulateBtn = document.getElementById("simulateBtn");
const predictionForm = document.getElementById("predictionForm");
const resetFormBtn = document.getElementById("resetFormBtn");
const predictionResult = document.getElementById("predictionResult");
const summaryBoard = document.getElementById("summaryBoard");
const summaryBoardBtn = document.getElementById("summaryBoardBtn");
const boardCloseBtn = document.getElementById("boardCloseBtn");
const boardFullscreenBtn = document.getElementById("boardFullscreenBtn");

let currentData = [...simulationData];
let lastPredictedLot = "-";

function getBadgeClass(status) {
  if (status === "위험") return "danger";
  if (status === "주의") return "warning";
  return "normal";
}

function renderTable(data) {
  tableBody.innerHTML = data.map(item => `
    <tr data-lot="${item.lot}">
      <td><b>${item.lot}</b></td>
      <td>${item.agingTemp}</td>
      <td>${item.agingHumidity}</td>
      <td>${item.deviation}</td>
      <td>${item.moldingTemp}</td>
      <td>${item.moldingPressure}</td>
      <td>${item.openCloseTime}</td>
      <td>${item.diameter.toFixed(3)}</td>
      <td>${item.visual}</td>
      <td><b>${item.defectRate}%</b></td>
      <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
    </tr>
  `).join("");
}

function renderSummary(data) {
  const normal = data.filter(d => d.status === "정상").length;
  const warning = data.filter(d => d.status === "주의").length;
  const danger = data.filter(d => d.status === "위험").length;
  const yieldRate = data.length ? ((normal / data.length) * 100).toFixed(1) : "0.0";

  document.getElementById("totalLots").textContent = data.length;
  document.getElementById("normalCount").textContent = normal;
  document.getElementById("warningCount").textContent = warning;
  document.getElementById("dangerCount").textContent = danger;
  document.getElementById("yieldRate").textContent = yieldRate + "%";
  document.getElementById("lineStatus").textContent = danger > 0 ? "집중 관리" : warning > 0 ? "주의 관찰" : "정상 가동";
  document.getElementById("lastPrediction").textContent = lastPredictedLot;

  document.getElementById("avgAgingTemp").textContent = avg(data, "agingTemp") + " ℃";
  document.getElementById("avgAgingHumidity").textContent = avg(data, "agingHumidity") + " %";
  document.getElementById("avgMoldingPressure").textContent = avg(data, "moldingPressure") + " bar";
  document.getElementById("avgDiameter").textContent = avg(data, "diameter", 3) + " mm";
}

function renderAlerts(data) {
  const alerts = data
    .filter(d => d.status !== "정상")
    .sort((a, b) => b.defectRate - a.defectRate)
    .slice(0, 8);

  document.getElementById("alertList").innerHTML = alerts.map(item => `
    <div class="alert-item ${getBadgeClass(item.status)}">
      <b>${item.lot} · ${item.status} · 불량 확률 ${item.defectRate}%</b>
      <span>주요 원인 후보: 온습도 편차 ${item.deviation}, 성형 압력 ${item.moldingPressure}bar, 외경 ${item.diameter.toFixed(3)}mm, 검사 ${item.visual}</span>
    </div>
  `).join("");
}

function avg(data, key, digit = 1) {
  if (!data.length) return (0).toFixed(digit);
  const sum = data.reduce((acc, cur) => acc + Number(cur[key]), 0);
  return (sum / data.length).toFixed(digit);
}

function updateDashboard(tableData = currentData, monitorData = currentData) {
  renderTable(tableData);
  renderSummary(monitorData);
  renderAlerts(monitorData);
  renderSummaryBoard(monitorData);
}

function populateLotOptions() {
  const lotInput = document.getElementById("lotInput");
  lotInput.innerHTML = currentData.map(item => `
    <option value="${item.lot}">${item.lot}</option>
  `).join("");
}

function recalculateRisk() {
  currentData = currentData.map(item => {
    const randomNoise = Math.floor(Math.random() * 11) - 5;
    let score = item.defectRate + randomNoise;
    score = Math.max(1, Math.min(99, score));

    let status = "정상";
    if (score >= 60) status = "위험";
    else if (score >= 30) status = "주의";

    return { ...item, defectRate: score, status };
  });
  updateDashboard(currentData);
}

function getBoardProcessRows(data) {
  const processRules = [
    {
      name: "숙성실",
      risk: item => item.deviation >= 4 || item.agingHumidity >= 65 || item.agingTemp >= 26
    },
    {
      name: "성형",
      risk: item => item.moldingPressure >= 126 || item.moldingTemp >= 155 || item.openCloseTime >= 3.7
    },
    {
      name: "스웨징",
      risk: item => Math.abs(item.diameter - 10.002) >= 0.014
    },
    {
      name: "전수검사",
      risk: item => item.visual !== "정상"
    }
  ];

  return processRules.map(rule => {
    const processRiskLots = data.filter(rule.risk);
    const processRiskRate = data.length ? (processRiskLots.length / data.length) * 100 : 0;
    const avgRisk = processRiskLots.length
      ? processRiskLots.reduce((sum, item) => sum + item.defectRate, 0) / processRiskLots.length
      : data.reduce((sum, item) => sum + item.defectRate, 0) / data.length;

    return {
      name: rule.name,
      total: data.length,
      normal: data.length - processRiskLots.length,
      warning: processRiskLots.filter(item => item.status === "주의").length,
      danger: processRiskLots.filter(item => item.status === "위험").length,
      rate: processRiskRate,
      avgRisk
    };
  });
}

function renderSummaryBoard(data) {
  if (!data.length) return;

  const normal = data.filter(item => item.status === "정상").length;
  const danger = data.filter(item => item.status === "위험").length;
  const avgDefect = data.reduce((sum, item) => sum + item.defectRate, 0) / data.length;
  const yieldRate = (normal / data.length) * 100;
  const riskRate = (danger / data.length) * 100;
  const qualityScore = Math.max(0, Math.min(5, (yieldRate / 100) * 5));
  const processRows = getBoardProcessRows(data);
  const topLots = [...data].sort((a, b) => b.defectRate - a.defectRate).slice(0, 7);

  document.getElementById("boardTotalLots").textContent = data.length;
  document.getElementById("boardAvgDefect").textContent = avgDefect.toFixed(1) + "%";
  document.getElementById("boardYieldRate").textContent = yieldRate.toFixed(1) + "%";
  document.getElementById("boardRiskRate").textContent = riskRate.toFixed(1) + "%";
  document.getElementById("boardQualityScore").textContent = qualityScore.toFixed(1);
  document.getElementById("boardGaugeFill").style.setProperty("--score", `${(qualityScore / 5) * 0.5}turn`);
  document.getElementById("boardNormalLimitBar").style.width = yieldRate.toFixed(1) + "%";
  document.getElementById("boardNormalLimitText").textContent = yieldRate.toFixed(1) + "%";
  document.getElementById("boardDangerLimitBar").style.width = riskRate.toFixed(1) + "%";
  document.getElementById("boardDangerLimitText").textContent = riskRate.toFixed(1) + "%";
  document.getElementById("boardAlertText").textContent = `${topLots[0].lot} 품질 발생률이 증가 했습니다. AI 불량 확률 ${topLots[0].defectRate}% 기준으로 공정 조건 확인이 필요합니다.`;

  document.getElementById("boardProcessTable").innerHTML = processRows.map(row => `
    <tr>
      <td><b>${row.name}</b></td>
      <td>${row.total}</td>
      <td>${row.normal}</td>
      <td>${row.warning}</td>
      <td>${row.danger}</td>
      <td>${row.avgRisk.toFixed(1)}%</td>
      <td><span class="mini-trend"></span></td>
    </tr>
  `).join("");

  document.getElementById("boardProcessChart").innerHTML = processRows.map((row, index) => `
    <div class="bar-item">
      <span>${row.rate.toFixed(1)}%</span>
      <b class="${index === 1 ? "blue-bar" : ""}" style="height:${Math.max(16, row.rate * 2.2)}px"></b>
      <em>${row.name}</em>
    </div>
  `).join("");

  document.getElementById("boardTopLots").innerHTML = topLots.map(item => `
    <div class="lot-bar">
      <span>${item.lot}</span>
      <div><b style="width:${item.defectRate}%"></b></div>
      <strong>${item.defectRate}%</strong>
    </div>
  `).join("");
}

function openSummaryBoard() {
  renderSummaryBoard(currentData);
  summaryBoard.classList.add("open");
  summaryBoard.setAttribute("aria-hidden", "false");
  document.body.classList.add("board-open");
}

function closeSummaryBoard() {
  summaryBoard.classList.remove("open");
  summaryBoard.setAttribute("aria-hidden", "true");
  document.body.classList.remove("board-open");
  if (document.fullscreenElement) document.exitFullscreen();
}

function toggleBoardFullscreen() {
  if (!document.fullscreenElement) {
    summaryBoard.requestFullscreen();
    return;
  }
  document.exitFullscreen();
}

function calculateDefectRate(item) {
  const tempGap = Math.abs(item.agingTemp - 24) * 3;
  const humidityGap = Math.abs(item.agingHumidity - 60) * 1.5;
  const moldingTempGap = Math.abs(item.moldingTemp - 152) * 2;
  const pressureGap = Math.abs(item.moldingPressure - 121) * 2.4;
  const cycleGap = Math.abs(item.openCloseTime - 3.3) * 14;
  const diameterGap = Math.abs(item.diameter - 10.002) * 1200;
  const deviationScore = item.deviation * 7;
  const visualScore = {
    "정상": 0,
    "미세흠": 18,
    "기포": 28,
    "치수불량": 34
  }[item.visual] || 0;

  return Math.max(1, Math.min(99, Math.round(
    8 + tempGap + humidityGap + moldingTempGap + pressureGap + cycleGap + diameterGap + deviationScore + visualScore
  )));
}

function getStatusByRate(rate) {
  if (rate >= 60) return "위험";
  if (rate >= 30) return "주의";
  return "정상";
}

function getRecommendedAction(item) {
  if (item.status === "위험") return "생산 조건 재점검 및 해당 LOT 격리 검사";
  if (item.status === "주의") return "숙성 온습도와 성형 압력 추이 확인";
  return "정상 생산 유지";
}

function readPredictionForm() {
  return {
    lot: document.getElementById("lotInput").value.trim(),
    agingTemp: Number(document.getElementById("agingTempInput").value),
    agingHumidity: Number(document.getElementById("agingHumidityInput").value),
    deviation: Number(document.getElementById("deviationInput").value),
    moldingTemp: Number(document.getElementById("moldingTempInput").value),
    moldingPressure: Number(document.getElementById("moldingPressureInput").value),
    openCloseTime: Number(document.getElementById("openCloseTimeInput").value),
    diameter: Number(document.getElementById("diameterInput").value),
    visual: document.getElementById("visualInput").value
  };
}

function writePredictionForm(item) {
  document.getElementById("lotInput").value = item.lot;
  document.getElementById("agingTempInput").value = item.agingTemp;
  document.getElementById("agingHumidityInput").value = item.agingHumidity;
  document.getElementById("deviationInput").value = item.deviation;
  document.getElementById("moldingTempInput").value = item.moldingTemp;
  document.getElementById("moldingPressureInput").value = item.moldingPressure;
  document.getElementById("openCloseTimeInput").value = item.openCloseTime;
  document.getElementById("diameterInput").value = item.diameter.toFixed(3);
  document.getElementById("visualInput").value = item.visual;
}

function loadSelectedLot(lot) {
  const selectedLot = currentData.find(item => item.lot === lot);
  if (!selectedLot) return;
  writePredictionForm(selectedLot);
}

function renderPredictionResult(item) {
  predictionResult.className = `prediction-result ${getBadgeClass(item.status)}`;
  predictionResult.innerHTML = `
    <span>${item.status}</span>
    <strong>${item.lot} · AI 불량 확률 ${item.defectRate}%</strong>
    <p>온습도 편차 ${item.deviation}, 성형 압력 ${item.moldingPressure}bar, 외경 ${item.diameter.toFixed(3)}mm 기준으로 판정되었습니다.</p>
  `;
  document.getElementById("recommendedAction").textContent = getRecommendedAction(item);
}

function applyPrediction(event) {
  event.preventDefault();
  const formItem = readPredictionForm();
  const existingIndex = currentData.findIndex(item => item.lot === formItem.lot);
  if (existingIndex < 0) return;

  const defectRate = calculateDefectRate(formItem);
  const status = getStatusByRate(defectRate);
  const predictedItem = { ...formItem, defectRate, status };

  currentData[existingIndex] = predictedItem;

  lastPredictedLot = predictedItem.lot;
  searchInput.value = "";
  renderPredictionResult(predictedItem);
  updateDashboard(currentData);
}

function resetPredictionForm() {
  const firstLot = currentData[0];
  if (firstLot) loadSelectedLot(firstLot.lot);
}

function selectLotFromTable(lot) {
  loadSelectedLot(lot);
  predictionForm.requestSubmit();
}

searchInput.addEventListener("input", event => {
  const keyword = event.target.value.trim().toLowerCase();
  const filtered = currentData.filter(item =>
    item.lot.toLowerCase().includes(keyword) ||
    item.status.toLowerCase().includes(keyword) ||
    item.visual.toLowerCase().includes(keyword)
  );
  updateDashboard(filtered, currentData);
});

simulateBtn.addEventListener("click", recalculateRisk);
predictionForm.addEventListener("submit", applyPrediction);
resetFormBtn.addEventListener("click", resetPredictionForm);
summaryBoardBtn.addEventListener("click", openSummaryBoard);
boardCloseBtn.addEventListener("click", closeSummaryBoard);
boardFullscreenBtn.addEventListener("click", toggleBoardFullscreen);
document.getElementById("lotInput").addEventListener("change", event => loadSelectedLot(event.target.value));
tableBody.addEventListener("click", event => {
  const row = event.target.closest("tr[data-lot]");
  if (row) selectLotFromTable(row.dataset.lot);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && summaryBoard.classList.contains("open")) closeSummaryBoard();
});

populateLotOptions();
resetPredictionForm();
updateDashboard();
