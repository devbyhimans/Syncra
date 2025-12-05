export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}