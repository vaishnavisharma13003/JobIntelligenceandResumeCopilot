import "./globals.css";

export const metadata = {
  title: "AI Job Copilot",
  description: "AI Job Intelligence & Resume Copilot - local GenAI demo project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
