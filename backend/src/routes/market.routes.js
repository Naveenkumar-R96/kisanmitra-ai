import express from 'express';
const router = express.Router();
router.get('/test', (req, res) => res.json({ route: 'market', status: 'ok' }));
export default router;
