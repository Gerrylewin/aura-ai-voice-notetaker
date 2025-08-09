
import React, { useEffect } from 'react';

export function GoogleAuthCallback() {
  useEffect(() => {
    // Extract the authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      // Send the code to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code
      }, window.location.origin);
      window.close();
    } else if (error) {
      // Handle error
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error
      }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing authentication...</h2>
        <p className="text-gray-600">This window will close automatically.</p>
      </div>
    </div>
  );
}
