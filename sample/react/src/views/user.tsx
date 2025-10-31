export default function User({ user }: { user: { id: string; name: string } }) {
  return (
    <main className="card">
      <h1>{user.name}</h1>
      <p>
        User ID: <span className="id">{user.id}</span>
      </p>
      <a href="/">← Back to Home</a>
      <footer>Powered by Kurdel + React SSR</footer>
    </main>
  );
}
