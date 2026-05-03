import { Router } from 'express';
import { search, getSuggestions } from '../../controllers/search.controller';
import { optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/', optionalAuth, search);
router.get('/suggestions', getSuggestions);

export default router;
