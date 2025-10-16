import { Router } from 'express';
import { ExecutionService } from '../services/ExecutionService.js';

const router = Router();
const executionService = new ExecutionService();

// List all executions
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const executions = executionService.getAllExecutions(limit);
    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution by ID
router.get('/:id', async (req, res) => {
  try {
    const execution = executionService.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json(execution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
