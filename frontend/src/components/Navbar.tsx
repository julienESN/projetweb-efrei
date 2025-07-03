/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  let isAdmin = false;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      isAdmin = decoded.role === "ADMIN";
    } catch {}
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">Secure Docs</Link>
      <div className="flex gap-4">
        <Link to="/documents" className="hover:underline">Documents</Link>
        {isAdmin && (
          <>
            <Link to="/admin/documents" className="hover:underline">Admin Docs</Link>
            <Link to="/admin/users" className="hover:underline">Utilisateurs</Link>
          </>
        )}
        <Link to="/profile" className="hover:underline">Profil</Link>
      </div>
    </nav>
  );
}
