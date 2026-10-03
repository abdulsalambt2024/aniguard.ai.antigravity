
export enum UserRole {
  FARMER = 'FARMER',
  PET_OWNER = 'PET_OWNER',
  VETERINARIAN = 'VETERINARIAN',
  RESEARCHER = 'RESEARCHER',
  ADMIN = 'ADMIN'
}

export enum AppLanguage {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
  TAMIL = 'ta',
  GUJARATI = 'gu',
  TELUGU = 'te',
  HINGLISH = 'hinglish'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  region: string;
  language: AppLanguage;
  coords?: Coordinates;
}

export interface AdminUser {
  id: string;
  username: string;
  isDemo: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalListings: number;
  activeOutbreaks: number;
  aiScansProcessed: number;
}

export interface HealthAnalysisResult {
  conditionName: string;
  confidence: string;
  severity: 'MILD' | 'URGENT' | 'EMERGENCY';
  description: string;
  treatmentPlan: {
    title: string;
    actions: string[];
    immediateSteps: string[];
    advice: string;
  };
  outbreakContext?: {
    isRegionalRisk: boolean;
    nearbyCases: number;
    alertLevel: string;
  };
}

export interface DiseaseAnalysisResult {
  diseaseName: string;
  confidence: string;
  description: string;
  organicTreatment: {
    title: string;
    materials: string[];
    steps: string[];
    preparationTime: string;
    applicationMethod: string;
  };
  costComparison: {
    chemicalEstimate: string;
    organicEstimate: string;
    savings: string;
  };
}

export interface HoldSellAnalysis {
  decision: 'HOLD' | 'SELL';
  estimatedPriceNow: string;
  projectedPriceFuture: string;
  biologicalRiskScore: number;
  feedCostImpact: string;
  riskFactors: string[];
  reasoning: string;
}

export interface ProfitReport {
  netProfit: string;
  expenseBreakdown: {
    feed: string;
    vet: string;
    labor: string;
    other: string;
  };
  efficiencyScore: number;
  recommendations: string[];
}

export interface BioMaterialListing {
  id: string;
  farmerName: string;
  materialName: string;
  quantity: number;
  region: string;
  coords: Coordinates;
  contactInfo: string;
  availableDate: string;
}

export interface ConversationMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  farmerName: string;
  researcherName: string;
  listingName: string;
  messages: ConversationMessage[];
  lastMessage: string;
}

export interface MarketAdvisoryResult {
  cropName: string;
  demandStatus: string;
  priceTrend: string;
  advisory: string;
  reasoning: string;
  risks: string[];
  recommendations: string[];
  sources?: Array<{web: {uri: string, title: string}}>;
}

// Added VetClinic interface for vet search results
export interface VetClinic {
  name: string;
  uri: string;
  address?: string;
}

// Added ChatMessage interface for Agri-Advisor chat messages
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
