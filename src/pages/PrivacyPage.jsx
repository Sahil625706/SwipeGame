import PageLayout from '../components/PageLayout'

export default function PrivacyPage({ onHome }) {
  return (
    <PageLayout title="Privacy Policy" badge="Legal" onHome={onHome}>
      <p className="text-xs text-slate-400 font-medium -mt-2 mb-2">
        Last updated: November 3, 2026
      </p>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Overview</h2>
        <p>
          Your privacy matters to us. SwipeGame is designed to be played and enjoyed without requiring accounts, logins, passwords, or personal profiles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Votes and anonymous data</h2>
        <p>
          When you pick an option, the game adds one to an anonymous vote counter for that matchup, so it can show the percentage of players who chose each side and the total number of votes. We do not store your name, email or account details with your votes, and we do not identify who cast them.
        </p>
        <p>
          Vote counts are stored with a third-party database provider, Supabase.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Feedback & Contact Messages</h2>
        <p>
          When you send feedback or reach out via our contact forms, your message is transmitted securely through Formspree (formspree.io). We only receive the content of the message you type. We do not require or collect your email address or personal contact details anywhere on this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Browser Storage & Sound Settings</h2>
        <p>
          We use your browser's local storage (localStorage) to remember basic preferences across visits. Specifically, your sound setting (whether click and celebration sounds are muted or unmuted) and your cookie banner acknowledgment are stored locally on your device. This data is never sent to our servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">YouTube Embeds & Third-Party Media</h2>
        <p>
          Certain comparison questions may include embedded video clips hosted by YouTube. When these videos load or play, YouTube (Google LLC) may place its own cookies and collect usage data according to Google's Privacy Policy. You can manage YouTube cookies directly through your browser or Google account privacy settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Advertising</h2>
        <p>
          SwipeGame does not currently show advertisements. If we introduce advertising in the future, we will update this policy before any ads appear to explain which partners are involved and how cookies are used.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Questions?</h2>
        <p>
          If you have any questions about this Privacy Policy, please reach out via our Contact page or the Feedback Hub in the main menu.
        </p>
      </section>
    </PageLayout>
  )
}
