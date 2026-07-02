import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-base">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
