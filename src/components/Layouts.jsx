import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="relative flex h-screen flex-col bg-gray-100">
      {/* Fixed Navbar (full width) */}
      <header className="fixed top-0 left-0 right-0 h-15 z-50 bg-white shadow-sm">
        <Navbar />
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 bg-gray-100"> {/* Added bg-gray-100 here */}
        {/* Fixed Sidebar */}
        <aside className="fixed top-15 left-0 bottom-0 w-24 z-40 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 ml-24 overflow-y-auto bg-gray-100"> {/* Added bg-gray-100 here */}
          <div className="max-w-4xl mx-auto p-6 min-h-full bg-gray-100"> {/* And here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;