export interface Podcast {
  userId: string;
  podcastId: string;
  createdAt: string;
  name: string;
  hostName: string;
  description: string;
  isPublic: boolean;
  coverImageUrl?: string;
}
