import { Router } from 'express';
import { getHomeFeed, getTrending } from '../../controllers/feed.controller';
import { optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/home', optionalAuth, getHomeFeed);
router.get('/trending', getTrending);

export default router;
