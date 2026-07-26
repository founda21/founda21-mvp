import { Wordmark } from "@/components/wordmark";
import { BackLink } from "@/components/back-link";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <BackLink href="/" label="Home" />
          <Wordmark className="text-2xl" />
        </div>

        <div className="flex flex-col gap-6 text-navy/80 text-sm leading-relaxed">
          <div>
            <p className="text-navy/50 text-xs uppercase tracking-wide font-semibold">Founda Technologies</p>
            <h1 className="text-navy text-2xl font-bold mb-1">
              The Founda21 Standard Provenance, Methodology and Acknowledgement Statement
            </h1>
            <p className="text-navy/60 text-xs">Issued by Founda Technologies, Johannesburg, South Africa</p>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">1. Purpose of this document</h2>
            <p>
              This document is presented to every founder and every institution before they make use of
              the Founda21 platform. It explains where the Founda21 Standard comes from, how its
              assessment criteria were formed, what role technology plays in applying them, and how
              disagreements with an assessment outcome are handled. By proceeding past this document,
              you acknowledge that you have read and understood it.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">2. What the Founda21 Standard is</h2>
            <p>
              The Founda21 Standard is a structured founder-readiness assessment developed by Founda
              Technologies. It evaluates a venture across twenty-one checkpoints, organised into three
              stages, against five dimensions: Substance, Evidence, South African Reality Fit, Rigour and
              Coherence, and Investor Credibility. Its purpose is to give founders a credible, consistent
              benchmark of readiness, and to give funding institutions a consistent basis for identifying
              ventures that meet the criteria those institutions themselves already apply.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">3. Where the criteria come from</h2>
            <p>
              The criteria in the Founda21 Standard were not invented by an artificial-intelligence
              system, and they were not invented by Founda Technologies in the abstract. They were
              derived through structured desk research conducted by Founda Technologies into the
              publicly stated funding criteria, application requirements, and selection behaviour of real
              funding institutions operating in South Africa and across the African continent. Funders do
              not hide what they look for. They publish it: on their websites, in their application
              guidelines, in their annual and impact reports, in interviews with business media, and in
              ecosystem research reports. The Founda21 Standard consolidates those publicly stated
              requirements into a single, consistent assessment framework.
            </p>
            <p>The research base includes, among others, the following categories of institutions and sources:</p>
            <p>
              <span className="font-semibold text-navy">Enterprise and Supplier Development (ESD) fund managers.</span>{" "}
              For example, Edge Growth (manager of funds including the Vumela ESD Fund, the ASISA ESD
              Fund and the Action ESD Fund) publicly states that it funds early-stage, post-revenue
              South African businesses with high growth potential, and that selected SMEs must
              demonstrate a strong team with relevant experience, a proven track record, growth potential
              and job-creation impact. Its published guidance asks founders directly: what problem are
              you solving that customers will pay for; is your offering aligned with market trends that
              attract funders; are you ready for the accountability that funding brings.
            </p>
            <p>
              <span className="font-semibold text-navy">Venture capital firms and accelerators.</span>{" "}
              For example, Knife Capital (manager of KNF Ventures and the Grindstone Accelerator)
              publicly describes its focus as innovation-driven ventures with proven traction that have
              achieved product-market fit in a beachhead market, and publishes pitch requirements
              covering the problem, total addressable market, competitor differentiation, team
              credentials, upward momentum in key metrics, revenue drivers, and summarised financial
              projections including revenue, costs and EBITDA.
            </p>
            <p>
              <span className="font-semibold text-navy">Development finance institutions and government funders.</span>{" "}
              The Small Enterprise Finance Agency (SEFA) publicly requires legal registration (CIPC), tax
              compliance, detailed financial records, a viable business plan, demonstrable financial
              viability, a clear growth strategy, and job-creation or social-impact potential. The
              Industrial Development Corporation (IDC) requires a well-researched business plan making a
              compelling case for funding, with job creation as an explicit evaluation measure. The
              National Empowerment Fund (NEF) requires the founder&apos;s direct involvement in the
              business and evaluates against industrial policy alignment. Weak or incomplete business
              plans are publicly documented as a leading cause of rejection across these institutions.
            </p>
            <p>
              <span className="font-semibold text-navy">African ecosystem research and business media.</span>{" "}
              Published ecosystem research consistently confirms the same criteria. Co-creation Hub
              (CcHUB) reported that over 60% of rejected African startup pitches in 2024 lacked robust
              financial projections or clear go-to-market strategies. Briter Bridges&apos; African
              Startups Insight Report found that over 55% of startups that raised early-stage funding
              between 2018 and 2021 failed to secure follow-on investment due to unsustainable business
              models or poor market readiness. Disrupt Africa and the Startup Graveyard Report identify
              governance as one of the most critical differentiators between ventures that survive and
              those that fail. Current African investment analysis consistently reports that capital now
              flows to ventures with clean legal structures, verifiable traction, sound unit economics
              and transparent governance.
            </p>
            <p>
              Every dimension of the Founda21 Standard maps to this evidence base. Substance and Evidence
              reflect funders&apos; demand for verifiable traction and documentation over narrative. South
              African Reality Fit reflects the sector, compliance and market conditions that South
              African funders explicitly state in their mandates. Rigour and Coherence reflects the
              documented finding that inconsistent financial logic and weak business plans are leading
              causes of rejection. Investor Credibility reflects the governance, team and track-record
              requirements that funders publish.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">4. The role of technology in assessment</h2>
            <p>
              Founda Technologies is transparent about this distinction: the criteria of the Founda21
              Standard are the product of human research into real institutional behaviour; the
              application of those criteria to each submission is performed by an assessment engine that
              uses artificial intelligence. The AI did not decide what matters to funders; the research
              did. The AI&apos;s role is to apply the research-derived criteria to every submission
              consistently, so that every founder is measured against the same standard, without
              variation in mood, relationship or bias between one reviewer and another. Consistency of
              application is itself a feature funders require of any credible standard.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">5. Independence and non-affiliation</h2>
            <p>
              The institutions and publications named in this document are cited as sources of publicly
              available information that informed the research behind the Founda21 Standard. Founda
              Technologies is not affiliated with, endorsed by, or acting on behalf of any of these
              institutions, and nothing in this document should be read as implying that any named
              institution has reviewed, approved or adopted the Founda21 Standard. All references are to
              information those institutions have made public themselves.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">6. What an assessment outcome does and does not mean</h2>
            <p>
              A Founda21 score is a structured measurement of readiness against research-derived
              criteria. It is not a promise of funding, an investment recommendation, or a prediction of
              any specific institution&apos;s decision. Each funding institution applies its own mandate
              and makes its own decisions. Equally, a lower score is not a judgement of a founder&apos;s
              worth or potential; it is a measurement, at a point in time, of how a venture&apos;s
              presented evidence compares to what funders publicly state they require. Scores can and do
              improve as ventures build evidence.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">7. Disagreements and questions about an outcome</h2>
            <p>
              Founda Technologies stands behind the research basis of the Standard, and wants founders
              and institutions to be able to question or challenge an assessment outcome. If you
              disagree with an assessment, or with any criterion in the Standard, write to us at{" "}
              <a className="underline" href="mailto:foundarsa@gmail.com">
                foundarsa@gmail.com
              </a>{" "}
              with your reasons. Here&apos;s what you can expect:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>
                We read every message and respond in writing, explaining how the relevant criterion is
                grounded in the research base described in this document.
              </li>
              <li>
                Where a message identifies a genuine error, gap or outdated assumption in the Standard,
                we update it. The Standard is versioned, so material changes are recorded over time.
              </li>
              <li>
                The research base is reviewed from time to time against what funding institutions
                currently publish, so the Standard keeps reflecting what real funders actually require.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">8. Acknowledgement</h2>
            <p>
              By proceeding to use the Founda21 platform, you acknowledge that: (a) you have read this
              document; (b) you understand that the Founda21 Standard&apos;s criteria are derived from
              research into the publicly stated requirements of real funding institutions, and that
              artificial intelligence is used to apply those criteria consistently, not to invent them;
              (c) you understand that an assessment outcome is not a funding decision or guarantee; and
              (d) you understand how to make representations if you disagree with an outcome.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-navy/10 pt-4">
            <h2 className="text-navy font-semibold text-base">References (publicly available sources)</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-navy/70 text-xs">
              <li>Edge Growth: Funding Criteria; Funds Overview; Edge Action ESD Fund; SME Hub. edgegrowth.com</li>
              <li>Knife Capital: Funding &amp; pitch guidelines; company profile (KNF Ventures, Grindstone Accelerator). knifecap.com</li>
              <li>Small Enterprise Finance Agency (SEFA): funding requirements and eligibility criteria. sefa.org.za and published guides (SME South Africa; FundingWay)</li>
              <li>Industrial Development Corporation (IDC): application requirements and evaluation measures. idc.co.za; Wesgro key programmes and incentives</li>
              <li>National Empowerment Fund (NEF): mandate and funding criteria. nefcorp.co.za; Vuk&apos;uzenzele (Government of South Africa)</li>
              <li>Co-creation Hub (CcHUB): &quot;How African Startups Can Win Investors in 2025&quot; (rejected-pitch analysis). cchub.africa</li>
              <li>Briter Bridges: African Startups Insight Report 2024 (follow-on funding analysis)</li>
              <li>Disrupt Africa: &quot;Funding readiness is the real test of a startup&apos;s strength&quot; (2025); Startup Graveyard Report (governance findings). disruptafrica.com</li>
              <li>AVCA: African Private Capital Activity Report (investor composition and behaviour)</li>
            </ul>
          </section>

          <p className="text-navy/60 text-xs border-t border-navy/10 pt-4">
            © Founda Technologies. This document is informational and forms part of the platform&apos;s
            terms of use. It is not legal advice and does not replace independent legal review.
          </p>
        </div>
      </div>
    </div>
  );
}
