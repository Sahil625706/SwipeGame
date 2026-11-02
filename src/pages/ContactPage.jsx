import PageLayout from '../components/PageLayout'
import FeedbackForm from '../components/FeedbackForm'

const CONTACT_PLACEHOLDER = "How can we help?\n- Questions or business inquiries\n- Collaborations or partnerships\n- Content or copyright concerns"

export default function ContactPage({ onHome }) {
  return (
    <PageLayout title="Contact Us" badge="Contact" onHome={onHome}>
      <section className="space-y-2">
        <p>
          Have a question, category recommendation, or want to report an issue? Send us a direct message below. We read every submission.
        </p>
      </section>

      <div className="pt-2">
        <FeedbackForm isPage={true} placeholder={CONTACT_PLACEHOLDER} />
      </div>
    </PageLayout>
  )
}
