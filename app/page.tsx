import Beat from "@/components/Beat";
import Chart from "@/components/Chart";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Nav from "@/components/Nav";
import Positions from "@/components/Positions";
import Projects from "@/components/Projects";
import Resume from "@/components/Resume";
import Stage from "@/components/Stage";
import Toolkit from "@/components/Toolkit";

export default function Home() {
  return (
    <>
      <Stage />
      <Nav />
      <div className="above">
        <Hero />
        <Intro />
        <main>
          <Chart />

          <Beat
            id="measure"
            title="Healthy by every metric that existed"
            body="A pricing model can only be as trustworthy as the measurements pointed at it. Every chart the team had said this one was fine — because none of them were positioned to see the failure mode. Shadow-scoring it in parallel with production, and recording what it would have done, is what turned a question nobody could answer into one with an instrument behind it."
            stats={[
              { value: "0", label: "existing metrics could surface it" },
              { value: "Shadow", label: "scored beside production" },
            ]}
            tint="var(--color-cat-teal)"
          />

          <Beat
            id="parity"
            title="Zero output mismatches"
            body="Porting a data-science model into production means asserting the ported model still behaves like the original — and assertion is not proof. Every output was checked against the Python reference, and every point lands on the identity line. It became the company's first production ML model, and the template every data-science handoff has followed since."
            stats={[
              { value: "0", label: "output mismatches" },
              { value: "1st", label: "model live in production" },
            ]}
            tint="var(--color-cat-violet)"
          />

          <Beat
            id="enrichment"
            title="346 genes that mattered, out of 8,760"
            body="In brain tumour cells that resist treatment, 8,760 genes were measured and 346 showed a real difference. The strongest signal sat in the machinery controlling how cells divide. Every dot here is one of those genes."
            stats={[
              { value: "346", label: "genes with a real difference" },
              { value: "10", label: "biological processes flagged" },
            ]}
            side="right"
            tint="var(--color-cat-rose)"
          />

          <Positions />
          <Projects />
          <Toolkit />
          <Resume />
        </main>
        <Contact />
      </div>
    </>
  );
}
