const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
	//  Get the JSON Web Token from the header
	const token = req.header("x-auth-token");

	// Check if no token
	if (!token) {
		res.status(401).json({ msg: "No token. Authorization denied." });
	}

	// Verify the token
	try {
		const decoded = jwt.verify(token, config.get("jwtSecret"));

		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: "Token is not valid." });
	}
};
