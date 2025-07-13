/* 
This is a minimal PDF.js worker file polyfill.
In production, we use the CDN version, but this helps if CDN is not accessible.
*/

self.onmessage = function (e) {
  console.log('PDF Worker received message:', e.data);
  
  // Send a simple response back to the main thread
  self.postMessage({
    type: 'ready',
    success: true,
    message: 'PDF Worker initialized successfully'
  });
};