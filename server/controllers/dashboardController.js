import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

/** Dashboard controller - read-only statistics. */

/** GET /api/dashboard/stats */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.status(200).json({ data: stats });
});
