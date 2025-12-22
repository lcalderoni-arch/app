let authReady = false;

export function setAuthReady(value) {
    authReady = value;
    window.dispatchEvent(new Event("auth-ready-changed"));
}

export function isAuthReady() {
    return authReady;
}
