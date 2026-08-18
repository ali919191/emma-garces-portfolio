export function isValidMediaKey(key: string) {
  if (typeof key !== "string" || key.length === 0 || key.length > 1024) return false;
  for (const character of key) {
    const code = character.charCodeAt(0);
    if (code < 32 || character === "\\" || character === "'" || character === "\"" || character === "<" || character === ">") return false;
  }
  return true;
}

export function canReadMedia(isPublic: boolean, isAdmin: boolean) {
  return isPublic || isAdmin;
}
