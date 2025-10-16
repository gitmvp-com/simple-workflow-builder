import { Router } from 'express';
import { WorkflowService } from '../services/WorkflowService.js';
import { ExecutionService } from '../services/ExecutionService.js';

const router = Router();
const workflowService = new WorkflowService();
const executionService = new ExecutionService();

// List all workflows
router.get('/', async (req, res) => {
  try {
    const workflows = workflowService.getAllWorkflows();
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const workflow = workflowService.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create workflow
router.post('/', async (req, res) => {
  try {
    const workflow = workflowService.createWorkflow(req.body);
    res.status(201).json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const workflow = workflowService.updateWorkflow(req.params.id, req.body);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const deleted = workflowService.deleteWorkflow(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute workflow
router.post('/:id/execute', async (req, res) => {
  try {
    const workflow = workflowService.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const execution = await executionService.executeWorkflow(workflow, req.body);
    res.json(execution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
