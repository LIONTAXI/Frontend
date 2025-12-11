const TOKEN_KEY = "token";

export function setAuthToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log("인증 토큰 저장 성공");
  } catch (error) {
    console.error("토큰 저장 실패:", error);
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("토큰 로드 실패:", error);
    return null;
  }
}

export function getCurrentUserId() {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error("토큰 형식이 올바르지 않습니다.");
        }

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);

        const userId = decoded.userId;

        if (!userId) {
            console.error("userId 필드가 없습니다.");
            return null;
        }
        return parseInt(userId, 10); 

    } catch (error) {
         return null;
    }
}