export default function PrivacyPolicy() {
  return (
    <div
      style={{
        background: "#0D0D14",
        minHeight: "100vh",
        padding: "40px 24px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#8888A8", fontSize: 13, marginBottom: 32 }}>Last updated: July 2026</p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>What we collect</h2>
        <p style={{ color: "#CCCCCC", fontSize: 14, lineHeight: 1.7 }}>
          Pulse collects your email address for authentication, and academic data you manually
          enter (attendance, assignments, quizzes, exams, expenses). Location data is collected
          only when you enable location sharing, and is only ever shared with friends you&apos;ve
          accepted.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>How we store it</h2>
        <p style={{ color: "#CCCCCC", fontSize: 14, lineHeight: 1.7 }}>
          All data is stored securely on Supabase, access-controlled by row-level security
          policies so you can only read your own data (and, for locations, data your accepted
          friends choose to share). We never sell your data to third parties.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Location sharing</h2>
        <p style={{ color: "#CCCCCC", fontSize: 14, lineHeight: 1.7 }}>
          Location sharing is off by default and fully opt-in. When enabled, your approximate
          position updates periodically and is visible only to friends you&apos;ve mutually
          accepted — never to the public or to Pulse&apos;s operators for any purpose beyond
          serving the feature. You can turn sharing off at any time from Friends or Settings, and
          your last known location is cleared when you do.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Delete your data</h2>
        <p style={{ color: "#CCCCCC", fontSize: 14, lineHeight: 1.7 }}>
          You can delete your account and all associated data from the Profile page at any time.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Contact</h2>
        <p style={{ color: "#CCCCCC", fontSize: 14 }}>Questions? Email: pulse.bennett@gmail.com</p>
      </section>
    </div>
  );
}
