import Link from "next/link";

import { ROUTER_PATH } from "../../../constants";

const NAV_DATA = [
  {
    title: "대시보드",
    path: ROUTER_PATH.HOME,
  },
  {
    title: "뉴스",
    path: ROUTER_PATH.NEWS,
  },
  {
    title: "정확도",
    path: ROUTER_PATH.ACCURACY,
  },
  {
    title: "설정",
    path: ROUTER_PATH.SETTINGS,
  },
  {
    title: "API docs",
    path: ROUTER_PATH.API_DOCS,
  },
];

export const NavButton = () => {
  const highlightStyle =
    "text-sm font-semibold text-green-600 underline-offset-3 transition-colors duration-200 bg-green-50 p-2 rounded-sm hover:text-green-700 hover:bg-green-100 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-300 active:bg-green-200";
  const normalStyle = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className='flex items-center gap-4'>
      {NAV_DATA.map((nav) => (
        <Link
          key={nav.path}
          href={nav.path}
          className={nav.path === ROUTER_PATH.API_DOCS ? highlightStyle : normalStyle}
        >
          {nav.title}
        </Link>
      ))}
    </div>
  );
};
