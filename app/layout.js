import "./globals.css";
import "../index.css";
import { Agentation } from "agentation";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Bol",
  description: "A local-first voice-agent creator",
  icons: {
    icon: "/LOGO.png",
    shortcut: "/LOGO.png",
    apple: "/LOGO.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark font-sans">
      <body className="font-sans bg-black text-white antialiased">
        <TooltipProvider>
          {children}
          {process.env.NEXT_PUBLIC_SHOW_AGENTATION === "true" && <Agentation />}
        </TooltipProvider>
      </body>
    </html>
  );
}
