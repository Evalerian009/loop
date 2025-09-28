// utils/debounce.ts
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 500
): T {
  let timer: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}