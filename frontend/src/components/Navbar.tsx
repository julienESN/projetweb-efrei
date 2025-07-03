import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">Secure Docs</Link>
      <div className="flex gap-4">
        <Link to="/documents" className="hover:underline">Documents</Link>
        <Link to="/profile" className="hover:underline">Profil</Link>
      </div>
    </nav>
  );
}
