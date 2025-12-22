// src/api/tokenStore.js
let accessToken = sessionStorage.getItem("accessToken") || null;

export function setAccessToken(token) {
    accessToken = token || null;

    if (token) sessionStorage.setItem("accessToken", token);
    else sessionStorage.removeItem("accessToken");
}

export function getAccessToken() {
    return accessToken || sessionStorage.getItem("accessToken");
}

export function clearAccessToken() {
    accessToken = null;
    sessionStorage.removeItem("accessToken");
}
