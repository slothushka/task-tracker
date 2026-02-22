import { Router } from 'express';
import { protect } from '../middleware/auth';
import { validate, rules } from '../middleware/validate';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';

const router = Router();

// All task routes require a valid JWT
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validate({ title: rules.title(), status: rules.status() }), createTask);

router.route('/:id')
  .put(validate({ status: rules.status() }), updateTask)
  .delete(deleteTask);

export default router;
