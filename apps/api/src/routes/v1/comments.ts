import { Router } from 'express';
import { updateComment, deleteComment, pinComment } from '../../controllers/comments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.patch('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/pin', authenticate, pinComment);

export default router;
