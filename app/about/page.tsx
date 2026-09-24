import { Lightbulb, 
  BadgeCheck, 
  Handshake, 
  ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from "@/components/motion-reveal";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  const values = [
    [Lightbulb, 
      "Innovation", 
      "We explore better ways to solve meaningful business problems."],
    [BadgeCheck, 
      "Quality", 
      "We care about thoughtful details, robust engineering, and lasting value."],
    [Handshake, 
      "Customer Success", 
      "We measure our work by the outcomes it creates for our clients."],
    [ShieldCheck, 
      "Reliability", 
      "We communicate clearly, honour commitments, and build dependable systems."]
  ];
  return (
    <>
      <section className="section-space border-b border-slate-200">
        <MotionReveal className="container-shell">
          <p className="eyebrow">About Rennovex</p>
          <h1 className="display-title mt-5 max-w-4xl">Technology should make your business clearer, stronger, and easier to grow.</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">Rennovex Technology is a digital solutions company
            helping organisations build credible online experiences, automate processes, and make smarter technology decisions.</p>
        </MotionReveal>
      </section>
      <section className="section-space">
        <div className="container-shell grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading 
            eyebrow="Our story" 
            title="Created to close the gap between ideas and dependable execution."/>
            <div className="prose-copy mt-7">
              <p>Many businesses know what they want to improve but struggle to find a technical partner who understands both the
                business goal and the engineering required to achieve it.</p>
            <p>Rennovex exists to bridge that gap. We combine structured discovery, modern design, and maintainable development to
              deliver useful digital solutions, not technology for technology’s sake.</p>
            </div>
          </div>
          <MotionStagger className="grid gap-5">
            <MotionItem>
              <div className="glass rounded-2xl p-7">
              <p className="eyebrow">Mission</p>
              <p className="mt-4 text-xl leading-8">To help organisations use thoughtful technology to improve operations, serve
                customers, and unlock sustainable growth.</p>
            </div>
            </MotionItem>
            <MotionItem>
              <div className="glass rounded-2xl p-7">
              <p className="eyebrow">Vision</p>
              <p className="mt-4 text-xl leading-8">To become a trusted African technology partner recognised for useful innovation,
                dependable delivery, and lasting client success.</p>
            </div>
            </MotionItem>
          </MotionStagger>
        </div>
      </section>
      <section className="section-space border-t border-slate-200 bg-slate-50">
        <div className="container-shell">
          <SectionHeading 
          eyebrow="Core values" 
          title="The principles behind every engagement."/>
          <MotionStagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(([Icon, title, text]: any) => (
              <MotionItem key={title}>
                <div className="glass h-full rounded-2xl p-6">
                  <Icon className="text-sky-700" />
                  <h3 className="mt-7 text-lg font-bold">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>
    </>
  );
}
