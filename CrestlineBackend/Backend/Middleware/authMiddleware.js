const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'crestline_vault_secure_core_key_2026'
      );
      
      req.user = {
        ...decoded,
        _id: decoded._id || decoded.id || decoded.userId
      };

      console.log(`🔑 Token verified successfully for User ID: ${req.user._id}`);
      next(); 
    } catch (error) {
      console.error("JWT Verification Matrix Failed:", error.message);
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No authorization token found." });
  }
};

module.exports = { protect };