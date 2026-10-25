import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes.js';
import { SubmissionRoutes } from '../modules/submission/submission.routes.js';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/submissions',
    route: SubmissionRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
