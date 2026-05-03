import { Request, Response } from 'express';
import { prisma, VideoStatus, Visibility } from '@streamverse/db';
import { searchService } from '../services/search.service';

// Simple in-process cache for suggestions
const suggestionCache = new Map<string, { data: string[]; exp: number }>();

const getCachedSuggestions = (key: string) => {
  const e = suggestionCache.get(key);
  if (!e || e.exp < Date.now()) return null;
  return e.data;
};
const setCachedSuggestions = (key: string, data: string[]) => {
  suggestionCache.set(key, { data, exp: Date.now() + 600_000 }); // 10 min
};

export const search = async (req: Request, res: Response) => {
  const { 
    q, 
    type, 
    uploadDate, 
    duration,
    sort = 'relevance',
    features,
    page = 1,
    limit = 20 
  } = req.query;

  if (!q) return res.status(400).json({ success: false, error: 'q is required' });

  const skip = (Number(page) - 1) * Number(limit);

  // --- Build date range filter ---
  let dateFrom: Date | undefined;
  const now = Date.now();
  if (uploadDate === 'hour')  dateFrom = new Date(now - 3_600_000);
  if (uploadDate === 'today') dateFrom = new Date(now - 86_400_000);
  if (uploadDate === 'week')  dateFrom = new Date(now - 7 * 86_400_000);
  if (uploadDate === 'month') dateFrom = new Date(now - 30 * 86_400_000);
  if (uploadDate === 'year')  dateFrom = new Date(now - 365 * 86_400_000);

  // --- Duration filter (in seconds) ---
  let durationMin: number | undefined;
  let durationMax: number | undefined;
  if (duration === 'short')  { durationMin = 0;    durationMax = 240; }
  if (duration === 'medium') { durationMin = 240;  durationMax = 1200; }
  if (duration === 'long')   { durationMin = 1200; }

  // --- Type filter ---
  let typeFilter: any = undefined;
  if (type === 'video')   typeFilter = 'LONG_FORM';
  if (type === 'short')   typeFilter = 'SHORT';

  try {
    // Try Elasticsearch first
    const esResults = await searchService.searchVideos(q as string, Number(limit), skip);
    return res.status(200).json({ success: true, data: { items: esResults, source: 'elasticsearch' } });
  } catch {
    // Fallback to Prisma full-text
    const queryStr = String(q);

    const videos = await prisma.video.findMany({
      where: {
        status: VideoStatus.LIVE,
        visibility: Visibility.PUBLIC,
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(dateFrom ? { publishedAt: { gte: dateFrom } } : {}),
        ...(durationMin !== undefined ? { durationSeconds: { gte: durationMin } } : {}),
        ...(durationMax !== undefined ? { durationSeconds: { lte: durationMax } } : {}),
        OR: [
          { title: { contains: queryStr, mode: 'insensitive' } },
          { description: { contains: queryStr, mode: 'insensitive' } },
          { tags: { has: queryStr } }
        ]
      },
      include: { channel: true },
      orderBy: sort === 'date'      ? { publishedAt: 'desc' }
               : sort === 'viewCount' ? { viewCount: 'desc' }
               : sort === 'rating'    ? { likeCount: 'desc' }
               : { viewCount: 'desc' }, // relevance default
      skip,
      take: Number(limit)
    });

    return res.status(200).json({ success: true, data: { items: videos, source: 'db' } });
  }
};

export const getSuggestions = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || String(q).length < 2) return res.status(200).json({ success: true, data: { suggestions: [] } });

  const key = `suggestions:${String(q).toLowerCase().trim()}`;
  const cached = getCachedSuggestions(key);
  if (cached) return res.status(200).json({ success: true, data: { suggestions: cached } });

  try {
    const suggestions = await searchService.getSuggestions(String(q));
    setCachedSuggestions(key, suggestions);
    return res.status(200).json({ success: true, data: { suggestions } });
  } catch {
    // Fallback: simple DB prefix match
    const results = await prisma.video.findMany({
      where: {
        status: VideoStatus.LIVE,
        title: { startsWith: String(q), mode: 'insensitive' }
      },
      select: { title: true },
      take: 10
    });
    const suggestions = results.map(r => r.title);
    setCachedSuggestions(key, suggestions);
    return res.status(200).json({ success: true, data: { suggestions } });
  }
};
