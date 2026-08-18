export function canReadMedia(isPublic: boolean, isAdmin: boolean) {
  return isPublic || isAdmin;
}
