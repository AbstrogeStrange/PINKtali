import { Router } from 'express';
import { createPost, votePoll } from '../../controllers/community.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, createPost);
router.post('/:id/poll-vote', authenticate, votePoll);

export default router;
