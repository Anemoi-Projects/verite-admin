import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "ATKOrigins Admin Panel",
  description: "Admin panel to manege the content of the website aktorigins",
};

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}

      <Sidebar />
      <div className="overflow-y-auto w-full">{children}</div>
    </div>
  );
}
