export function setSession(token: string) {
  localStorage.setItem("userToken", token);
}

export function destroySession() {
  localStorage.removeItem("userToken");
}
