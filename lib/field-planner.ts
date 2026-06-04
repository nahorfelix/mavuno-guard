import type {
  NormalizedDailyEntry,
  NormalizedHourlyEntry,
  HourlyPlanRow,
  OperationWindowSummary,
  DailyPlanCard,
  SuitabilityLevel,
} from '@/types/planner';

const HOUR_KEYS = [['hourly'], ['forecast', 'hourly'], ['data', 'hourly'], ['payload', 'hourly']];
const DAILY_KEYS = [['daily'], ['forecast'], ['days'], ['data', 'daily'], ['data', 'forecast'], ['payload', 'daily'], ['payload', 'forecast'], ['payload', 'days']];

const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractArray = (source: any, paths: string[][]): any[] => {
  for (const path of paths) {
    let target = source;
    for (const part of path) {
      if (!target) break;
      target = target[part];
    }
    if (Array.isArray(target)) {
      return target;
    }
  }
  return [];
};

const normalizeTime = (value: string | number | undefined): string => {
  if (!value && value !== 0) return 'Unknown';
  const text = String(value);
  if (/^\d{1,2}:\d{2}/.test(text)) return text;
  if (/^\d{1,2}$/.test(text)) return `${text}:00`;
  return text;
};

const normalizeDate = (value: string | undefined): string => {
  if (!value) return 'Unknown Date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getRainProbability = (entry: any): number => {
  return (
    safeNumber(entry.rain_probability) ||
    safeNumber(entry.precipitation_chance) ||
    safeNumber(entry.rain_chance) ||
    safeNumber(entry.precipitation_probability)
  );
};

const getWindSpeed = (entry: any): number => {
  return safeNumber(entry.wind_speed || entry.windSpeed || entry.wind);
};

const getHumidity = (entry: any): number => {
  return safeNumber(entry.humidity);
};

const getTemperature = (entry: any): number => {
  return safeNumber(entry.temperature || entry.temp || entry.temp_c || entry.max_temp || entry.min_temp);
};

export const normalizeHourlyWeather = (response: any): NormalizedHourlyEntry[] => {
  if (!response) return [];
  const source = response.demoMode ? response.data : response.payload;
  if (!source) return [];

  const rawHourly = extractArray(source, HOUR_KEYS);

  return rawHourly.map((item: any) => ({
    time: normalizeTime(item.hour || item.time || item.timestamp || item.datetime),
    temperature: getTemperature(item),
    humidity: getHumidity(item),
    windSpeed: getWindSpeed(item),
    rainProbability: getRainProbability(item),
    condition: item.condition || item.description || item.text || undefined,
    uvIndex: safeNumber(item.uv_index || item.uvIndex),
  }));
};

export const normalizeDailyWeather = (response: any): NormalizedDailyEntry[] => {
  if (!response) return [];
  const source = response.demoMode ? response.data : response.payload;
  if (!source) return [];

  const rawDaily = extractArray(source, DAILY_KEYS);

  return rawDaily.map((item: any) => ({
    date: normalizeDate(item.date || item.day || item.datetime),
    maxTemp: safeNumber(item.max_temp || item.maxTemperature || item.temperature_high),
    minTemp: safeNumber(item.min_temp || item.minTemperature || item.temperature_low),
    humidity: getHumidity(item),
    windSpeed: getWindSpeed(item),
    rainProbability: getRainProbability(item),
    condition: item.description || item.condition || item.text || undefined,
    uvIndex: safeNumber(item.uv_index || item.uvIndex),
  }));
};

export const calculateHourlyAction = (entry: NormalizedHourlyEntry): HourlyPlanRow => {
  const rain = entry.rainProbability;
  const wind = entry.windSpeed;
  const humidity = entry.humidity;
  const temp = entry.temperature;

  let action = 'Monitor conditions';
  let suitability: SuitabilityLevel = 'Monitor';
  let reason = 'No specific condition detected.';

  if (rain > 70) {
    action = 'Delay fertilizer application';
    suitability = 'Unsafe';
    reason = 'Heavy rain risk expected.';
  } else if (wind > 20) {
    action = 'Avoid spraying due to wind';
    suitability = 'Unsafe';
    reason = 'Wind speed is too high for spraying.';
  } else if (rain > 60) {
    action = 'Inspect drainage and delay fertilizer';
    suitability = 'Caution';
    reason = 'Rain probability is elevated.';
  } else if (temp > 30) {
    action = 'Irrigate early or late';
    suitability = 'Caution';
    reason = 'High temperatures may stress crops.';
  } else if (humidity > 80) {
    action = 'Monitor fungal disease risk';
    suitability = 'Caution';
    reason = 'High humidity increases disease risk.';
  } else if (wind <= 10 && rain <= 30) {
    action = 'Good spraying window';
    suitability = 'Good';
    reason = 'Low wind and low rain risk.';
  } else if (rain <= 40 && wind <= 15) {
    action = 'Good general field work window';
    suitability = 'Good';
    reason = 'Moderate conditions for field work.';
  }

  return {
    ...entry,
    action,
    suitability,
    reason,
  };
};

export const calculateDailyRecommendation = (day: NormalizedDailyEntry): DailyPlanCard => {
  const { rainProbability, windSpeed, humidity, maxTemp } = day;
  let recommendation = 'General field work is acceptable.';
  let suitability: SuitabilityLevel = 'Good';

  if (rainProbability > 70) {
    recommendation = 'Delay fertilizer application and inspect drainage.';
    suitability = 'Unsafe';
  } else if (rainProbability > 60) {
    recommendation = 'Delay fertilizer application and monitor rainfall.';
    suitability = 'Caution';
  } else if (windSpeed > 20) {
    recommendation = 'Avoid spraying and use wind-safe operations.';
    suitability = 'Unsafe';
  } else if (maxTemp > 30) {
    recommendation = 'Irrigate early morning or evening.';
    suitability = 'Caution';
  } else if (humidity > 80) {
    recommendation = 'Monitor fungal disease risk closely.';
    suitability = 'Caution';
  } else if (rainProbability <= 30 && windSpeed <= 15) {
    recommendation = 'Good day for spraying and general field work.';
    suitability = 'Good';
  }

  return {
    ...day,
    recommendation,
    suitability,
  };
};

const chooseWindow = (
  hourly: NormalizedHourlyEntry[],
  condition: (entry: NormalizedHourlyEntry) => boolean
): string | undefined => {
  const windows: string[] = [];
  for (const entry of hourly) {
    if (condition(entry)) {
      windows.push(entry.time);
    }
  }
  if (!windows.length) return undefined;
  return `${windows[0]} - ${windows[windows.length - 1]}`;
};

export const getBestSprayingWindow = (hourly: NormalizedHourlyEntry[]): OperationWindowSummary => {
  const window = chooseWindow(hourly, (entry) => entry.windSpeed <= 10 && entry.rainProbability <= 30);
  if (window) {
    return {
      title: 'Best Spraying Window',
      status: 'Good',
      explanation: 'Low wind and low rain probability create a safe spraying window.',
      timeWindow: window,
      factor: 'Wind & Rain',
    };
  }

  const fallback = chooseWindow(hourly, (entry) => entry.windSpeed <= 15 && entry.rainProbability <= 40);
  return {
    title: 'Best Spraying Window',
    status: fallback ? 'Caution' : 'Unsafe',
    explanation: fallback
      ? 'Marginal conditions available for spraying with caution.'
      : 'No recommended spraying window detected today.',
    timeWindow: fallback,
    factor: 'Wind or Rain',
  };
};

export const getBestIrrigationWindow = (hourly: NormalizedHourlyEntry[]): OperationWindowSummary => {
  const morningWindow = chooseWindow(hourly, (entry) => {
    const hour = parseInt(entry.time.split(':')[0], 10);
    return hour >= 5 && hour <= 9 && entry.temperature > 25 && entry.rainProbability <= 50;
  });
  const eveningWindow = chooseWindow(hourly, (entry) => {
    const hour = parseInt(entry.time.split(':')[0], 10);
    return hour >= 17 && hour <= 20 && entry.temperature > 25 && entry.rainProbability <= 50;
  });

  if (morningWindow || eveningWindow) {
    return {
      title: 'Best Irrigation Window',
      status: 'Good',
      explanation: 'Choose cooler morning or evening hours when rain risk is lower.',
      timeWindow: morningWindow || eveningWindow,
      factor: 'Temperature & Rain',
    };
  }

  return {
    title: 'Best Irrigation Window',
    status: 'Caution',
    explanation: 'No ideal irrigation window found; monitor rain and temperature.',
    timeWindow: undefined,
    factor: 'Heat & Rain',
  };
};

export const getFertilizerWarning = (daily: NormalizedDailyEntry[]): OperationWindowSummary => {
  const today = daily[0];
  if (!today) {
    return {
      title: 'Fertilizer Warning',
      status: 'Monitor',
      explanation: 'No daily forecast available to determine fertilizer risk.',
      factor: 'Data availability',
    };
  }

  if (today.rainProbability > 70) {
    return {
      title: 'Fertilizer Warning',
      status: 'Unsafe',
      explanation: 'High rain risk; delay fertilizer application and protect nutrients.',
      factor: 'Rain probability',
    };
  }
  if (today.rainProbability > 60) {
    return {
      title: 'Fertilizer Warning',
      status: 'Caution',
      explanation: 'Moderate rain risk. Consider delaying fertilizer until conditions improve.',
      factor: 'Rain probability',
    };
  }

  return {
    title: 'Fertilizer Warning',
    status: 'Good',
    explanation: 'Low rain probability supports fertilizer application today.',
    factor: 'Rain probability',
  };
};

export const getHarvestingSuitability = (daily: NormalizedDailyEntry[]): OperationWindowSummary => {
  const today = daily[0];
  if (!today) {
    return {
      title: 'Harvesting Suitability',
      status: 'Monitor',
      explanation: 'No daily forecast available for harvesting guidance.',
      factor: 'Data availability',
    };
  }

  if (today.rainProbability > 50 || today.windSpeed > 20) {
    return {
      title: 'Harvesting Suitability',
      status: 'Caution',
      explanation: 'Moisture or wind may reduce harvesting efficiency.',
      factor: 'Rain or Wind',
    };
  }

  return {
    title: 'Harvesting Suitability',
    status: 'Good',
    explanation: 'Conditions are favorable for harvesting and crop handling.',
    factor: 'Rain & Wind',
  };
};

export const getDrainageWarning = (daily: NormalizedDailyEntry[]): OperationWindowSummary => {
  const today = daily[0];
  if (!today) {
    return {
      title: 'Drainage Warning',
      status: 'Monitor',
      explanation: 'No daily forecast available to assess drainage risk.',
      factor: 'Data availability',
    };
  }

  if (today.rainProbability > 70) {
    return {
      title: 'Drainage Warning',
      status: 'Unsafe',
      explanation: 'Heavy rain risk may cause waterlogging and drainage challenges.',
      factor: 'Rain probability',
    };
  }
  if (today.rainProbability > 50) {
    return {
      title: 'Drainage Warning',
      status: 'Caution',
      explanation: 'Rain risk may require monitoring drainage and water flow.',
      factor: 'Rain probability',
    };
  }

  return {
    title: 'Drainage Warning',
    status: 'Good',
    explanation: 'Drainage conditions look stable for today.',
    factor: 'Rain probability',
  };
};

export const mapHourlyToPlannerRows = (hourly: NormalizedHourlyEntry[]): HourlyPlanRow[] => {
  return hourly.map(calculateHourlyAction);
};

export const createDailyPlanCards = (daily: NormalizedDailyEntry[]): DailyPlanCard[] => {
  return daily.slice(0, 4).map(calculateDailyRecommendation);
};

export const buildChartData = (hourly: NormalizedHourlyEntry[]) => {
  return hourly.map((entry) => ({
    time: entry.time,
    temperature: entry.temperature,
    rain: entry.rainProbability,
  }));
};

export const getBadgeColor = (status: SuitabilityLevel): string => {
  switch (status) {
    case 'Good':
      return 'bg-green-100 text-green-800';
    case 'Caution':
      return 'bg-gold/20 text-gold';
    case 'Unsafe':
      return 'bg-red-100 text-alert';
    case 'Monitor':
      return 'bg-gray-100 text-forest';
    default:
      return 'bg-gray-100 text-forest';
  }
};
