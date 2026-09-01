import "./globals.css";

export const metadata = {
  title: "Gift Genie",
  description: "Let the genie grant you the perfect gift idea!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
