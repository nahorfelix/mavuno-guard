export type TreeHealthBreakdown = {
  healthyTrees?: number;
  needingCare?: number;
  needingReplacement?: number;
};

export type NormalizedTreeAnalysis = {
  demoMode: boolean;
  treeCount: number;
  densityPerAcre: number;
  canopyCoverage: number;
  confidenceScore: number;
  healthBreakdown: TreeHealthBreakdown;
  observations: string[];
  recommendations: string[];
  overlayImageUrl?: string;
};

export type NormalizedTreeHistoryItem = {
  date: string;
  location?: string;
  county?: string;
  treeCount: number;
  canopyCoverage: number;
  status: string;
};

export type NormalizedTreeQuota = {
  demoMode: boolean;
  plan: string;
  scansUsed: number;
  scansRemaining: number;
  monthlyLimit?: number;
  supported: boolean;
  message?: string;
};

export type NormalizedForestryCount = {
  demoMode: boolean;
  treeCount: number;
  densityPerAcre: number;
  canopyCoverage: number;
  confidenceScore: number;
  supported: boolean;
  message?: string;
};
