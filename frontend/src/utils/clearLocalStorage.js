/**
 * Utility to clean up any corrupted localStorage data
 */
export function clearCorruptedLocalStorage() {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Check for malformed selectedBlog data
    const selectedBlog = localStorage.getItem('selectedBlog');
    if (selectedBlog === 'undefined' || selectedBlog === 'null') {
      localStorage.removeItem('selectedBlog');
    } else if (selectedBlog) {
      try {
        // Try to parse it
        JSON.parse(selectedBlog);
      } catch (e) {
        // If parsing fails, remove the corrupted data
        localStorage.removeItem('selectedBlog');
      }
    }
    
    // Check for malformed user data
    const user = localStorage.getItem('user');
    if (user === 'undefined' || user === 'null') {
      localStorage.removeItem('user');
    } else if (user) {
      try {
        // Try to parse it
        JSON.parse(user);
      } catch (e) {
        // If parsing fails, remove the corrupted data
        localStorage.removeItem('user');
      }
    }
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
}

export default clearCorruptedLocalStorage; 