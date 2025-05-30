import { autorun, toJS } from "mobx";

export function makeLocalStorage<T extends object, K extends keyof T>(
  obj: T,
  prefix: string,
  keys: K[]
): void {
  if (typeof window == "undefined") return;

  for (const key of keys) {
    const localKey = `${prefix}_${String(key)}`;

    const valueStr = localStorage.getItem(localKey);

    if (!valueStr) {
      continue;
    }

    const value = JSON.parse(valueStr);
    obj[key] = value;
  }

  autorun(() => {
    for (const key of keys) {
      const localKey = `${prefix}_${String(key)}`;
      localStorage.setItem(localKey, JSON.stringify(toJS(obj[key])));
    }
  });
}
