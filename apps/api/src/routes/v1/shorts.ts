import { Router } from 'express';
import { getShortsFeed, searchMusic } from '../../controllers/shorts.controller';
import { optionalAuth, authenticate } from '../../middleware/auth';

const router = Router();

router.get('/feed', optionalAuth, getShortsFeed);
router.get('/music/search', authenticate, searchMusic);

export default router;
