import axios from 'axios';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.streamverse.app/api/v1';

export const api = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

// Attach auth token to every request
api.interceptors.request.use(config => {
  const token = storage.getString('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  r => r,
  async error => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        storage.set('accessToken', data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api.request(error.config);
      } catch {
        storage.delete('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

// Feed
export const fetchHomeFeed   = (after?: string) => api.get('/feed/home',   { params: { after, limit: 20 } }).then(r => r.data.data);
export const fetchShortsFeed = (after?: string) => api.get('/shorts/feed', { params: { after, limit: 10 } }).then(r => r.data.data);
export const fetchSubsFeed   = (after?: string) => api.get('/feed/subscriptions', { params: { after } }).then(r => r.data.data);

// Video
export const fetchVideo   = (id: string) => api.get(`/videos/${id}`).then(r => r.data.data);
export const fetchChannel = (handle: string) => api.get(`/channels/${handle}`).then(r => r.data.data);
export const fetchChannelVideos = (handle: string, after?: string) => api.get(`/channels/${handle}/videos`, { params: { after } }).then(r => r.data.data);

// Search
export const searchVideos = (q: string) => api.get('/search', { params: { q } }).then(r => r.data.data);

// Engagement
export const likeTarget   = (targetType: string, targetId: string, value: 1 | -1) => api.post('/likes', { targetType, targetId, value });
export const unlikeTarget = (targetType: string, targetId: string) => api.delete(`/likes/${targetType}/${targetId}`);
export const fetchComments = (videoId: string, page = 1) => api.get(`/videos/${videoId}/comments`, { params: { page } }).then(r => r.data.data);
export const postComment   = (videoId: string, body: string, parentId?: string) => api.post(`/videos/${videoId}/comments`, { body, parentId });

// Subscriptions
export const subscribe   = (channelId: string) => api.post(`/subscriptions/${channelId}`);
export const unsubscribe = (channelId: string) => api.delete(`/subscriptions/${channelId}`);

// Playlists
export const fetchLibrary  = () => api.get('/playlists/me').then(r => r.data.data);
export const fetchPlaylist = (id: string) => api.get(`/playlists/${id}`).then(r => r.data.data);

// Push token
export const registerPushToken = (token: string, platform: 'ios' | 'android') =>
  api.post('/users/me/push-token', { token, platform });
