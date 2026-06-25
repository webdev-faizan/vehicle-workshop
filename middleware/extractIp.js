const requestIp = require("request-ip");

// Extracts real client IP even behind proxies / load balancers
const extractIp = (req, res, next) => {
  let ip = requestIp.getClientIp(req);

  // Normalise IPv6 loopback → 127.0.0.1
  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

  // Strip IPv6-mapped IPv4 prefix
  if (ip && ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  req.clientIp = ip || "0.0.0.0";
  next();
};

module.exports = extractIp;
