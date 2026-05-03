import { Router } from 'express';
import { subscribe, unsubscribe, updateNotificationLevel, getFeed } from '../../controllers/subscriptions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/feed', getFeed);
router.post('/:channelId', subscribe);
router.delete('/:channelId', unsubscribe);
router.patch('/:channelId', updateNotificationLevel);

export default router;
