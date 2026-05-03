import { Router } from 'express';
import { 
  getChannel, updateChannel, uploadBanner, 
  getChannelVideos, getChannelShorts, getChannelPlaylists, 
  getChannelCommunity, getChannelAbout 
} from '../../controllers/channels.controller';
import { authenticate } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Me routes
router.patch('/me', authenticate, updateChannel);
router.post('/me/banner', authenticate, upload.single('banner'), uploadBanner);

// Public routes
router.get('/:handle', getChannel);
router.get('/:handle/videos', getChannelVideos);
router.get('/:handle/shorts', getChannelShorts);
router.get('/:handle/playlists', getChannelPlaylists);
router.get('/:handle/community', getChannelCommunity);
router.get('/:handle/about', getChannelAbout);

export default router;
