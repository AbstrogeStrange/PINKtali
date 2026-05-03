import { Router } from 'express';
import { 
  initiateUpload, completeUpload, getUploadStatus, 
  updateVideo, deleteVideo, getStreamUrl, uploadThumbnail 
} from '../../controllers/videos.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import multer from 'multer';

import { getComments, postComment } from '../../controllers/comments.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload/initiate', authenticate, initiateUpload);
router.post('/upload/complete', authenticate, completeUpload);

router.get('/:id/upload-status', getUploadStatus);
router.get('/:id/stream', optionalAuth, getStreamUrl);

// Engagement
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, postComment);
router.get('/:id/share-data', getShareData);

router.patch('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/thumbnail', authenticate, upload.single('thumbnail'), uploadThumbnail);

export default router;
