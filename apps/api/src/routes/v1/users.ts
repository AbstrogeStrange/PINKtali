import { Router } from 'express';
import multer from 'multer';
import { 
  getMe, updateMe, uploadAvatar, deleteMe, 
  getNotifications, readNotification, readAllNotifications, 
  getWatchHistory, clearWatchHistory, getLikedVideos, getSubscriptions 
} from '../../controllers/users.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/me', deleteMe);

router.get('/me/notifications', getNotifications);
router.patch('/me/notifications/read-all', readAllNotifications);
router.patch('/me/notifications/:id/read', readNotification);

router.get('/me/watch-history', getWatchHistory);
router.delete('/me/watch-history', clearWatchHistory);

router.get('/me/liked-videos', getLikedVideos);
router.get('/me/subscriptions', getSubscriptions);

export default router;
