import './globals.css';

export const metadata = {
  title: 'Convivia 24 — The After-Hours Forum',
  description: 'A community-driven nightlife and culture platform focused on real conversations.',
  keywords: 'nightlife, forum, culture, community, after-hours, london nights, berlin nights',
  openGraph: {
    title: 'Convivia 24 — The After-Hours Forum',
    description: 'A community-driven nightlife and culture platform focused on real conversations.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/convivialogo.png" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

