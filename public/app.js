const GOAL_USERS = 60000;
const usersChartEl = document.getElementById("usersChart");
const channelsChartEl = document.getElementById("channelsChart");
const channelsTrendChartEl = document.getElementById("channelsTrendChart");
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

// Backlinks KPI elements
const kpiBacklinks = document.getElementById("kpiBacklinks");
const kpiNewBacklinks = document.getElementById("kpiNewBacklinks");
const kpiDomains = document.getElementById("kpiDomains");
const kpiFollow = document.getElementById("kpiFollow");
const kpiFollowPercent = document.getElementById("kpiFollowPercent");
const kpiNofollow = document.getElementById("kpiNofollow");
const kpiNofollowPercent = document.getElementById("kpiNofollowPercent");
const kpiAvgDa = document.getElementById("kpiAvgDa");

// Backlinks chart and table elements
const backlinksChartEl = document.getElementById("backlinksChart");
const followNofollowChartEl = document.getElementById("followNofollowChart");
const topDomainsTable = document.getElementById("topDomainsTable");
const anchorTextTable = document.getElementById("anchorTextTable");


const rangeSelect = document.getElementById("rangeSelect");
const channelSelect = document.getElementById("channelSelect");
const propertySelect = document.getElementById("propertySelect");
const refreshBtn = document.getElementById("refreshBtn");
const languageSelect = document.getElementById("languageSelect");
const themeToggleBtn = document.getElementById("themeToggleBtn");

let usersChart;
let channelsChart;
let channelsTrendChart;
let backlinksChart;
let followNofollowChart;

// Helper function to get chart colors based on current theme
function getChartColors() {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  return {
    textColor: isDark ? "#ffffff" : "#0f1a2a",
    gridColor: isDark ? "#1a2a3a" : "#eef2f8",
    axisColor: isDark ? "#e0e0e0" : "#0f1a2a",
    lineColor: isDark ? "#6dcbf5" : "#2251ff",
    backgroundColor: isDark ? "rgba(109, 203, 245, 0.15)" : "rgba(34, 81, 255, 0.1)",
    canvasBackground: isDark ? "#0d1f2a" : "#ffffff",
  };
}

const translations = {
  ru: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Трафик и эффективность сайта",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    tabBacklinks: "Google Search Console",
    periodLabel: "Период",    periodToday: "Сегодня",
    periodYesterday: "Вчера",    period30: "Последние 30 дней",
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
    propertyLabel: "Сайт",
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
    // Backlinks translations (GSC data)
    kpiBacklinksLabel: "Поисковые показы",
    kpiBacklinksNote: "Сколько раз ваш сайт показан",
    kpiNewBacklinksLabel: "Всего кликов",
    kpiNewBacklinksNote: "Из результатов поиска",
    kpiDomainsLabel: "Уникальные запросы",
    kpiDomainsNote: "Поисковые термины",
    kpiFollowLabel: "Показы с кликами",
    kpiFollowNote: "Показы, которые привели клики",
    kpiNofollowLabel: "Показы без кликов",
    kpiNofollowNote: "Без кликов из поиска",
    kpiAvgDaLabel: "Средняя позиция",
    kpiAvgDaNote: "Место в поиске",
    kpiBacklinksGrowthLabel: "Тренд показов",
    kpiBacklinksGrowthNote: "За период",
    backlinksTitle: "Тренд поисковых показов",
    followNofollowTitle: "Клики vs Показы",
    topDomainsTitle: "Топ поисковых запросов",
    anchorTextTitle: "Распределение запросов",
    backlinksTableTitle: "Показы",
    domainsHeader: "Запрос",
    backlinksCountHeader: "Показы",
    daHeader: "Позиция",
    typeHeader: "Тип",
    anchorHeader: "Запрос",
    countHeader: "Количество",
  },
  en: {
    brandTitle: "Magnum Estate",
    brandSubtitle: "Website traffic and performance",
    tabOverview: "CEO Overview",
    tabMarketing: "Marketing",
    tabContent: "Content",
    tabBacklinks: "Google Search Console",
    periodLabel: "Period",
    periodToday: "Today",
    periodYesterday: "Yesterday",
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
    propertyLabel: "Property",
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
    // Backlinks translations (GSC data)
    kpiBacklinksLabel: "Search Impressions",
    kpiBacklinksNote: "Times your site appeared",
    kpiNewBacklinksLabel: "Total Clicks",
    kpiNewBacklinksNote: "From search results",
    kpiDomainsLabel: "Unique Queries",
    kpiDomainsNote: "Search terms driving traffic",
    kpiFollowLabel: "Clicked Impressions",
    kpiFollowNote: "Impressions with clicks",
    kpiNofollowLabel: "Unclicked Impressions",
    kpiNofollowNote: "No clicks from search",
    kpiAvgDaLabel: "Average Position",
    kpiAvgDaNote: "Search ranking",
    kpiBacklinksGrowthLabel: "Impressions trend",
    kpiBacklinksGrowthNote: "Over period",
    backlinksTitle: "Search Impressions Trend",
    followNofollowTitle: "Clicks vs Impressions",
    topDomainsTitle: "Top Search Queries",
    anchorTextTitle: "Query distribution",
    backlinksTableTitle: "Search queries",
    domainsHeader: "Query",
    backlinksCountHeader: "Impressions",
    daHeader: "Avg Position",
    typeHeader: "Type",
    anchorHeader: "Search query",
    countHeader: "Count",
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
  dataStatus.classList.remove("ok", "error", "unavailable");
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

function generateMockBacklinksData(days) {
  const baseBacklinks = 850 + Math.random() * 250;
  const trend = Math.random() * 5;
  const dailyDates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  });

  const dailyBacklinks = Array.from({ length: days }, (_, i) => {
    const noise = Math.random() * 40 - 20;
    return Math.max(100, baseBacklinks + i * trend + noise);
  });

  const totalBacklinks = Math.round(dailyBacklinks.reduce((sum, v) => sum + v, 0) / days * 30);
  const newBacklinks = Math.round(totalBacklinks * 0.15); // 15% new in period
  const referringDomains = Math.round(totalBacklinks * 0.25); // ~25% unique domains
  const followBacklinks = Math.round(totalBacklinks * 0.68);
  const nofollowBacklinks = totalBacklinks - followBacklinks;
  const avgDA = 35 + Math.random() * 25; // Domain Authority 35-60

  const topDomains = [
    ["medium.com", Math.round(totalBacklinks * 0.18), Math.round(avgDA + 8)],
    ["reddit.com", Math.round(totalBacklinks * 0.14), Math.round(avgDA + 5)],
    ["linkedin.com", Math.round(totalBacklinks * 0.12), Math.round(avgDA + 10)],
    ["forbes.com", Math.round(totalBacklinks * 0.1), Math.round(avgDA + 12)],
    ["quora.com", Math.round(totalBacklinks * 0.08), Math.round(avgDA - 5)],
  ];

  const anchorTextDistribution = [
    ["real estate", Math.round(totalBacklinks * 0.22)],
    ["luxury homes", Math.round(totalBacklinks * 0.18)],
    ["property investment", Math.round(totalBacklinks * 0.15)],
    ["estate management", Math.round(totalBacklinks * 0.12)],
    ["magnum estates", Math.round(totalBacklinks * 0.10)],
    ["other anchors", Math.round(totalBacklinks * 0.23)],
  ];

  return {
    days,
    dailyDates,
    dailyBacklinks,
    totalBacklinks,
    newBacklinks,
    referringDomains,
    followBacklinks,
    nofollowBacklinks,
    avgDA,
    topDomains,
    anchorTextDistribution,
  };
}

function renderBacklinksKpis(data) {
  if (!data) return;
  
  // If data is not available, show notice
  if (data.dataAvailable === false) {
    const notice = currentLanguage === 'ru' 
      ? 'Данные Google Search Console недоступны для этого свойства' 
      : 'Google Search Console data is not available for this property';
    kpiBacklinks.textContent = '—';
    kpiNewBacklinks.textContent = '—';
    kpiDomains.textContent = '—';
    kpiFollow.textContent = '—';
    kpiFollowPercent.textContent = `(${notice})`;
    kpiNofollow.textContent = '—';
    kpiNofollowPercent.textContent = '';
    kpiAvgDa.textContent = '—';
    return;
  }
  
  // Only render if we have valid data
  if (data.totalBacklinks === 0) return;
  
  const followPercent = (data.followBacklinks / data.totalBacklinks);
  const nofollowPercent = (data.nofollowBacklinks / data.totalBacklinks);

  kpiBacklinks.textContent = formatNumber(data.totalBacklinks);
  kpiNewBacklinks.textContent = formatNumber(data.newBacklinks);
  kpiDomains.textContent = formatNumber(data.referringDomains);
  kpiFollow.textContent = formatNumber(data.followBacklinks);
  kpiFollowPercent.textContent = `(${formatPercent(followPercent)})`;
  kpiNofollow.textContent = formatNumber(data.nofollowBacklinks);
  kpiNofollowPercent.textContent = `(${formatPercent(nofollowPercent)})`;
  kpiAvgDa.textContent = Math.round(data.avgDA);
}

function renderBacklinksCharts(data) {
  if (!data || data.dataAvailable === false) return;
  
  const labels = getDailyLabels(data);
  const backlinksSeriesData = data.dailyBacklinks.map((value) => Math.round(value));

  // Canvas background plugin
  const canvasBackgroundPlugin = {
    id: 'canvasBackground',
    beforeDraw(chart) {
      const backlinksColors = getChartColors();
      const {ctx} = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = backlinksColors.canvasBackground;
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };

  // Backlinks growth chart
  if (backlinksChart) backlinksChart.destroy();
  const backlinksColors = getChartColors();
  backlinksChart = new Chart(backlinksChartEl, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("backlinksTitle"),
          data: backlinksSeriesData,
          borderColor: "#2fd1a6",
          backgroundColor: "rgba(47, 209, 166, 0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        canvasBackground: {},
      },
      scales: {
        x: {
          display: true,
          grid: { color: backlinksColors.gridColor },
          ticks: { color: backlinksColors.textColor },
        },
        y: {
          title: { display: true, text: "Backlinks", color: backlinksColors.axisColor },
          ticks: { color: backlinksColors.textColor },
          grid: { color: backlinksColors.gridColor },
        },
      },
    },
    plugins: [canvasBackgroundPlugin],
  });

  // Follow vs Nofollow chart
  if (followNofollowChart) followNofollowChart.destroy();
  const followColors = getChartColors();
  followNofollowChart = new Chart(followNofollowChartEl, {
    type: "doughnut",
    data: {
      labels: [
        currentLanguage === "ru" ? "Follow" : "Follow",
        currentLanguage === "ru" ? "Nofollow" : "Nofollow",
      ],
      datasets: [
        {
          data: [
            Math.round(data.followBacklinks),
            Math.round(data.nofollowBacklinks),
          ],
          backgroundColor: ["#2251ff", "#ffb547"],
        },
      ],
    },
    options: {
      plugins: {
        legend: { 
          position: "bottom",
          labels: {
            color: followColors.textColor,
            padding: 15,
            font: { size: 12 }
          }
        },
        canvasBackground: {},
      },
      cutout: "65%",
    },
    plugins: [canvasBackgroundPlugin],
  });
}

function renderBacklinksTables(data) {
  if (!data || data.dataAvailable === false) return;

  // Top referring domains
  renderTable(
    topDomainsTable,
    [t("domainsHeader"), t("backlinksCountHeader"), t("daHeader")],
    (data.topDomains || []).map((d) => [d[0], formatNumber(d[1]), String(d[2])])
  );

  // Anchor text distribution
  renderTable(
    anchorTextTable,
    [t("anchorHeader"), t("countHeader")],
    (data.anchorTextDistribution || []).map((a) => [a[0], formatNumber(a[1])])
  );
}

function fetchBacklinksData(days, property) {
  return fetch(
    `/api/backlinks?days=${days}&property=${property || 'magnum'}`
  )
    .then((res) => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .catch(() => {
      // Fallback to mock data if API unavailable
      console.log("Backlinks API unavailable, using mock data");
      return generateMockBacklinksData(days);
    });
}

function renderKpis(data) {
  const monthlyForecast = Math.round((data.totalUsers / data.days) * 30);
  const progress = monthlyForecast / GOAL_USERS;
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
  const colors = getChartColors();
  
  const canvasBackgroundPlugin = {
    id: 'canvasBackground',
    beforeDraw(chart) {
      const {ctx} = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = colors.canvasBackground;
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };
  
  usersChart = new Chart(usersChartEl, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("usersLabel"),
          data: userSeries,
          borderColor: colors.lineColor,
          backgroundColor: colors.backgroundColor,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        canvasBackground: {},
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date",
            color: colors.axisColor,
            font: { size: 12, weight: 500 },
          },
          ticks: {
            color: colors.textColor,
            maxRotation: 45,
            minRotation: 0,
          },
          grid: { color: colors.gridColor },
        },
        y: {
          title: {
            display: true,
            text: "Number of Users",
            color: colors.axisColor,
            font: { size: 12, weight: 500 },
          },
          ticks: {
            color: colors.textColor,
          },
          grid: { color: colors.gridColor },
        },
      },
    },
    plugins: [canvasBackgroundPlugin],
  });

  if (channelsChart) channelsChart.destroy();
  const colors2 = getChartColors();
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
        legend: { 
          position: "bottom",
          labels: {
            color: colors2.textColor,
            padding: 15,
            font: { size: 12 }
          }
        },
        canvasBackground: {},
      },
      cutout: "65%",
    },
    plugins: [canvasBackgroundPlugin],
  });

  const trendData = buildChannelsTrend(data);
  if (channelsTrendChart) channelsTrendChart.destroy();
  const colors3 = getChartColors();
  channelsTrendChart = new Chart(channelsTrendChartEl, {
    type: "bar",
    data: {
      labels: trendData.labels,
      datasets: trendData.datasets,
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: colors3.textColor,
            padding: 15,
            font: { size: 12 }
          }
        },
        canvasBackground: {},
      },
      scales: {
        x: { 
          stacked: true, 
          display: false,
          ticks: { color: colors3.textColor }
        },
        y: { 
          stacked: true, 
          grid: { color: colors3.gridColor },
          ticks: { color: colors3.textColor }
        },
      },
    },
    plugins: [canvasBackgroundPlugin],
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

async function fetchDashboardData(days, channel, property) {
  const response = await fetch(
    `/api/ga4?days=${days}&channel=${encodeURIComponent(channel)}&property=${encodeURIComponent(property)}`
  );
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error("API error");
    error.status = response.status;
    error.apiNotAvailable = data.apiNotAvailable || false;
    error.responseData = data;
    throw error;
  }
  return data;
}

async function loadDashboard() {
  let days = Number(rangeSelect.value);
  const channel = channelSelect.value;
  const property = propertySelect.value;
  
  // If rangeSelect value is a string like "quarter" or "half", handle it
  if (isNaN(days)) {
    const rangeValue = rangeSelect.value;
    if (rangeValue === "quarter") days = 90;
    else if (rangeValue === "half") days = 180;
    else days = 30; // default
  }
  
  try {
    const [data, backlinksData] = await Promise.all([
      fetchDashboardData(days, channel, property),
      fetchBacklinksData(days, property),
    ]);
    
    lastData = data;
    lastBacklinksData = backlinksData;
    
    renderKpis(data);
    renderCharts(data);
    renderTables(data);
    renderInsights(data);
    renderBacklinksKpis(backlinksData);
    renderBacklinksCharts(backlinksData);
    renderBacklinksTables(backlinksData);
    
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
    // Check if this is an "API not available" error
    if (error.apiNotAvailable) {
      const message = currentLanguage === "ru" 
        ? "API недоступен для этого свойства"
        : "API not available";
      setDataStatus("unavailable", message);
      
      // Clear KPIs and show empty state
      document.querySelectorAll('.kpi-value').forEach(el => el.textContent = '—');
      document.querySelectorAll('.kpi-note').forEach(el => el.textContent = '');
      
      // Still show backlinks if available
      if (lastBacklinksData) {
        renderBacklinksKpis(lastBacklinksData);
        renderBacklinksCharts(lastBacklinksData);
        renderBacklinksTables(lastBacklinksData);
      }
      return;
    }
    
    // Handle other API errors
    setDataStatus(
      "error",
      currentLanguage === "ru"
        ? "Ошибка API — проверьте сервер"
        : "API error — check server"
    );
    if (!lastData || !lastBacklinksData) return;
    renderKpis(lastData);
    renderCharts(lastData);
    renderTables(lastData);
    renderInsights(lastData);
    renderBacklinksKpis(lastBacklinksData);
    renderBacklinksCharts(lastBacklinksData);
    renderBacklinksTables(lastBacklinksData);
  }
}

let lastData = null;
let lastBacklinksData = null;

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
  if (lastBacklinksData) {
    renderBacklinksKpis(lastBacklinksData);
    renderBacklinksCharts(lastBacklinksData);
    renderBacklinksTables(lastBacklinksData);
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("dashboardTheme") || "light";
  setTheme(savedTheme);
}

function setTheme(theme) {
  if (theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
    localStorage.setItem("dashboardTheme", "dark");
  } else {
    document.body.removeAttribute("data-theme");
    if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
    localStorage.setItem("dashboardTheme", "light");
  }
  // Redraw charts with new theme colors
  if (lastData) {
    renderCharts(lastData);
    renderBacklinksCharts(lastBacklinksData);
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("dashboardTheme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
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
initTheme();
languageSelect.addEventListener("change", handleLanguageChange);
propertySelect.addEventListener("change", loadDashboard);
themeToggleBtn.addEventListener("click", toggleTheme);
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
