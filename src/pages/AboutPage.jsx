import PageLayout from '../components/PageLayout'

export default function AboutPage({ onHome }) {
  return (
    <PageLayout title="About SwipeGame" badge="About" onHome={onHome}>
      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">What is SwipeGame?</h2>
        <p>
          SwipeGame is a fast-paced "this or that" game where you pick between two options. Play mixed questions covering everything from food and fun dilemmas to video moments, or jump into a Face Off mode for actresses, actors, cars, food, etc. In a Face Off, the option you pick stays on screen and a new challenger replaces the one you passed on, until one champion is left.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">How It Works</h2>
        <p>
          In every round, two choices are presented on screen. Tap, click, or swipe to pick your favorite. The winner moves forward to face new contenders in survivor-style tournament brackets until a single Ultimate Champion is crowned.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Built for Fun</h2>
        <p>
          SwipeGame was created purely for entertainment, lively debates, and discovering who tops the community charts. Every category features smooth animations, vibrant visuals, and immediate interactive feedback.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-baloo text-xl font-bold text-white">Have Ideas or Feedback?</h2>
        <p>
          We are always expanding categories and fine-tuning the gameplay. If you have suggestions or want to see a specific category added, reach out to us through our Feedback Hub or Contact page.
        </p>
      </section>
    </PageLayout>
  )
}
