export const getUserIdFromToken = (token) => {
    if (!token) return null;
    
    if (token.includes('|')) {
      return parseInt(token.split('|')[0]);
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || payload.id;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  };