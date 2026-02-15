import {
  Outlet,
  useMatches,
  useLocation,
  type UIMatch
} from "react-router-dom";

import SideBar from "@components/layouts/SideBar";
import NavBar from "@components/layouts/NavBar";
type RouteHandle = {
  title?: string;
};


export default function MasterLayout() {
  const matches = useMatches() as UIMatch<unknown, RouteHandle>[];
  const location = useLocation();

  const routeTitle = matches.filter((m) => m.handle?.title).at(-1)?.handle?.title ?? "NO TITLE";

  const stateTitle = location.state?.title;
  const title = stateTitle ?? routeTitle;
  return (
    <div className=" flex-col overflow-scroll">
      <NavBar title={title} />
      <div className="h-[92vh] flex overflow-hidden">
        <SideBar />
        { /* Main Body */}
        <div className="flex-1 overflow-scroll no-scrollbar p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
