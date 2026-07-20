import { Exo_2 } from "next/font/google";

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-print",
  display: "swap",
});

export const metadata = {
  title: "Document View",
};

export default function PrintLayout({ children }) {
  return (
    <div className={`${exo2.variable} bg-gray-100 min-h-screen`} style={{ fontFamily: "var(--font-print), sans-serif" }}>
      {children}
    </div>
  );
}
