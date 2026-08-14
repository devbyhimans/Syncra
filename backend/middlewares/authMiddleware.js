/**
 * protect - Clerk authentication middleware.
 * Verifies the Clerk session token and attaches `req.userId` for downstream controllers.
 * All protected routes must pass through this middleware before reaching a controller.
 */
export const protect = async (req, res, next) => {
  try {
    // req.auth() is the Clerk-Express function — always call it as a function.
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach userId directly to req so controllers don't each re-call req.auth()
    req.userId = userId;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};