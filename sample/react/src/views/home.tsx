export default function Home({ message }: { title: string; message: string }) {
  return (
    <main className="card">
      <h1>{message}</h1>
      <p>
        This page is rendered using <strong>React</strong> templates 🎨
      </p>
      <a href="/user/1">Go to User page</a>
      <footer>Powered by Kurdel + React SSR</footer>
    </main>
  );
}
