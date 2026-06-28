export function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s(.+)/g, '\n$1\n')
    .replace(/^[-•]\s/gm, '  • ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
