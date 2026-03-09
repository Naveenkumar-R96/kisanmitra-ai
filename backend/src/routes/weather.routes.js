import express from 'express';
const router = express.Router();
router.get('/test', (req, res) => res.json({ route: 'weather', status: 'ok' }));
export default router;
