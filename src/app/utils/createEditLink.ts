// app/utils/createEditLink.ts
// ^ Adjust path if you keep utils elsewhere (e.g., src/utils)

export function getRoomIdFromPath(pathname: string): string | null {
  // Matches /room/:id or /room/:id/edit
  const m = pathname.match(/\/room\/([^/]+)(?:\/edit)?(?:\/|$)/i);
  return m ? m[1] : null;
}

/**
 * Create an absolute URL string for /room/:roomId (view link) based on current window.location.
 * Preserves the current query string. SSR-safe (returns empty string when not in browser).
 */
export function createViewLinkFromLocation(roomId?: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);

  const effectiveRoomId = roomId || getRoomIdFromPath(url.pathname);
  if (!effectiveRoomId) return "";

  url.pathname = `/room/${effectiveRoomId}`;
  // keep existing search params
  return url.toString();
}

/**
 * Create an absolute URL string for /room/:roomId/edit (edit link) based on current window.location.
 * Preserves the current query string. SSR-safe (returns empty string when not in browser).
 */
export function createEditLinkFromLocation(roomId?: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);

  const effectiveRoomId = roomId || getRoomIdFromPath(url.pathname);
  if (!effectiveRoomId) return "";

  // if already /edit, leave it; otherwise add /edit
  if (!/\/room\/[^/]+\/edit(?:\/|$)/i.test(url.pathname)) {
    url.pathname = `/room/${effectiveRoomId}/edit`;
  } else {
    // normalize to ensure we aren't on a sub-path beyond /edit
    url.pathname = `/room/${effectiveRoomId}/edit`;
  }
  return url.toString();
}
