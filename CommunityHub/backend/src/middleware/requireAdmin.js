function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to access this endpoint"
    });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can perform this action"
    });
  }

  next();
}

module.exports = requireAdmin;