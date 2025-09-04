// WebP detection script
(function() {
  // Check if browser supports WebP
  function checkWebP(callback) {
    var img = new Image();
    img.onload = function() {
      var result = (img.width > 0) && (img.height > 0);
      callback(result);
    };
    img.onerror = function() {
      callback(false);
    };
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  }

  // Add webp or no-webp class to HTML element
  checkWebP(function(support) {
    if (support) {
      document.documentElement.classList.add('webp');
    } else {
      document.documentElement.classList.add('no-webp');
    }
  });
})();