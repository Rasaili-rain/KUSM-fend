import {
  Outlet,
  useMatches
} from "react-router-dom";

import SideBar from "@components/layouts/SideBar";
import NavBar from "@components/layouts/NavBar";

export default function MasterLayout () {
  const matches = useMatches();
  const title = matches
    .filter((m) => m.handle?.title)
    .at(-1).handle?.title ?? "NO TITLE";

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex flex-col w-screen overflow-hidden">
        <NavBar title={title}/>

        { /* Main Body */ }
        <div className="flex-1 overflow-auto no-scrollbar p-2">
          <Outlet />
        </div>
      </div>

    </div>
  );
};
