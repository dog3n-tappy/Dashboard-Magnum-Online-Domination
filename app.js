const GOAL_USERS = 60000;
const usersChartEl = document.getElementById("usersChart");
const channelsChartEl = document.getElementById("channelsChart");
const channelsTrendChartEl = document.getElementById("channelsTrendChart");
const goalGaugeChartEl = document.getElementById("goalGaugeChart");
const channelsTable = document.getElementById("channelsTable");
const sourcesTable = document.getElementById("sourcesTable");
const pagesTable = document.getElementById("pagesTable");
const problemPagesTable = document.getElementById("problemPagesTable");

const kpiUsers = document.getElementById("kpiUsers");
const kpiSessions = document.getElementById("kpiSessions");
const kpiSessionsPerUser = document.getElementById("kpiSessionsPerUser");
const kpiNewUsers = document.getElementById("kpiNewUsers");
const kpiNewUsersShare = document.getElementById("kpiNewUsersShare");
const kpiEngaged = document.getElementById("kpiEngaged");
const kpiEngRate = document.getElementById("kpiEngRate");
const kpiAvgTime = document.getElementById("kpiAvgTime");
const kpiGoalProgress = document.getElementById("kpiGoalProgress");
const kpiGoalBar = document.getElementById("kpiGoalBar");
const kpiGoalForecast = document.getElementById("kpiGoalForecast");
const insightSummary = document.getElementById("insightSummary");
const insightActions = document.getElementById("insightActions");
const dataStatus = document.getElementById("dataStatus");
const dataStatusValue = document.getElementById("dataStatusValue");


const rangeSelect = document.getElementById("rangeSelect");
const channelSelect = document.getElementById("channelSelect");
const refreshBtn = document.getElementById("refreshBtn");
const languageSelect = document.getElementById("languageSelect");

let usersChart;
let channelsChart;
let channelsTrendChart;
let goalGaugeChart;

const translations = {
  ru: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Трафик и эффективность сайта",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    periodLabel: "Период",
    period30: "Последние 30 дней",
    period90: "Последние 90 дней",
    period365: "Последние 12 месяцев",
    channelLabel: "Канал",
    channelAll: "Все каналы",
    channelOrganic: "Органика",
    channelPaid: "Платный",
    channelSocial: "Соцсети",
    channelDirect: "Прямой",
    channelReferral: "Рефералы",
    languageLabel: "Язык",
    refreshBtn: "Обновить",
    dataStatusLabel: "Источник данных:",
    kpiUsersLabel: "Уникальные пользователи",
    kpiUsersNote: "Цель: 60 000 / мес",
    kpiSessionsLabel: "Сессии",
    kpiSessionsNote: "Отношение:",
    kpiNewUsersLabel: "Новые пользователи",
    kpiNewUsersNote: "Доля:",
    kpiEngagedLabel: "Вовлеченные сессии",
    kpiEngagedNote: "Коэффициент вовлеченности:",
    kpiAvgTimeLabel: "Среднее время",
    kpiAvgTimeNote: "на пользователя",
    kpiGoalLabel: "Прогресс к цели",
    usersTrendTitle: "Динамика пользователей",
    channelsShareTitle: "Доля каналов",
    channelsTrendTitle: "Динамика по каналам",
    channelsTableTitle: "Каналы",
    goalGaugeTitle: "Прогресс к цели",
    topSourcesTitle: "Топ источники",
    topPagesTitle: "Топ страницы",
    problemPagesTitle: "Проблемные страницы",
    growthControlTitle: "Контроль роста до 60k",
    goalDailyRateLabel: "Текущий темп (в день)",
    goalRequiredRateLabel: "Нужный темп (в день)",
    goalDeltaLabel: "Отклонение",
    goalForecastLabel: "Прогноз на месяц",
    insightTitle: "Выявленные закономерности и инсайты",
    insightActionsTitle: "Стратегические рекомендации",
    noteText:
      "Сейчас дашборд работает на демонстрационных данных. Для реальных " +
      "данных GA4 запустите локальный сервер <code>server.js</code> и " +
      "заполните <code>GA4.env</code> (переменные " +
      "<code>GA4_PROPERTY_ID</code> и " +
      "<code>GOOGLE_APPLICATION_CREDENTIALS</code>). После этого " +
      "дашборд будет получать данные из эндпоинта " +
      "<code>/api/ga4</code> автоматически.",
    usersLabel: "Пользователи",
    dayLabel: "День",
    sourcesHeader: "Источник / Канал",
    pagesHeader: "Страница",
    usersHeader: "Пользователи",
    engagementHeader: "Вовлеченность",
    engagedHeader: "Вовлеченные",
    newUsersHeader: "Новые",
    avgEngagementHeader: "Среднее время вовлеченности",
    engagementRateHeader: "Коэффициент вовлеченности",
    channelHeader: "Канал",
    remainingLabel: "Осталось",
    forecastLabel: "Прогноз",
    secondsLabel: "сек",
    perDayLabel: " / день",
    perMonthLabel: " / мес",
  },
  en: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Website traffic and performance",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    periodLabel: "Period",
    period30: "Last 30 days",
    period90: "Last 90 days",
    period365: "Last 12 months",
    channelLabel: "Channel",
    channelAll: "All channels",
    channelOrganic: "Organic",
    channelPaid: "Paid",
    channelSocial: "Social",
    channelDirect: "Direct",
    channelReferral: "Referral",
    languageLabel: "Language",
    refreshBtn: "Refresh",
    dataStatusLabel: "Data source:",
    kpiUsersLabel: "Unique users",
    kpiUsersNote: "Goal: 60,000 / month",
    kpiSessionsLabel: "Sessions",
    kpiSessionsNote: "Ratio:",
    kpiNewUsersLabel: "New users",
    kpiNewUsersNote: "Share:",
    kpiEngagedLabel: "Engaged sessions",
    kpiEngagedNote: "Engagement rate:",
    kpiAvgTimeLabel: "Average time",
    kpiAvgTimeNote: "per user",
    kpiGoalLabel: "Goal progress",
    usersTrendTitle: "Users trend",
    channelsShareTitle: "Channel share",
    channelsTrendTitle: "Channel trend",
    channelsTableTitle: "Channels",
    goalGaugeTitle: "Goal progress",
    topSourcesTitle: "Top sources",
    topPagesTitle: "Top pages",
    problemPagesTitle: "Problem pages",
    growthControlTitle: "Growth to 60k",
    goalDailyRateLabel: "Current pace (per day)",
    goalRequiredRateLabel: "Required pace (per day)",
    goalDeltaLabel: "Delta",
    goalForecastLabel: "Monthly forecast",
    insightTitle: "Data Insights & Patterns",
    insightActionsTitle: "Strategic Recommendations",
    noteText:
      "This dashboard currently uses demo data. For real GA4 data, run " +
      "the local <code>server.js</code> and fill in <code>GA4.env</code> " +
      "(<code>GA4_PROPERTY_ID</code> and " +
      "<code>GOOGLE_APPLICATION_CREDENTIALS</code>). After that, " +
      "the dashboard will pull data from <code>/api/ga4</code> automatically.",
    usersLabel: "Users",
    dayLabel: "Day",
    sourcesHeader: "Source / Medium",
    pagesHeader: "Page path",
    usersHeader: "Users",
    engagementHeader: "Engagement",
    engagedHeader: "Engaged",
    newUsersHeader: "New",
    avgEngagementHeader: "Avg engagement",
    engagementRateHeader: "Engagement rate",
    channelHeader: "Channel",
    remainingLabel: "Remaining",
    forecastLabel: "Forecast",
    secondsLabel: "sec",
    perDayLabel: " / day",
    perMonthLabel: " / month",
  },
};

let currentLanguage = localStorage.getItem("dashboardLanguage") || "ru";

const formatNumber = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : null;
  if (safeValue === null) return "—";
  return new Intl.NumberFormat(
    currentLanguage === "ru" ? "ru-RU" : "en-US"
  ).format(Math.round(safeValue));
};
const formatPercent = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : null;
  if (safeValue === null) return "—";
  return `${Math.round(safeValue * 100)}%`;
};

function t(key) {
  return translations[currentLanguage]?.[key] || translations.ru[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title =
    currentLanguage === "ru"
      ? "Magnum Estate — Дашборд трафика"
      : "Magnum Estate — Traffic dashboard";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    el.innerHTML = t(key);
  });
}

function formatChannelName(label) {
  if (currentLanguage === "en") return label;
  return localizeChannelLabel(label);
}

function buildInsightSummary(data) {
  if (!data || !data.totalUsers || !data.dailyUsers) return "—";
  
  // Анализ динамики по дням
  const daily = data.dailyUsers;
  const avg = data.totalUsers / data.days;
  
  // Находим пики и спады
  let maxVal = -1, minVal = Infinity;
  let maxDay = 0, minDay = 0;
  
  daily.forEach((val, i) => {
    if (val > maxVal) { maxVal = val; maxDay = i; }
    if (val < minVal) { minVal = val; minDay = i; }
  });

  const volatility = (maxVal - minVal) / avg;
  
  if (currentLanguage === "ru") {
    let trendText = `Средняя посещаемость — ${formatNumber(avg)} чел./день. `;
    trendText += `Пик активности зафиксирован на ${maxDay + 1}-й день периода (${formatNumber(maxVal)} чел.), `;
    trendText += `а спад — на ${minDay + 1}-й день (${formatNumber(minVal)} чел.). `;
    
    if (volatility > 0.5) {
      trendText += "Наблюдается высокая волатильность трафика, что характерно для активных рекламных кампаний или сезонных всплесков.";
    } else {
      trendText += "Трафик стабилен, без резких колебаний, что указывает на органический рост или постоянную работу каналов.";
    }
    return trendText;
  }

  let trendText = `Average daily traffic is ${formatNumber(avg)} users. `;
  trendText += `Peak activity was on day ${maxDay + 1} (${formatNumber(maxVal)} users), `;
  trendText += `while the lowest was on day ${minDay + 1} (${formatNumber(minVal)} users). `;
  
  if (volatility > 0.5) {
    trendText += "High traffic volatility detected, typical for active ad campaigns or seasonal spikes.";
  } else {
    trendText += "Traffic is stable with no sharp fluctuations, indicating organic growth or consistent channel performance.";
  }
  return trendText;
}

function buildInsightActions(data) {
  const actions = [];
  if (!data || !data.dailyUsers) return actions;

  const daily = data.dailyUsers;
  const days = daily.length;
  
  // Простая логика определения "будни vs выходные" (условно, если данных достаточно)
  // В реальном GA4 мы бы смотрели на названия дней недели, здесь имитируем анализ паттернов
  
  if (currentLanguage === "ru") {
    actions.push(
      "Синхронизация с пиками: рекомендуется планировать запуск рассылок и новых постов за 24 часа до выявленных пиков активности для усиления эффекта."
    );
    actions.push(
      "Анализ провалов: если спады приходятся на выходные, стоит рассмотреть 'поддерживающий' контент или ретаргетинг для выравнивания недельной воронки."
    );
    actions.push(
      "Связь с источниками: сопоставьте дни максимального трафика с графиком выхода рекламы или публикаций в соцсетях для определения самого дешевого 'дня-лида'."
    );
  } else {
    actions.push(
      "Peak Synchronization: Schedule newsletters and new posts 24 hours before identified activity peaks to maximize impact."
    );
    actions.push(
      "Drip Analysis: If slumps occur on weekends, consider 'nurturing' content or retargeting to balance the weekly funnel."
    );
    actions.push(
      "Source Correlation: Match peak traffic days with your ad schedule or social media posts to identify the most cost-effective conversion days."
    );
  }
  
  return actions;
}

function renderInsights(data) {
  if (!insightSummary || !insightActions) return;
  insightSummary.textContent = buildInsightSummary(data);
  const actions = buildInsightActions(data);
  insightActions.innerHTML = actions.map((item) => `<li>${item}</li>`).join("");
}

function setDataStatus(state, text) {
  if (!dataStatus || !dataStatusValue) return;
  dataStatus.classList.remove("ok", "error");
  if (state) dataStatus.classList.add(state);
  dataStatusValue.textContent = text;
}

function generateMockData(days, channel) {
  const baseUsers = 1200 + Math.random() * 600;
  const trend = Math.random() * 8;
  const channelMultiplier = {
    all: 1,
    organic: 0.42,
    paid: 0.24,
    social: 0.14,
    direct: 0.12,
    referral: 0.08,
  };

  const multiplier = channelMultiplier[channel] || 1;
  const dailyDates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  });

  const dailyUsers = Array.from({ length: days }, (_, i) => {
    const noise = Math.random() * 120 - 60;
    return Math.max(300, (baseUsers + i * trend + noise) * multiplier);
  });

  const totalUsers = dailyUsers.reduce((sum, v) => sum + v, 0);
  const sessions = totalUsers * (1.35 + Math.random() * 0.25);
  const newUsers = totalUsers * (0.48 + Math.random() * 0.08);
  const engagedSessions = sessions * (0.54 + Math.random() * 0.1);
  const avgTime = 82 + Math.random() * 34;
  const channels = [
    { label: "Organic Search", value: 0.42, users: totalUsers * 0.42 },
    { label: "Paid Search", value: 0.24, users: totalUsers * 0.24 },
    { label: "Organic Social", value: 0.14, users: totalUsers * 0.14 },
    { label: "Direct", value: 0.12, users: totalUsers * 0.12 },
    { label: "Referral", value: 0.08, users: totalUsers * 0.08 },
  ];

  const channelsWithMetrics = channels.map((channel) => ({
    ...channel,
    newUsers: channel.users * (0.45 + Math.random() * 0.1),
    engagementRate: 0.35 + Math.random() * 0.4,
  }));

  const channelsTrend = {
    dates: dailyDates,
    series: channelsWithMetrics.map((channel) => ({
      label: channel.label,
      values: dailyUsers.map((value) => value * channel.value),
    })),
  };

  const sources = [
    ["google / organic", totalUsers * 0.38, totalUsers * 0.16, 0.57],
    ["yandex / organic", totalUsers * 0.21, totalUsers * 0.11, 0.51],
    ["google / cpc", totalUsers * 0.18, totalUsers * 0.07, 0.46],
    ["instagram / social", totalUsers * 0.1, totalUsers * 0.05, 0.42],
    ["direct / none", totalUsers * 0.07, totalUsers * 0.03, 0.49],
  ];

  const pages = [
    ["/", totalUsers * 0.18, totalUsers * 0.1, 92, 0.53],
    ["/catalog", totalUsers * 0.15, totalUsers * 0.08, 78, 0.49],
    ["/rent", totalUsers * 0.12, totalUsers * 0.05, 64, 0.44],
    ["/buy", totalUsers * 0.1, totalUsers * 0.06, 71, 0.47],
    ["/contacts", totalUsers * 0.06, totalUsers * 0.04, 96, 0.61],
  ];

  return {
    days,
    dailyDates,
    dailyUsers,
    totalUsers,
    sessions,
    newUsers,
    engagedSessions,
    avgTime,
    channels: channelsWithMetrics,
    channelsTrend,
    sources,
    pages,
  };
}

function renderKpis(data) {
  const progress = data.totalUsers / GOAL_USERS;
  const sessionsPerUser = data.sessions / data.totalUsers;
  const newUsersShare = data.newUsers / data.totalUsers;
  const engagementRate = data.engagedSessions / data.sessions;

  kpiUsers.textContent = formatNumber(data.totalUsers);
  kpiSessions.textContent = formatNumber(data.sessions);
  kpiSessionsPerUser.textContent = sessionsPerUser.toFixed(2);
  kpiNewUsers.textContent = formatNumber(data.newUsers);
  kpiNewUsersShare.textContent = formatPercent(newUsersShare);
  kpiEngaged.textContent = formatNumber(data.engagedSessions);
  kpiEngRate.textContent = formatPercent(engagementRate);
  kpiAvgTime.textContent = `${Math.round(data.avgTime)} ${t("secondsLabel")}`;
  kpiGoalProgress.textContent = formatPercent(progress);
  kpiGoalBar.style.width = `${Math.min(progress * 100, 100)}%`;

  const monthlyForecast = Math.round((data.totalUsers / data.days) * 30);
  kpiGoalForecast.textContent = `${t("forecastLabel")}: ${formatNumber(
    monthlyForecast
  )}${t("perMonthLabel")}`;
}


function renderTable(container, headers, rows) {
  container.innerHTML = "";
  const headerRow = document.createElement("div");
  headerRow.className = "table-row header";
  headerRow.innerHTML = headers.map((h) => `<div>${h}</div>`).join("");
  container.appendChild(headerRow);
  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "table-row";
    rowEl.innerHTML = row.map((cell) => `<div>${cell}</div>`).join("");
    container.appendChild(rowEl);
  });
}

function renderCharts(data) {
  const labels = getDailyLabels(data);
  const userSeries = data.dailyUsers.map((value) => Math.round(value));

  if (usersChart) usersChart.destroy();
  usersChart = new Chart(usersChartEl, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("usersLabel"),
          data: userSeries,
          borderColor: "#2251ff",
          backgroundColor: "rgba(34, 81, 255, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { grid: { color: "#eef2f8" } },
      },
    },
  });

  if (channelsChart) channelsChart.destroy();
  channelsChart = new Chart(channelsChartEl, {
    type: "doughnut",
    data: {
      labels: data.channels.map((c) => localizeChannelLabel(c.label)),
      datasets: [
        {
          data: data.channels.map((c) => Math.round(c.value * 100)),
          backgroundColor: [
            "#2251ff",
            "#47d1ff",
            "#ffb547",
            "#7c5cff",
            "#2fd1a6",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      cutout: "65%",
    },
  });

  const trendData = buildChannelsTrend(data);
  if (channelsTrendChart) channelsTrendChart.destroy();
  channelsTrendChart = new Chart(channelsTrendChartEl, {
    type: "bar",
    data: {
      labels: trendData.labels,
      datasets: trendData.datasets,
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        x: { stacked: true, display: false },
        y: { stacked: true, grid: { color: "#eef2f8" } },
      },
    },
  });

  if (goalGaugeChart) goalGaugeChart.destroy();
  const progress = data.totalUsers / GOAL_USERS;
  goalGaugeChart = new Chart(goalGaugeChartEl, {
    type: "doughnut",
    data: {
      labels: [t("kpiGoalLabel"), t("remainingLabel")],
      datasets: [
        {
          data: [Math.min(progress, 1), Math.max(1 - progress, 0)],
          backgroundColor: ["#2251ff", "#eef2f8"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "75%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });
}

function renderTables(data) {
  const channelRows = (data.channels || []).map((c) => [
    localizeChannelLabel(c.label),
    formatNumber(c.users ?? c.value * (data.totalUsers || 0)),
    formatPercent(c.engagementRate),
    formatNumber(c.newUsers),
  ]);
  renderTable(
    channelsTable,
    [
      t("channelHeader"),
      t("usersHeader"),
      t("engagementRateHeader"),
      t("newUsersHeader"),
    ],
    channelRows
  );

  renderTable(
    sourcesTable,
    [
      t("sourcesHeader"),
      t("usersHeader"),
      t("engagedHeader"),
      t("engagementRateHeader"),
    ],
    (data.sources || []).map((s) => {
      if (s.length >= 4) {
        return [s[0], formatNumber(s[1]), formatNumber(s[2]), formatPercent(s[3])];
      }
      return [s[0], formatNumber(s[1]), "—", formatPercent(s[2])];
    })
  );

  renderTable(
    pagesTable,
    [
      t("pagesHeader"),
      t("usersHeader"),
      t("engagedHeader"),
      t("avgEngagementHeader"),
    ],
    (data.pages || []).map((p) => {
      if (p.length >= 5) {
        return [
          p[0],
          formatNumber(p[1]),
          formatNumber(p[2]),
          Number.isFinite(Number(p[3]))
            ? `${Math.round(p[3])} ${t("secondsLabel")}`
            : "—",
        ];
      }
      return [p[0], formatNumber(p[1]), "—", "—"];
    })
  );

  renderProblemPagesTable(data.pages || []);
}

function localizeChannelLabel(label) {
  if (currentLanguage === "en") return label;
  const map = {
    Direct: "Прямой",
    "Organic Search": "Органический поиск",
    "Paid Search": "Платный поиск",
    "Organic Social": "Соцсети",
    Referral: "Рефералы",
    Unassigned: "Не определено",
    "Paid Other": "Платные",
    Other: "Другое",
  };
  return map[label] || label;
}

function renderProblemPagesTable(pages) {
  if (!problemPagesTable) return;
  problemPagesTable.innerHTML = "";
  const headerRow = document.createElement("div");
  headerRow.className = "table-row header";
  headerRow.innerHTML = [
    t("pagesHeader"),
    t("engagementRateHeader"),
  ]
    .map((h) => `<div>${h}</div>`)
    .join("");
  problemPagesTable.appendChild(headerRow);

  pages.forEach((page) => {
    const maybeRate = page.length >= 5 ? page[4] : page[2];
    const engagementRate = Number.isFinite(Number(maybeRate))
      ? Number(maybeRate)
      : null;
    const rowEl = document.createElement("div");
    rowEl.className = "table-row";
    if (engagementRate === null) {
      rowEl.classList.add("warn");
    } else if (engagementRate < 0.2) {
      rowEl.classList.add("alert");
    } else if (engagementRate < 0.4) {
      rowEl.classList.add("warn");
    } else {
      rowEl.classList.add("good");
    }
    rowEl.innerHTML = [
      page[0],
      formatPercent(engagementRate),
    ]
      .map((cell) => `<div>${cell}</div>`)
      .join("");
    problemPagesTable.appendChild(rowEl);
  });
}

async function fetchDashboardData(days, channel) {
  const response = await fetch(
    `/api/ga4?days=${days}&channel=${encodeURIComponent(channel)}`
  );
  if (!response.ok) {
    throw new Error("API error");
  }
  return response.json();
}

async function loadDashboard() {
  const days = Number(rangeSelect.value);
  const channel = channelSelect.value;
  try {
    const data = await fetchDashboardData(days, channel);
    lastData = data;
    renderKpis(data);
    renderCharts(data);
    renderTables(data);
    renderInsights(data);
    const now = new Date();
    const timeLabel = now.toLocaleTimeString(
      currentLanguage === "ru" ? "ru-RU" : "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );
    setDataStatus(
      "ok",
      `GA4 API • ${formatNumber(data.totalUsers)} • ${timeLabel}`
    );
  } catch (error) {
    setDataStatus(
      "error",
      currentLanguage === "ru"
        ? "Ошибка API — проверьте сервер"
        : "API error — check server"
    );
    if (!lastData) return;
    renderKpis(lastData);
    renderCharts(lastData);
    renderTables(lastData);
    renderInsights(lastData);
  }
}

let lastData = null;

function handleLanguageChange() {
  currentLanguage = languageSelect.value;
  localStorage.setItem("dashboardLanguage", currentLanguage);
  applyTranslations();
  if (dataStatusValue && dataStatusValue.textContent.includes("GA4")) {
    dataStatusValue.textContent = "GA4 API";
  }
  if (lastData) {
    renderKpis(lastData);
    renderCharts(lastData);
    renderTables(lastData);
    renderInsights(lastData);
  }
}

function getDailyLabels(data) {
  if (Array.isArray(data.dailyDates) && data.dailyDates.length) {
    return data.dailyDates.map((value) => formatDateLabel(value));
  }
  const count = Array.isArray(data.dailyUsers) ? data.dailyUsers.length : 0;
  return Array.from({ length: count }, (_, i) => `${t("dayLabel")} ${i + 1}`);
}

function formatDateLabel(raw) {
  if (!raw) return "";
  const normalized = raw.includes("-")
    ? raw
    : `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(
    currentLanguage === "ru" ? "ru-RU" : "en-US",
    { day: "2-digit", month: "short" }
  );
}

function buildChannelsTrend(data) {
  const labels = (data.channelsTrend?.dates || []).map((value) =>
    formatDateLabel(value)
  );
  const series =
    data.channelsTrend?.series ||
    (Array.isArray(data.dailyUsers) && Array.isArray(data.channels)
      ? data.channels.map((channel) => ({
          label: channel.label,
          values: data.dailyUsers.map((value) => value * (channel.value || 0)),
        }))
      : []);
  const finalLabels = labels.length ? labels : getDailyLabels(data);
  const datasets = series.map((seriesItem, index) => ({
    label: localizeChannelLabel(seriesItem.label),
    data: (seriesItem.values || []).map((v) => Math.round(v)),
    backgroundColor: [
      "#2251ff",
      "#47d1ff",
      "#ffb547",
      "#7c5cff",
      "#2fd1a6",
      "#c27bff",
    ][index % 6],
    stack: "channels",
  }));
  return { labels: finalLabels, datasets };
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const sections = document.querySelectorAll(".page-section");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-page");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      sections.forEach((section) => {
        if (section.getAttribute("data-page") === target) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
    });
  });
}

languageSelect.value = currentLanguage;
applyTranslations();
languageSelect.addEventListener("change", handleLanguageChange);
refreshBtn.addEventListener("click", loadDashboard);
rangeSelect.addEventListener("change", loadDashboard);
channelSelect.addEventListener("change", loadDashboard);

setupTabs();
loadDashboard();

/*
  Подключение реальных данных:
  - Сделайте API (например /api/ga4) и отдавайте JSON:
    {
      days, dailyUsers, totalUsers, sessions, newUsers,
      engagedSessions, avgTime, channels, sources, pages
    }
  - Затем замените generateMockData на fetch("/api/ga4")
*/
