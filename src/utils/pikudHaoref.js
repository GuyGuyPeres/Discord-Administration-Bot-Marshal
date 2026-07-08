const pikudHaoref = require('pikud-haoref-api');
const { HttpsProxyAgent } = require('https-proxy-agent');

// The Home Front Command API only responds to requests from within Israel.
// If the bot is hosted elsewhere, PIKUD_HAOREF_PROXY routes requests through an Israeli proxy.
const proxyAgent = process.env.PIKUD_HAOREF_PROXY ? new HttpsProxyAgent(process.env.PIKUD_HAOREF_PROXY) : null;

function getActiveAlerts() {
  return new Promise((resolve, reject) => {
    const options = proxyAgent ? { httpsAgent: proxyAgent } : {};
    pikudHaoref.getActiveAlerts((error, alerts) => {
      if (error) return reject(error);
      resolve(alerts);
    }, options);
  });
}

module.exports = { getActiveAlerts };
