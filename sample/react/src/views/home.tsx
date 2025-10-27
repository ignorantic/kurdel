export default function Home({ title, message }: { title: string; message: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <style>{`
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f6f9fc 0%, #e9f1ff 100%);
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #1e293b;
          }

          .card {
            background: #fff;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            border-radius: 16px;
            padding: 40px 50px;
            max-width: 480px;
            text-align: center;
            transition: transform 0.2s ease;
          }

          .card:hover {
            transform: translateY(-4px);
          }

          h1 {
            font-size: 2.2rem;
            margin-bottom: 1rem;
            color: #0f172a;
          }

          p {
            font-size: 1rem;
            color: #475569;
            margin-bottom: 1.5rem;
          }

          a {
            text-decoration: none;
            background: #2563eb;
            color: white;
            font-weight: 500;
            padding: 10px 20px;
            border-radius: 8px;
            transition: background 0.2s ease;
          }

          a:hover {
            background: #1d4ed8;
          }

          footer {
            margin-top: 2rem;
            font-size: 0.85rem;
            color: #94a3b8;
          }
        `}</style>
      </head>
      <body>
        <main className="card">
          <h1>{message}</h1>
          <p>
            This page is rendered using <strong>React</strong> templates 🎨
          </p>
          <a href="/user/1">Go to User page</a>
          <footer>Powered by Kurdel + React SSR</footer>
        </main>
      </body>
    </html>
  );
}
