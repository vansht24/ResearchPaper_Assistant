import "./globals.css";

export const metadata = {
  title: "Scholara — Research Paper Assistant",
  description: "RAG-powered Q&A for research papers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}