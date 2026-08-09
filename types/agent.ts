export interface AgentPersona {
  name: string;
  domain: string;
}

export interface AgentState {
  id: string;
  agentId: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  agentId: string;
  postId: string;
  text: string;
  rationale: string;
  sources: string[];
  embedding?: number[];
  createdAt: string;
}

export interface ScoreMatrix {
  noveltyScore: number;
  relevanceScore: number;
  personaAlignmentScore: number;
  overallScore: number;
}

export interface RejectedTopic {
  id: string;
  agentId: string;
  topicTitle: string;
  rejectionReason: string;
  scoreMatrix: ScoreMatrix;
  createdAt: string;
}

export interface RawCandidateTopic {
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt?: string;
}

export interface FeedResponse {
  posts: Array<{
    id: string;
    createdAt: string;
    text: string;
    rationale: string;
    sources: string[];
  }>;
}

export interface AgentInitRequest {
  persona: AgentPersona;
}

export interface AgentInitResponse {
  agentId: string;
}

export interface WorkerTickResponse {
  status: 'SUCCESS' | 'NO_NEW_POSTS' | 'ERROR';
  agentId: string;
  scrapedCount: number;
  rejectedCount: number;
  publishedPostId?: string;
  message?: string;
}
