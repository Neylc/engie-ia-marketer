// lib/data.ts

// --- Helper Functions ---
const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// --- Constants ---
export const platforms = [
  "Google Ads",
  "Meta Ads",
  "LinkedIn Ads",
  "Programmatic Display",
];
const campaignStatus = ["Active", "Paused", "Ended", "Draft"];
export const aiDecisionTypes = [
  "Budget Adjustment",
  "Audience Refinement",
  "Ad Creative Change",
  "Bidding Strategy Update",
  "Keyword Optimization",
];
// Engie-specific themes and goals
const engieThemes = [
  "Home Energy Savings",
  "Business Solutions",
  "Renewable Energy Options",
  "EV Charging Solutions",
  "Smart Home Tech",
  "Industrial Efficiency",
  "District Heating",
];
const campaignGoals = [
  "Lead Generation",
  "Brand Awareness",
  "Product Sign-up",
  "Consultation Request",
];

// --- Types ---
export type KpiData = {
  totalSpend: number;
  spendByPlatform: { platform: string; spend: number }[];
  roi: number;
  conversionRate: number;
};

export type PerformanceDataPoint = {
  date: string; // e.g., "YYYY-MM-DD"
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number; // Represent leads, sign-ups, etc.
};

export type Campaign = {
  id: string;
  name: string;
  platform: string;
  status: string;
  goal: string;
  budget: number;
  spend: number;
  startDate: string;
  endDate?: string;
  ctr: number;
  cpc: number;
};

export type AiRecommendation = {
  id: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  action?: string; // e.g., "Increase Budget", "Pause Campaign"
};

export type AiDecision = {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  reason: string;
  campaignId?: string;
  campaignName?: string;
  userFeedback: "good" | "bad" | null;
  isReverted: boolean;
};

export type PlatformStatus = {
  platform: string;
  status: "Connected" | "Disconnected" | "Error";
  lastSync: string;
};

// Add type for Estimated Savings
export type EstimatedSavingsData = {
  amount: number;
  percentage: number;
  periodDays: number;
};

// Type for data visualized on the Europe map
export interface CountryData {
  isoAlpha3: string; // ISO 3166-1 alpha-3 code
  name: string;
  budget: number;
  performance: number; // Could be ROI, conversions/budget ratio, etc.
  // Add new metrics
  totalSpend: number;
  conversions: number;
  cac: number; // Cost Per Acquisition
}

// List of European countries (ISO Alpha-3 codes) - Add more as needed
const europeanCountries: { code: string; name: string }[] = [
  { code: "FRA", name: "France" },
  { code: "DEU", name: "Germany" },
  { code: "GBR", name: "United Kingdom" },
  { code: "ESP", name: "Spain" },
  { code: "ITA", name: "Italy" },
  { code: "NLD", name: "Netherlands" },
  { code: "BEL", name: "Belgium" },
  { code: "SWE", name: "Sweden" },
  { code: "NOR", name: "Norway" },
  { code: "POL", name: "Poland" },
  { code: "AUT", name: "Austria" },
  { code: "CHE", name: "Switzerland" },
];

export const generateEuropeData = (totalBudget: number): CountryData[] => {
  const data: CountryData[] = [];
  const countryCount = europeanCountries.length;
  // Distribute budget somewhat randomly
  let remainingBudget = totalBudget;

  europeanCountries.forEach((country, index) => {
    // Assign a portion of the remaining budget, leaving some for the last one
    const budgetShare =
      index === countryCount - 1
        ? 1
        : Math.random() * (1 / (countryCount - index)) * 1.5;
    const budget = Math.max(
      5000,
      Math.min(remainingBudget * budgetShare, remainingBudget * 0.4)
    ); // Ensure some budget, but cap share
    remainingBudget -= budget;

    // --- Generate new metrics ---
    // Assume totalSpend is somewhat close to budget
    const totalSpend = budget * getRandomNumber(0.85, 1.1);
    // Generate conversions based on spend and performance (higher performance -> more conversions per dollar)
    const conversions = Math.floor(
      (totalSpend / 100) * getRandomNumber(0.5, 1.5)
    );
    // Calculate CAC (Cost Per Acquisition), handle division by zero
    const cac = conversions > 0 ? totalSpend / conversions : 0;
    // --- End new metrics ---

    data.push({
      isoAlpha3: country.code,
      name: country.name,
      budget: budget,
      performance: getRandomNumber(0.5, 5.0), // Example: ROI from 0.5x to 5.0x
      totalSpend: parseFloat(totalSpend.toFixed(0)),
      conversions: conversions,
      cac: parseFloat(cac.toFixed(2)),
    });
  });

  // Distribute any tiny leftover budget to the first country
  if (remainingBudget > 0 && data.length > 0) {
    data[0].budget += remainingBudget;
    data[0].budget = parseFloat(data[0].budget.toFixed(0));
  }

  // --- DEBUG LOG ---
  console.log("Generated Europe Data:", JSON.stringify(data, null, 2));
  // --- END DEBUG ---

  return data;
};

// --- Data Generation Functions ---

export const generateKpiData = (): KpiData => {
  // Reflecting ~1 month of a $50M/year spend
  const totalSpend = getRandomNumber(3_500_000, 5_000_000);
  const spendByPlatform = platforms.map((platform) => ({
    platform,
    // Allocate spend proportionally, higher budgets mean higher potential spend per platform
    spend: getRandomNumber(totalSpend * 0.05, totalSpend * 0.5),
  }));
  // Normalize platform spend to roughly match total spend
  const platformTotal = spendByPlatform.reduce((sum, p) => sum + p.spend, 0);
  const normalizationFactor = totalSpend / platformTotal;
  spendByPlatform.forEach((p) => {
    p.spend *= normalizationFactor;
    p.spend = parseFloat(p.spend.toFixed(2));
  });

  return {
    totalSpend: parseFloat(totalSpend.toFixed(0)), // Use whole numbers for large spend
    spendByPlatform, // Will be normalized
    roi: getRandomNumber(1.8, 6.0), // ROI might be higher with larger scale/optimization
    conversionRate: getRandomNumber(0.008, 0.06), // Conversion rate might decrease slightly at huge scale
  };
};

export const generatePerformanceData = (
  days: number = 30
): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  const endDate = new Date();
  // Base daily spend reflecting ~$137k/day average
  let baseSpend = getRandomNumber(110_000, 160_000);
  let baseImpressions = baseSpend * getRandomInt(100, 300); // Impressions per dollar might vary
  let baseClicks = baseImpressions * getRandomNumber(0.004, 0.02); // Slightly adjusted CTR
  let baseConversions = baseClicks * getRandomNumber(0.01, 0.07); // Slightly adjusted Conv Rate

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);

    // Add some trend and noise
    const fluctuation = (Math.random() - 0.4) * 0.2 + 1; // Increase fluctuation range slightly
    const dayOfWeekFactor = [1, 0.9, 0.95, 1.1, 1.2, 0.8, 0.75][date.getDay()]; // Weekend dip

    const spend = baseSpend * fluctuation * dayOfWeekFactor;
    const impressions =
      baseImpressions *
      fluctuation *
      dayOfWeekFactor *
      (Math.random() * 0.25 + 0.85);
    const clicks =
      baseClicks * fluctuation * dayOfWeekFactor * (Math.random() * 0.35 + 0.8);
    const conversions = Math.max(
      0,
      Math.floor(
        baseConversions *
          fluctuation *
          dayOfWeekFactor *
          (Math.random() * 0.45 + 0.75)
      )
    );

    data.push({
      date: date.toISOString().split("T")[0],
      // Round large numbers for cleaner display
      spend: parseFloat(spend.toFixed(0)),
      impressions: Math.floor(impressions),
      clicks: Math.floor(clicks),
      conversions: conversions,
    });

    // Evolve base values - adjusted growth factors for larger numbers
    baseSpend *= 1 + (Math.random() - 0.48) * 0.005;
    baseImpressions *= 1 + (Math.random() - 0.48) * 0.006;
    baseClicks *= 1 + (Math.random() - 0.49) * 0.004;
    baseConversions *= 1 + (Math.random() - 0.47) * 0.007;
  }
  return data;
};

export const generateCampaigns = (count: number = 15): Campaign[] => {
  const campaigns: Campaign[] = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  for (let i = 0; i < count; i++) {
    // Significantly increased budget range
    const budget = getRandomNumber(50_000, 2_000_000);
    const spend = getRandomNumber(budget * 0.4, budget * 1.05); // Spend closer to budget potentially
    const impressions = getRandomInt(spend * 80, spend * 250); // Adjusted impressions/spend ratio
    const clicks = getRandomInt(impressions * 0.004, impressions * 0.025);
    const safeClicks = impressions > 0 && clicks === 0 ? 1 : clicks;
    const startDate = getRandomDate(oneYearAgo, today);
    const status = campaignStatus[getRandomInt(0, campaignStatus.length - 1)];
    const platform = platforms[getRandomInt(0, platforms.length - 1)];
    const goal = campaignGoals[getRandomInt(0, campaignGoals.length - 1)];
    const theme = engieThemes[getRandomInt(0, engieThemes.length - 1)];
    const id = `ENG-CAM-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    let name = `${theme} - ${platform}`;
    if (platform === "Google Ads")
      name += ` [${goal === "Brand Awareness" ? "Display" : "Search"}]`;
    else if (platform === "LinkedIn Ads") name += ` [${goal}]`;
    else
      name += ` Q${Math.floor(startDate.getMonth() / 3) + 1}'${startDate
        .getFullYear()
        .toString()
        .substring(2)}`;
    name += ` (${i + 1})`;

    campaigns.push({
      id: id,
      name: name,
      platform: platform,
      status: status,
      goal: goal,
      budget: parseFloat(budget.toFixed(0)),
      spend: parseFloat(spend.toFixed(0)),
      startDate: startDate.toISOString().split("T")[0],
      endDate:
        status === "Ended" || status === "Completed"
          ? getRandomDate(startDate, today).toISOString().split("T")[0]
          : undefined,
      ctr: impressions > 0 ? safeClicks / impressions : 0,
      cpc: safeClicks > 0 ? spend / safeClicks : 0,
    });
  }
  return campaigns;
};

export const generateAiRecommendations = (
  count: number = 5
): AiRecommendation[] => {
  const recommendations: AiRecommendation[] = [];
  const actions = [
    {
      desc: "Increase budget for Campaign X due to high ROI.",
      action: "Increase Budget",
      priority: "High",
    },
    {
      desc: "Pause Campaign Y - low CTR detected.",
      action: "Pause Campaign",
      priority: "High",
    },
    {
      desc: "Consider refining audience targeting for Campaign Z.",
      action: "Review Targeting",
      priority: "Medium",
    },
    {
      desc: "Test new ad creative for Campaign A.",
      action: "Test Creative",
      priority: "Medium",
    },
    {
      desc: "Explore bid adjustments for Campaign B.",
      action: "Adjust Bids",
      priority: "Low",
    },
    {
      desc: "Allocate more budget towards Meta Ads based on performance.",
      action: "Reallocate Budget",
      priority: "Medium",
    },
  ] as const; // Use 'as const' for better type inference on priority

  const usedIndices = new Set<number>();
  while (recommendations.length < count && usedIndices.size < actions.length) {
    const randomIndex = getRandomInt(0, actions.length - 1);
    if (!usedIndices.has(randomIndex)) {
      const { desc, ...rest } = actions[randomIndex]; // Destructure desc
      recommendations.push({
        id: `rec_${Math.random().toString(36).substring(2, 9)}`,
        description: desc, // Map desc to description
        ...rest,
      });
      usedIndices.add(randomIndex);
    }
  }
  return recommendations;
};

export const generateAiDecisions = (count: number = 20): AiDecision[] => {
  const decisions: AiDecision[] = [];
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const potentialCampaigns = generateCampaigns(Math.max(10, count / 2));

  for (let i = 0; i < count; i++) {
    const timestamp = getRandomDate(threeMonthsAgo, today);
    const type = aiDecisionTypes[getRandomInt(0, aiDecisionTypes.length - 1)];
    let description = "";
    let reason = "";
    let campaignId: string | undefined = undefined;
    let campaignName: string | undefined = undefined;

    if (potentialCampaigns.length > 0 && Math.random() < 0.7) {
      const linkedCampaign =
        potentialCampaigns[getRandomInt(0, potentialCampaigns.length - 1)];
      campaignId = linkedCampaign.id;
      campaignName = linkedCampaign.name;
    }

    const metricValue = getRandomNumber(5, 50).toFixed(1);
    const thresholdValue = getRandomNumber(3, 40).toFixed(1);
    const metricName = ["CTR", "ROI", "Conversion Rate", "CPC"][
      getRandomInt(0, 3)
    ];

    switch (type) {
      case "Budget Adjustment":
        const increase = Math.random() > 0.5;
        const percent = getRandomInt(5, 25);
        const budgetReasonMetric = increase ? "high" : "low";
        description = `AI ${
          increase ? "increased" : "decreased"
        } budget by ${percent}% for ${campaignName ?? "a campaign"}.`;
        reason = `Analysis showed ${budgetReasonMetric} ${metricName} (${metricValue}%) compared to target (${thresholdValue}%). Adjusting budget to capitalize on performance / mitigate losses.`;
        break;
      case "Audience Refinement":
        const added = Math.random() > 0.5;
        const segment = [
          "Interest Group Alpha",
          "Lookalike Audience Beta",
          "Demographic Segment Gamma",
        ][getRandomInt(0, 2)];
        description = `AI ${
          added ? "added" : "removed"
        } audience segment '${segment}' ${added ? "to" : "from"} ${
          campaignName ?? "a campaign"
        }.`;
        reason = `Segment '${segment}' showed ${
          added ? "strong positive" : "negative"
        } correlation (${metricValue}%) with recent conversion goals. ${
          added ? "Adding" : "Removing"
        } to improve targeting efficiency.`;
        break;
      case "Ad Creative Change":
        const creativeIdOld = `CRTV-${getRandomInt(100, 999)}`;
        const creativeIdNew = `CRTV-${getRandomInt(100, 999)}`;
        description = `AI paused creative '${creativeIdOld}' and activated '${creativeIdNew}' for ${
          campaignName ?? "a campaign"
        }.`;
        reason = `Creative '${creativeIdOld}' performance dropped below threshold (${metricName}: ${metricValue}% vs target ${thresholdValue}%). Activating new variant '${creativeIdNew}' for A/B testing.`;
        break;
      case "Bidding Strategy Update":
        const strategy = ["Maximize Conversions", "Target CPA", "Enhanced CPC"][
          getRandomInt(0, 2)
        ];
        description = `AI updated bidding strategy to '${strategy}' for ${
          campaignName ?? "a campaign"
        }.`;
        reason = `Current ${metricName} (${metricValue}%) suggests '${strategy}' bidding strategy is better aligned with campaign objectives and recent market trends.`;
        break;
      case "Keyword Optimization":
        const action = [
          "added new keywords",
          "paused low-performing keywords",
          "adjusted bids on keywords",
        ][getRandomInt(0, 2)];
        const keywordCount = getRandomInt(3, 15);
        description = `AI ${action} (${keywordCount} keywords) for ${
          campaignName ?? "a campaign"
        }.`;
        reason = `Query analysis identified ${keywordCount} keywords with ${
          action.includes("added")
            ? "high potential"
            : "performance outside acceptable range"
        } (${metricName}: ${metricValue}%). Action taken to refine search traffic quality.`;
        break;
      default:
        description = `AI performed an automated optimization of type '${type}' on ${
          campaignName ?? "a campaign"
        }.`;
        reason = `Routine system check identified an opportunity for optimization based on standard parameters. Metric ${metricName} was ${metricValue}%.`;
    }

    decisions.push({
      id: `dec_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: timestamp.toISOString(),
      type: type,
      description: description,
      reason: reason,
      campaignId: campaignId,
      campaignName: campaignName,
      userFeedback: null,
      isReverted: false,
    });
  }

  decisions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return decisions;
};

export const generatePlatformStatus = (): PlatformStatus[] => {
  const today = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(today.getDate() - 1);

  return platforms.map((platform) => ({
    platform,
    // Mostly connected for the prototype
    status: Math.random() > 0.1 ? "Connected" : "Error",
    lastSync: getRandomDate(oneDayAgo, today).toISOString(),
  }));
};

// --- NEW: Generate Estimated Savings Data ---
export const generateEstimatedSavings = (
  totalSpend: number,
  periodDays: number = 30
): EstimatedSavingsData => {
  // Assume AI saves between 5% and 15% through optimization
  const savingsPercentage = getRandomNumber(0.05, 0.15);
  const savingsAmount = totalSpend * savingsPercentage;

  return {
    amount: parseFloat(savingsAmount.toFixed(0)),
    percentage: parseFloat((savingsPercentage * 100).toFixed(1)),
    periodDays: periodDays,
  };
};
