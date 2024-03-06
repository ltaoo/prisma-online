import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  content: "",
  files: [] as {
    filename: string;
    content: string;
  }[],
  settings: {
    vim: false,
  },
  layout: [50, 50],
};
const key = "global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  values: (() => {
    const prev = e ? JSON.parse(e) : {};
    return {
      ...DEFAULT_CACHE_VALUES,
      ...prev,
    };
  })(),
  client: globalThis.localStorage,
});
