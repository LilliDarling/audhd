import { AllRoles } from "@/helpers";

export enum NavType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export interface Item {
  name: string;
  description?: string;
  page?: string;
  type?: NavType;
  icon: string;
  current: boolean;
  roles?: AllRoles[];
  items: Item[];
}
