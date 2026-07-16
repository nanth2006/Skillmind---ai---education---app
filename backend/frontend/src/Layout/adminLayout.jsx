import AdminSidebar from "../components/adminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />
      <Outlet />
    </div>
  );
}
