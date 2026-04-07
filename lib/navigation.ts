export type WorkspaceNavigationItem = {
  href: string;
  labelKo: string;
  labelEn: string;
};

export const workspaceNavigationItems: WorkspaceNavigationItem[] = [
  {
    href: "/dashboard",
    labelKo: "대시보드",
    labelEn: "Dashboard",
  },
  {
    href: "/trades",
    labelKo: "매매일지",
    labelEn: "Trades",
  },
  {
    href: "/reviews",
    labelKo: "수익 및 성과",
    labelEn: "Reviews",
  },
  {
    href: "/settings",
    labelKo: "설정",
    labelEn: "Settings",
  },
];
