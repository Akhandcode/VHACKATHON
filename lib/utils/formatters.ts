export function formatUTC(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch (e) {
    return isoString;
  }
}

export function truncateText(text: string, maxLength: number = 140): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
