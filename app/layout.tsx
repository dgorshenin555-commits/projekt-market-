import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "ПроектМаркет — Маркетплейс проектных услуг",
  description: "Платформа для заказа проектной документации. Заказчики размещают задания, проектировщики откликаются.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
