import { Router } from 'express';
import { likeTarget, removeLike, getLikeStatus } from '../../controllers/likes.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, likeTarget);
router.delete('/:targetType/:targetId', authenticate, removeLike);
router.get('/:targetType/:targetId/status', optionalAuth, getLikeStatus);

export default router;
