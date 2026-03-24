/**
 * Async Handler Utility Wrapper
 *
 * Wraps async route handlers to automatically catch errors
 * and pass them to the global error handler middleware
 *
 * This eliminates the need for try-catch blocks in every controller
 */

/**
 * Wraps an async function and catches any errors
 * @param {Function} fn - Async function to wrap (controller handler)
 * @returns {Function} - Express middleware that catches errors
 *
 * @example
 * // Without asyncHandler (verbose)
 * router.get('/:id', async (req, res, next) => {
 *   try {
 *     const user = await getUserById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // With asyncHandler (clean)
 * router.get('/:id', asyncHandler(async (req, res) => {
 *   const user = await getUserById(req.params.id);
 *   res.json(user);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
