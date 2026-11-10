export type Role = 'kam' | 'admin';
export interface User { id: number; email: string; name: string; role: Role }
export interface Account { id: number; name: string; segment: string; owner_user_id: number; status: 'active' | 'merged'; merged_into_id: number | null; truth_churn: number; truth_next_action: string | null; primary_id?: number }
export interface Alias { account_id: number; alias: string }
export interface Order { account_id: number; product_family: string; order_month: string; amount_krw: number }
export interface Activity {
  id: number; account_id: number; author_user_id: number; meeting_date: string; raw_note: string;
  ai_needs?: string | null; ai_products?: string[] | null; ai_competitors?: string[] | null; ai_complaints?: string | null; ai_next_step?: string | null; ai_next_contact_date?: string | null; ai_sentiment?: string | null; ai_method?: string | null; ai_confidence?: number | null;
  needs: string | null; products: string[] | null; competitors: string[] | null; complaints: string | null; next_step: string | null; next_contact_date: string | null; sentiment: string | null;
  status: 'draft' | 'confirmed'; corrected_field_count: number; verified: number; recorded_at: string; confirmed_at: string | null;
}
export interface Signal {
  id: number; source_type: 'disclosure' | 'news' | 'clinical' | 'ntis'; source_id: string; raw_org_name: string; account_id: number | null;
  signal_type: string; title: string; body: string; url: string | null; modality: string | null; stage: string | null; budget_krw: number | null;
  published_at: string; collected_at: string; summary: string; summary_method: 'ai' | 'rule';
}
export interface Lead {
  id: number; signal_id: number; org_name: string; matched_account_id: number | null; match_score: number; match_status: 'auto' | 'candidate' | 'new'; candidate_ids: number[];
  modality: string | null; stage: string | null; budget_krw: number | null; recommended_products: string[]; confidence: number;
  status: 'pending' | 'accepted' | 'rejected'; reject_reason: string | null; assignee_user_id: number; decided_by: number | null; decided_at: string | null; created_at: string;
}
export interface FeedItem { source_type: Signal['source_type']; source_id: string; org_name: string; type: string; title: string; body: string; url: string; published_at: string; modality?: string | null; stage?: string | null; budget_krw?: number | null }
export interface Dataset { users: (User & { password?: string })[]; accounts: Account[]; aliases: Alias[]; orders: Order[]; activities: Activity[]; signals: Signal[]; leads: Lead[]; feed: FeedItem[] }

export const PRODUCT_FAMILIES = ['세포배양 배지', '일회용 바이오리액터 백', '크로마토그래피 레진', '세포치료 배지', '자동화 세포처리 장비', '효소·정제 시약', '질량분석기', '전자현미경', '분광 분석기', '실험실 소모품'];
export const COMPETITORS = ['알파사이언스', '베타바이오텍', '감마라이프', '델타프로세스'];
export const SEGMENTS = ['CDMO', '바이오텍', '제약', '대학·연구소', '반도체·배터리'];
export const MODALITY_PRODUCTS: Record<string, string[]> = {
  '항체': ['세포배양 배지', '크로마토그래피 레진'],
  '세포·유전자치료': ['세포치료 배지', '자동화 세포처리 장비'],
  'mRNA·핵산': ['효소·정제 시약'],
  '백신': ['일회용 바이오리액터 백'],
  '저분자': ['질량분석기'],
  '소재·배터리': ['전자현미경', '분광 분석기'],
  '기타': ['실험실 소모품'],
};
export const SIGNAL_TYPES = ['공시', '수주', '증설', '인사', '임상', '과제', '경쟁사평가', '국산화'];
