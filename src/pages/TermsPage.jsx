import PageLayout from '../components/PageLayout'

export default function TermsPage({ onHome }) {
  return (
    <PageLayout title="Terms of Service" badge="Legal" onHome={onHome}>
      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">For-Fun Use Only</h2>
        <p>
          SwipeGame is provided strictly for entertainment and personal fun. The game allows users to choose between contenders in informal head-to-head face-offs. Matchup outcomes, voting statistics, and champion rankings are for recreational amusement and debate only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">No Guarantees</h2>
        <p>
          SwipeGame is provided on an "as is" and "as available" basis without warranties or guarantees of any kind, whether express or implied. We do not guarantee continuous, uninterrupted, or error-free operation of the website, its games, or its third-party media embeds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Intellectual Property & Media Ownership</h2>
        <p>
          All photographs, imagery, celebrity likenesses, trademarks, and embedded video clips displayed within SwipeGame belong to their respective copyright holders and owners. SwipeGame does not claim ownership of any third-party media. All media is referenced solely for identification, commentary, and transformative non-commercial entertainment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Acceptable Use</h2>
        <p>
          By using SwipeGame, you agree not to attempt to disrupt or abuse the service, exploit its forms, or interfere with other players' enjoyment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Changes to These Terms</h2>
        <p>
          We may update or revise these terms periodically. Continued use of SwipeGame constitutes your acceptance of any revisions.
        </p>
      </section>
    </PageLayout>
  )
}
