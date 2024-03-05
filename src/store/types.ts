import { StorageCore } from "@/domains/storage";

import { storage } from "./storage";

type GlobalStorageValues = (typeof storage)["values"];

export type ViewComponentProps = {
  storage: StorageCore<GlobalStorageValues>;
};
export type ViewComponent = (props: ViewComponentProps) => JSX.Element;
