/**
 * Redirect to a hostname without www
 *
 * @param {Object} event - The request event
 * @returns {Object} The modified request event
 */
function handler(event) {
  var host = event.request.headers.host.value;

  if (!host.startsWith('www.')) {
    return event.request;
  }

  return {
    statusCode: 301,
    statusDescription: 'Found',
    headers: {
      'strict-transport-security': { value: 'max-age=31536000; includeSubdomains; preload'},
      'location': { value: `https://${host.replace(/^www\./, '')}${event.request.uri}` },
    },
  };
}
