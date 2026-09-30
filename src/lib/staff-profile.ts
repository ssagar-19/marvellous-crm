export const ACTIVE_STAFF_PROFILE_KEY = "marvellous-active-staff-profile";
export const ACTIVE_STAFF_PROFILE_COOKIE = "marvellous_profile_id";

export function readActiveStaffProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_STAFF_PROFILE_KEY);
}

export function setActiveStaffProfileId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_STAFF_PROFILE_KEY, id);
  document.cookie = `${ACTIVE_STAFF_PROFILE_COOKIE}=${encodeURIComponent(id)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("marvellous-profile-changed"));
}

export function clearActiveStaffProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_STAFF_PROFILE_KEY);
  document.cookie = `${ACTIVE_STAFF_PROFILE_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("marvellous-profile-changed"));
}
