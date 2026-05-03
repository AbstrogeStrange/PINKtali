import { Router } from 'express';
import { 
  getMyPlaylists, createPlaylist, getPlaylist, 
  updatePlaylist, deletePlaylist, addPlaylistItem, 
  removePlaylistItem, reorderPlaylistItems 
} from '../../controllers/playlists.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getMyPlaylists);
router.post('/', authenticate, createPlaylist);
router.get('/:id', optionalAuth, getPlaylist);
router.patch('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);

router.post('/:id/items', authenticate, addPlaylistItem);
router.delete('/:id/items/:videoId', authenticate, removePlaylistItem);
router.patch('/:id/items/reorder', authenticate, reorderPlaylistItems);

export default router;
