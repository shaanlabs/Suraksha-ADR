import { useEffect } from "react";
import { Link } from "react-router-dom";

type InfoPageName = "about" | "methodology" | "privacy" | "contact";

const content: Record<InfoPageName, { kicker: string; title: string; intro: string; sections: { title: string; text: string }[] }> = {
  about: {
    kicker: "About Suraksha",
    title: "Protecting patient safety through better reporting.",
    intro: "Suraksha is a training workspace for learning how suspected adverse drug reactions are organised and reviewed.",
    sections: [
      { title: "Our purpose", text: "We present fictional, de-identified pharmacovigilance cases in a clear Yellow Card and MedWatch-style format." },
      { title: "Training only", text: "Suraksha is designed for education. It does not provide medical advice, diagnosis, causality decisions, or regulatory submissions." },
    ],
  },
  methodology: {
    kicker: "Methodology",
    title: "How the training records are prepared.",
    intro: "Each record follows a consistent, transparent process and preserves unknown source information.",
    sections: [
      { title: "Source to form", text: "Case details such as dose, route, reaction, seriousness, onset, dechallenge, rechallenge, and reporter qualification are organised from the source data." },
      { title: "Known vs unknown", text: "Where a detail is absent, the form marks it unknown rather than inventing an answer. A training date is used only where the source contains an onset interval." },
      { title: "No causality claim", text: "The forms keep seriousness separate from severity and do not assess whether a medicine caused the reaction." },
    ],
  },
  privacy: {
    kicker: "Privacy",
    title: "No personal or clinical data is collected.",
    intro: "Suraksha uses fully fictional and de-identified training cases.",
    sections: [
      { title: "No submissions", text: "The website does not send report forms to a regulatory authority or clinical team." },
      { title: "Local downloads", text: "PDF downloads are generated in your browser. Do not enter real patient information into this training workspace." },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "About this training resource.",
    intro: "For questions about the Suraksha website or training pack, use the project owner’s contact channel for this deployment.",
    sections: [
      { title: "Need help?", text: "Start by reviewing the About and Methodology pages, then open a case to explore its mandatory fields and source gaps." },
      { title: "Reporting a real reaction", text: "A real suspected adverse reaction should be reported to a qualified healthcare professional or the appropriate national medicines authority." },
    ],
  },
};

export function InfoPage({ page }: { page: InfoPageName }) {
  const info = content[page];

  useEffect(() => {
    document.title = `${info.title} — Suraksha`;
  }, [info]);

  return (
    <div className="wrap page info-page">
      <section className="info-hero">
        <p className="kicker">{info.kicker}</p>
        <h1>{info.title}</h1>
        <p className="lede">{info.intro}</p>
      </section>
      <div className="info-grid">
        {info.sections.map((section) => (
          <section className="info-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </div>
      <Link to="/" className="btn btn-primary info-back">Explore training cases</Link>
    </div>
  );
}
