/**
 * Fine Scheduler - Cron Job
 * PEZY-414: Mark fines as OUTDATED daily at midnight
 *
 * Scheduled Task:
 * - Runs daily at 00:00 (midnight)
 * - Finds all unpaid fines issued 14+ days ago
 * - Updates their status from 'unpaid' to 'outdated'
 * - Logs the operation for audit trail
 */

import cron from 'node-cron';
import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError } from '../utils/errors.js';

/**
 * Calculate date 14 days ago
 * Used to determine which fines are overdue
 * Fines issued 14+ days ago are marked as outdated
 *
 * @returns {string} Date in YYYY-MM-DD format
 */
const getFourteenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return date.toISOString().split('T')[0];
};

/**
 * Mark fines as outdated (manually triggered)
 * Updates all unpaid fines issued 14+ days ago to 'outdated' status
 *
 * @returns {Promise<Object>} Result with count of updated fines
 * @throws {AppError} If database operation fails
 */
export const markFinesAsOutdated = async () => {
  try {
    const supabase = getSupabaseClient();
    const fourteenDaysAgo = getFourteenDaysAgo();

    console.log(`[CRON] Marking fines as outdated (issued before ${fourteenDaysAgo})...`);

    // Update all unpaid fines issued more than 14 days ago
    const { data, error } = await supabase
      .from('fines')
      .update({ status: 'outdated', updated_at: new Date().toISOString() })
      .eq('status', 'unpaid')
      .lt('issue_date', fourteenDaysAgo)
      .select('id');

    if (error) {
      throw new AppError(
        `Failed to mark fines as outdated: ${error.message}`,
        500
      );
    }

    const count = data?.length || 0;
    console.log(`[CRON] Successfully marked ${count} fines as outdated`);

    return {
      success: true,
      count,
      timestamp: new Date().toISOString(),
      message: `${count} fines marked as outdated`,
    };
  } catch (error) {
    console.error('[CRON] Error marking fines as outdated:', error.message);
    throw error;
  }
};

/**
 * Initialize fine scheduler
 * Sets up cron job to run daily at 00:00 (midnight)
 * Marks unpaid fines issued 14+ days ago as outdated
 *
 * Cron expression: '0 0 * * *'
 * - 0: minute (0)
 * - 0: hour (00:00 = midnight)
 * - *: day of month (every day)
 * - *: month (every month)
 * - *: day of week (every day)
 *
 * @returns {Object} Cron task object
 *
 * @example
 * initializeFineScheduler();
 * // Logs: [CRON] Fine scheduler initialized (runs daily at 00:00)
 */
export const initializeFineScheduler = () => {
  // Schedule daily at midnight (00:00)
  const task = cron.schedule('0 0 * * *', async () => {
    console.log(
      `[CRON] Starting fine status update job at ${new Date().toISOString()}`
    );

    try {
      const result = await markFinesAsOutdated();
      console.log(`[CRON] ✅ Job completed: ${result.message}`);
    } catch (error) {
      console.error(`[CRON] ❌ Job failed: ${error.message}`);
    }
  });

  // Log that scheduler is active
  console.log('[CRON] Fine scheduler initialized (runs daily at 00:00)');

  return task;
};

/**
 * Get next scheduled execution time
 * Useful for monitoring/dashboard
 *
 * @returns {Object} Info about next execution
 */
export const getNextScheduledExecution = () => {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  const hoursUntilNextRun = Math.round(
    (next.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  return {
    currentTime: now.toISOString(),
    nextExecution: next.toISOString(),
    hoursUntil: hoursUntilNextRun,
    schedule: 'Daily at 00:00 (midnight)',
  };
};

/**
 * Health check for scheduler
 * Verify cron task is running
 *
 * @param {Object} task - Cron task object from initializeFineScheduler()
 * @returns {Object} Status information
 */
export const getFineSchedulerStatus = (task) => {
  return {
    isRunning: task && !task._destroyed,
    schedule: 'Daily at 00:00',
    nextExecution: getNextScheduledExecution(),
    description: 'Marks unpaid fines issued 14+ days ago as outdated',
  };
};

export default {
  markFinesAsOutdated,
  initializeFineScheduler,
  getNextScheduledExecution,
  getFineSchedulerStatus,
};
