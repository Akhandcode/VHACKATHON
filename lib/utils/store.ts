import { create } from 'zustand';
import { Post } from '@/types/agent';

interface AppState {
  activePostId: string | null;
  hoveredPostId: string | null;
  posts: Post[];
  isAgentActive: boolean;
  agentStatusText: string;
  setActivePostId: (id: string | null) => void;
  setHoveredPostId: (id: string | null) => void;
  setPosts: (posts: Post[]) => void;
  prependPost: (post: Post) => void;
  setAgentStatus: (active: boolean, text: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePostId: null,
  hoveredPostId: null,
  posts: [],
  isAgentActive: true,
  agentStatusText: 'LISTENING & SCANNINIG FEEDS',
  setActivePostId: (id) => set({ activePostId: id }),
  setHoveredPostId: (id) => set({ hoveredPostId: id }),
  setPosts: (posts) => set({ posts }),
  prependPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts.filter((p) => p.id !== post.id)],
    })),
  setAgentStatus: (active, text) =>
    set({ isAgentActive: active, agentStatusText: text }),
}));
