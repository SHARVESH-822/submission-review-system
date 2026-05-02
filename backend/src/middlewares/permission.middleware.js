const PERMISSIONS = require('../config/permission.matrix');

const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rolePermissions = PERMISSIONS[userRole];

    if (!rolePermissions || !rolePermissions.includes(permission)) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = { checkPermission };