export interface PhoneClickBranchSummary {
  branchId: string;
  branchTitle: string;
  cityName: string;
  citySlug: string;
  phone: string;
  totalClicks: number;
  dailyClicks: number;
  weeklyClicks: number;
  monthlyClicks: number;
  lastClickedAt: string | null;
  whatsappClicks?: number;
}

export interface AnalyticsData {
  activeUsers: number;
  dailyVisits: number;
  weeklyVisits: number;
  monthlyVisits: number;
  phoneClicksTotal: number;
  phoneClicksToday: number;
  phoneClicksThisWeek: number;
  phoneClicksThisMonth: number;
  whatsappClicksTotal: number;
  whatsappClicksToday: number;
  whatsappClicksThisWeek: number;
  whatsappClicksThisMonth: number;
  phoneClicksByBranch: PhoneClickBranchSummary[];
  dailyBreakdown?: number[];
}
