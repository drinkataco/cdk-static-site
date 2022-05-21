/**
 * Adds some default security headers to every request
 *
 * @param {Object} event - The response event
 * @returns {Object} The modified response event
 */
function handler(event) {
  var response = event.response;
  var headers = response.headers;

  // Set HTTP security headers
  headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubdomains; preload'}; 
  headers['x-content-type-options'] = { value: 'nosniff'}; 
  headers['x-frame-options'] = {value: 'DENY'}; 
  headers['x-xss-protection'] = {value: '1; mode=block'}; 

  // Return the response to viewers
  return response;
}
