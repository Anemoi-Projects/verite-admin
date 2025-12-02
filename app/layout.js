import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "AKTOrigins-Admin Panel",
  description: "Admin panel to manege the content of the website aktorigins",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` antialiased`}>
        <ThemeProvider attribute={"class"} enableSystem defaultTheme="dark">
          <Toaster position={"top-right"} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
