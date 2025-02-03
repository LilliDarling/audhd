import { Item, AllRoles, NavType } from "@/helpers";

export const primary_navigation: Item[] = [
  {
    page: "Page1",
    name: "Care Taker",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-hand-holding-heart",
    current: false,
    roles: [AllRoles.SUPER_ADMIN, AllRoles.CARE_TAKER],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Removed Users",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Archived Users",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab4",
        name: "Add New",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page2",
    name: "Therapist",
    description:
      "Manage vendors, check their expertise and product/service list",
    icon: "fa-solid fa-shield-heart",
    current: false,
    roles: [AllRoles.SUPER_ADMIN, AllRoles.THERAPIST],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Roles",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Groups",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page3",
    name: "Health Provider",
    description: "Manage events, schedule and invite people",
    icon: "fa-solid fa-user-doctor",
    current: false,
    roles: [AllRoles.SUPER_ADMIN, AllRoles.HEALTH_PROVIDER],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Roles",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Groups",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab4",
        name: "Api Keys",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page4",
    name: "Insurance Provider",
    description: "Manage your community, find people to chat with or mentor",
    icon: "fa-solid fa-users", // users-rectangle
    current: false,
    roles: [AllRoles.SUPER_ADMIN, AllRoles.INSURANCE_PROVIDER],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Roles",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page5",
    name: "Privacy & Sharing",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-file-shield", // user-lock, shield-halved
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Roles",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Groups",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page6",
    name: "Booking & Scheduling",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-calendar-check",
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Model",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page7",
    name: "Billing & Payments",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-circle-dollar-to-slot", // regular fa-money-bill-1, solid: money-check-dollar, dollar-sign, hand-holdinig-dollar
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
    ],
  },
];

export const secondary_navigation = [
  {
    page: "Page8",
    type: NavType.SECONDARY,
    name: "Support Hub",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-headphones-simple",
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Model",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Training",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page9",
    type: NavType.SECONDARY,
    name: "Subscription History",
    description: "Manage users, check their roles and connections",
    icon: "fa-solid fa-money-bill-trend-up",
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
      {
        page: "Tab2",
        name: "Model",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab3",
        name: "Training",
        current: false,
        icon: "",
        items: [],
      },
      {
        page: "Tab4",
        name: "Inference",
        current: false,
        icon: "",
        items: [],
      },
    ],
  },
  {
    page: "Page10",
    name: "Report Issue",
    description: "Manage navigators, check their expertise and client list",
    icon: "fa-solid fa-bug",
    current: false,
    roles: [...Object.values(AllRoles)],
    items: [
      {
        page: "Tab1",
        name: "Overview",
        current: true,
        icon: "",
        items: [],
      },
    ],
  },
];

export const user_navigation = [
  {
    name: "Profile",
    icon: "fa-regular fa-user",
  },
  {
    name: "Preferences",
    icon: "fa-solid fa-sliders",
  },
];
