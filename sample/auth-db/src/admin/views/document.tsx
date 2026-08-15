import type { ReactNode } from 'react';

export default function Document({ children, title }: { children: ReactNode; title: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>{title}</title>
        <link rel="stylesheet" href="/client.css" />
      </head>
      <body>
        <div id="root">{children}</div>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  );
}
