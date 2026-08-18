"use client";

import { useEffect, useMemo, useState } from "react";

type EngineId = "start" | "reset" | "switch" | "yes" | "discover" | "share";
type Criterion = "brand" | "audience" | "media" | "distinctive" | "transfer";
type ClusterId = "dach" | "benelux" | "nordics" | "cee" | "see";
type AudienceRoute = "Explorer" | "Perfectionist" | "Balanced";
type Evidence = Record<string, string>;
type EngineScores = Record<EngineId, Record<Criterion, number>>;

const engineOrder: EngineId[] = ["start", "reset", "switch", "yes", "discover", "share"];
const criteria: { id: Criterion; label: string; weight: number; question: string }[] = [
  { id: "brand", label: "Brand permission", weight: 25, question: "Can Always Ready credibly own this role?" },
  { id: "audience", label: "Audience salience", weight: 25, question: "Is the state change meaningful and recurrent?" },
  { id: "media", label: "Media scale", weight: 20, question: "Can the context be found, bought and measured?" },
  { id: "distinctive", label: "Distinctive space", weight: 15, question: "Does it add more than generic refreshment?" },
  { id: "transfer", label: "Market transfer", weight: 15, question: "Can behaviour flex without changing the idea?" },
];

const engines: Record<EngineId, {
  number: string; name: string; moment: string; transition: string; job: string;
  brand: string; audience: string; media: string;
}> = {
  start: {
    number: "01", name: "Ready to Start", moment: "The day opens up", transition: "Still → moving",
    job: "Make the first forward action feel easy, with cold coffee as the enabler.",
    brand: "Test convenience, breakfast/coffee permission, pack recognition and availability.",
    audience: "Validate morning friction, first-beverage choice and the reward of momentum or reassurance.",
    media: "Read morning/commute demand, mobile and transit reach, routine content and convenience retail response.",
  },
  reset: {
    number: "02", name: "Ready to Reset", moment: "The afternoon needs a shift", transition: "Flat → re-engaged",
    job: "Show a visible change of state, made tangible through coldness, texture and taste.",
    brand: "Test pick-me-up permission, sensory equities, flavour preference and repeat potential.",
    audience: "Validate slump frequency, break rituals, desired reward and what makes a break feel proper.",
    media: "Read afternoon reach, work/study and self-care content, weather lift and conversion response.",
  },
  switch: {
    number: "03", name: "Ready to Switch", moment: "One mode ends; another begins", transition: "Routine → possibility",
    job: "Use the product to mark the handover between two modes, roles or places.",
    brand: "Test portability, immediate drinkability, transition usage and channel availability.",
    audience: "Validate the most common mode switches, emotional friction and acceptable product substitutions.",
    media: "Read post-work/pre-social peaks, mobility routes, cross-device behaviour and location response.",
  },
  yes: {
    number: "04", name: "Ready to Say Yes", moment: "A spontaneous plan lands", transition: "Undecided → in",
    job: "Make NESCAFÉ RTD the effortless product choice when a plan becomes real.",
    brand: "Test spontaneous-occasion fit, portability, recognition and purchase friction.",
    audience: "Validate plan spontaneity, social influence, barriers to joining and group dynamics.",
    media: "Read event calendars, weekend planning, near-me intent, footfall and retail proximity.",
  },
  discover: {
    number: "05", name: "Ready to Discover", moment: "Something unfamiliar is worth trying", transition: "Curious → experiencing",
    job: "Resolve uncertainty with credible flavour, range and coffee-quality proof.",
    brand: "Test innovation permission, trial drivers, taste performance and price-value expectations.",
    audience: "Validate novelty appetite, quality threshold, trusted recommendations and trial barriers.",
    media: "Read food/drink queries, creator reviews, retail browsing, sampling and trial conversion.",
  },
  share: {
    number: "06", name: "Ready to Share", moment: "A good find becomes social currency", transition: "Personal → group choice",
    job: "Turn one person’s credible find into something the group wants to choose.",
    brand: "Test advocacy, range visibility, recommendation language and repeat behaviour.",
    audience: "Validate influence networks, group-choice rituals, advocacy barriers and social value.",
    media: "Read UGC, reviews, shares/saves, referrals, group occasions and social-commerce response.",
  },
};

const audienceRewards: Record<AudienceRoute, Record<EngineId, string>> = {
  Explorer: {
    start: "Momentum into whatever comes next", reset: "Change the pace and re-enter the day",
    switch: "Move into what is next", yes: "Act on the invitation and join in",
    discover: "Try a new place, taste or format", share: "Turn discovery into social currency",
  },
  Perfectionist: {
    start: "Start with a coffee choice that meets my standards", reset: "Take a satisfying, proper break",
    switch: "Move on without compromising taste", yes: "Choose confidently while on the move",
    discover: "Find a flavour worth paying for", share: "Recommend something with credibility",
  },
  Balanced: {
    start: "Momentum, backed by a credible coffee choice", reset: "A satisfying shift back into the day",
    switch: "Move forward without compromising taste", yes: "Join the plan with an easy, confident choice",
    discover: "Try something new with enough taste proof", share: "Make a credible find worth passing on",
  },
};

type PriorityLevel = "H" | "M" | "S";

const clusters: Record<ClusterId, {
  name: string; profile: string; driver: string; available: string; hero: string; media: string;
  levels: Record<EngineId, PriorityLevel>; moments: Record<EngineId, string>;
}> = {
  dach: {
    name: "DACH", profile: "Convenient Indulgers", driver: "Convenience",
    available: "Latte, Cappuccino, Caramel", hero: "Latte + Cappuccino; Caramel as a secondary treat",
    media: "Morning commute and mid-afternoon digital video; routine, productivity, WFH/office and OOTD content.",
    levels: { start: "H", reset: "H", switch: "M", yes: "M", discover: "S", share: "S" },
    moments: {
      start: "A train or tram tap-in, platform wait or office arrival turns the morning from preparation into movement.",
      reset: "A mid-afternoon desk slump is interrupted by a cold sensory reveal and a clear return to pace.",
      switch: "The workday closes and talent moves into errands, gym or an urban social plan.",
      yes: "An after-work message lands while talent is already moving through the city.",
      discover: "A premium, lower-sugar or plant-based cue makes a familiar routine feel newly worth trying.",
      share: "A colleague’s desk or commute find becomes the team’s next convenience-store choice.",
    },
  },
  benelux: {
    name: "Benelux", profile: "Mindful Connoisseurs", driver: "Indulgence",
    available: "Latte, Cappuccino, Caramel", hero: "Caramel + Cappuccino for indulgence and espresso depth",
    media: "Mid-morning/afternoon; aesthetic food and drink creators, barista trends, lifestyle vlogs and micro-treats.",
    levels: { start: "M", reset: "H", switch: "S", yes: "S", discover: "H", share: "M" },
    moments: {
      start: "Talent unlocks a bike and enters the morning rhythm through a recognisable urban cycling behaviour.",
      reset: "A Koffietijd-style break creates a deliberate, café-quality moment inside work or study.",
      switch: "A work or study session gives way to cycling, shopping or a slower urban ritual.",
      yes: "A friend proposes a quick stop at a credible local hotspot while talent is on the move.",
      discover: "A barista-style flavour or local creator recommendation resolves curiosity through taste proof.",
      share: "A beautifully framed micro-treat becomes the recommendation passed to a friend or colleague.",
    },
  },
  nordics: {
    name: "Nordics", profile: "Effortless Pragmatists", driver: "Sleek functionality",
    available: "All four SKUs", hero: "Americano + Latte",
    media: "TikTok/Reels, commute vlogs, minimalist aesthetics, active lifestyle and short-form creator content.",
    levels: { start: "H", reset: "M", switch: "H", yes: "M", discover: "M", share: "S" },
    moments: {
      start: "Talent cycles, walks, boards transit or catches a ferry; the product enters as simple portable function.",
      reset: "A university or work break moves outdoors, using clean coldness rather than indulgent excess.",
      switch: "Work or study ends and talent moves into a park, waterfront or active plan.",
      yes: "A low-friction outdoor plan lands while talent is already mobile.",
      discover: "A sleek format or clean coffee profile earns trial through simple design and credible product detail.",
      share: "A functional find is recommended through an understated commute or active-lifestyle post.",
    },
  },
  cee: {
    name: "CEE", profile: "Status Seekers", driver: "Accessible luxury",
    available: "All four SKUs", hero: "Caramel + Cappuccino",
    media: "Fast creator trends, snack reviews, product discovery and challenges across TikTok and Instagram.",
    levels: { start: "M", reset: "M", switch: "S", yes: "M", discover: "H", share: "H" },
    moments: {
      start: "A convenience-store grab before work or university makes the brand part of an aspirational daily routine.",
      reset: "A functional study or work break gets a more indulgent, visible upgrade.",
      switch: "A study session gives way to a city walk, park hangout or weekend exploration.",
      yes: "A creator-led challenge or friend invite pulls talent into a spontaneous city plan.",
      discover: "A trendy flavour is found through a snack review, creator recommendation or convenience display.",
      share: "The new flavour becomes a lifestyle badge shown, rated and passed to the group.",
    },
  },
  see: {
    name: "SEE + Greece", profile: "Traditional Ritualists", driver: "Refreshment",
    available: "All four SKUs", hero: "Americano + Caramel",
    media: "Reels/TikTok, golden-hour aesthetics, festivals/music and creator-led lifestyle channels.",
    levels: { start: "S", reset: "H", switch: "M", yes: "H", discover: "M", share: "H" },
    moments: {
      start: "A bright morning walk, scooter or bus moment begins the day without losing the local social rhythm.",
      reset: "Visible afternoon heat or a lull is broken by an ice-cold sensory shift.",
      switch: "A lecture, work block or beach journey gives way to evening mobility and leisure.",
      yes: "A post-lecture, beach, event or golden-hour plan lands and talent immediately moves toward friends.",
      discover: "Americano offers crisp refreshment while Caramel gives the afternoon a sweeter social reward.",
      share: "A beach, festival or café find becomes part of the group’s visible coffee ritual.",
    },
  },
};

const evidenceGroups = [
  {
    id: "brand", title: "Brand data", question: "Can we own it?", color: "red",
    fields: [
      ["brandPermission", "Platform + permission", "What does Always Ready already have the right to mean here?"],
      ["productTruth", "Product + portfolio proof", "Which SKU, sensory cue, pack truth and distribution reality support the engine?"],
      ["brandPerformance", "Performance + whitespace", "What has worked before, and which competitor/category codes are open?"],
    ],
    sources: "Brand tracker · comms tests · sales/distribution · innovation · competitor audit",
  },
  {
    id: "audience", title: "Audience data", question: "Does it matter?", color: "aqua",
    fields: [
      ["audienceTension", "Current → desired state", "What tension is the audience leaving, and what do they want to feel next?"],
      ["audienceBehaviour", "Routine + social behaviour", "When, where, while doing what and with whom does the transition happen?"],
      ["audienceProof", "Barrier + reward", "What blocks choice, and should content sell momentum or reassurance?"],
    ],
    sources: "Segmentation · U&A · qual/ethnography · GWI/TGI · social listening · CRM",
  },
  {
    id: "media", title: "Media data", question: "Can we find it?", color: "blue",
    fields: [
      ["mediaDemand", "Demand signals", "What search, social, creator or commerce signals show the moment exists?"],
      ["mediaContext", "Time + place + platform", "Which daypart, mobility, weather, location and media behaviours make it addressable?"],
      ["mediaResponse", "Response + measurement", "Which creative benchmarks, retail signals and KPIs prove it can work?"],
    ],
    sources: "Platform planners · search · listening · commerce · location · campaign analytics",
  },
] as const;

const demoEvidence: Record<ClusterId, Evidence> = {
  dach: {
    brandPermission: "Always Ready can credibly own convenient cold coffee that keeps a busy day moving.",
    productTruth: "Latte and Cappuccino are hero SKUs; pack clarity, coldness and portable coffee credibility matter.",
    brandPerformance: "Validate lower-sugar and premium cues; avoid generic energy-drink codes.",
    audienceTension: "Rushed or flat → moving with functional confidence.",
    audienceBehaviour: "Morning commute, office arrival, fitness routines and mid-afternoon desk breaks.",
    audienceProof: "Explorer momentum first; Perfectionist classic-coffee reassurance as proof.",
    mediaDemand: "Routine, productivity, WFH/office humour and OOTD content.",
    mediaContext: "Mobile video during morning commute and mid-afternoon breaks; transit and convenience retail.",
    mediaResponse: "Validate daypart reach, completed views, retail response and repeat by hero SKU.",
  },
  benelux: {
    brandPermission: "Always Ready can make café-style indulgence accessible inside a modern routine.",
    productTruth: "Caramel and Cappuccino lead; texture, espresso depth and tasteful pack presentation matter.",
    brandPerformance: "Validate quality, origin and micro-treat cues against café and barista competition.",
    audienceTension: "Busy or mentally full → deliberately rewarded and ready to continue.",
    audienceBehaviour: "Koffietijd breaks, work/study self-reward, cycling, commuting and urban shopping.",
    audienceProof: "Explorer discovery plus stronger Perfectionist taste and quality reassurance.",
    mediaDemand: "Aesthetic food/drink creators, barista trends, lifestyle vlogs and local hot spots.",
    mediaContext: "Mid-morning and mid-afternoon social/video, cycling mobility and local discovery.",
    mediaResponse: "Validate saves, search lift, trial and flavour-level repeat.",
  },
  nordics: {
    brandPermission: "Always Ready can own sleek, portable coffee function without overstatement.",
    productTruth: "Americano and Latte lead; clean coffee cues, coldness and minimalist pack clarity matter.",
    brandPerformance: "Validate black-coffee credibility and simple design against functional competitors.",
    audienceTension: "Stationary or between modes → efficiently moving into the next activity.",
    audienceBehaviour: "Cycling, walking, transit, ferry, work/university breaks and outdoor recreation.",
    audienceProof: "Explorer momentum with clean, credible Perfectionist coffee reassurance.",
    mediaDemand: "Minimalist aesthetics, commute vlogs, active-lifestyle and short-form creator content.",
    mediaContext: "TikTok/Reels around mobility, spring/summer outdoors and work/study transitions.",
    mediaResponse: "Validate attention, route/location response, trial and Americano/Latte mix.",
  },
  cee: {
    brandPermission: "Always Ready can make a global coffee brand feel like accessible everyday luxury.",
    productTruth: "Caramel and Cappuccino lead; indulgent flavour, pack visibility and global-brand cues matter.",
    brandPerformance: "Validate impulse trial and social-display value in modern convenience retail.",
    audienceTension: "Curious or routine-bound → experiencing and signalling something current.",
    audienceBehaviour: "Convenience grabs before work/university, study breaks, city walks and park hangouts.",
    audienceProof: "Explorer novelty and social currency; Perfectionist trust in taste and brand quality.",
    mediaDemand: "Fast trends, snack reviews, creator challenges and product-discovery content.",
    mediaContext: "TikTok/Instagram plus convenience retail and urban youth mobility.",
    mediaResponse: "Validate creator engagement, product search, impulse conversion and shares.",
  },
  see: {
    brandPermission: "Always Ready can turn extreme cold refreshment into readiness for the next social moment.",
    productTruth: "Americano and Caramel lead; visible ice-cold refreshment and coffee quality must both land.",
    brandPerformance: "Avoid generic beach imagery without a state change or social product role.",
    audienceTension: "Hot, flat or between plans → refreshed, socially switched-on and ready to join.",
    audienceBehaviour: "Summer afternoons, coastal trips, post-lecture hangouts, events and evening mobility.",
    audienceProof: "Explorer spontaneity/social value with Perfectionist refreshment and quality proof.",
    mediaDemand: "Golden-hour aesthetics, festivals/music, global trends and creator lifestyle.",
    mediaContext: "Reels/TikTok around warm weather, beach/event mobility and evening plans.",
    mediaResponse: "Validate weather lift, event/location response, share rate and hero-SKU conversion.",
  },
};

const scorePreset: Record<PriorityLevel, Record<Criterion, number>> = {
  H: { brand: 4.2, audience: 4.5, media: 4.2, distinctive: 4.1, transfer: 4.0 },
  M: { brand: 3.6, audience: 3.5, media: 3.5, distinctive: 3.3, transfer: 3.8 },
  S: { brand: 3.1, audience: 2.8, media: 2.8, distinctive: 3.0, transfer: 3.5 },
};

function scoresForCluster(cluster: ClusterId): EngineScores {
  return Object.fromEntries(engineOrder.map((engine) => [engine, { ...scorePreset[clusters[cluster].levels[engine]] }])) as EngineScores;
}

function weightedScore(scores: Record<Criterion, number>) {
  return criteria.reduce((total, criterion) => total + scores[criterion.id] * (criterion.weight / 100), 0);
}

function levelForScore(score: number): "High" | "Medium" | "Selective" {
  if (score >= 3.8) return "High";
  if (score >= 3.2) return "Medium";
  return "Selective";
}

function levelClass(level: string) {
  return level === "High" ? "high" : level === "Medium" ? "medium" : "selective";
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [clusterId, setClusterId] = useState<ClusterId>("dach");
  const [marketName, setMarketName] = useState("Germany / Austria / Switzerland");
  const [audienceRoute, setAudienceRoute] = useState<AudienceRoute>("Balanced");
  const [objective, setObjective] = useState("Grow frequency across more daily moments");
  const [evidence, setEvidence] = useState<Evidence>(demoEvidence.dach);
  const [scores, setScores] = useState<EngineScores>(() => scoresForCluster("dach"));
  const [activeEngine, setActiveEngine] = useState<EngineId>("start");
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("nescafe-cep-builder");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.clusterId) setClusterId(parsed.clusterId);
        if (parsed.marketName) setMarketName(parsed.marketName);
        if (parsed.audienceRoute) setAudienceRoute(parsed.audienceRoute);
        if (parsed.objective) setObjective(parsed.objective);
        if (parsed.evidence) setEvidence(parsed.evidence);
        if (parsed.scores) setScores(parsed.scores);
        if (parsed.activeEngine) setActiveEngine(parsed.activeEngine);
      } catch {
        // Keep the built-in demo when a device draft cannot be read.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("nescafe-cep-builder", JSON.stringify({
      clusterId, marketName, audienceRoute, objective, evidence, scores, activeEngine,
    }));
  }, [hydrated, clusterId, marketName, audienceRoute, objective, evidence, scores, activeEngine]);

  const rankedEngines = useMemo(() => engineOrder
    .map((id) => ({ id, score: weightedScore(scores[id]) }))
    .sort((a, b) => b.score - a.score), [scores]);

  const completeness = Math.round((Object.values(evidence).filter((value) => value.trim()).length / Object.keys(evidence).length) * 100);
  const activeScore = weightedScore(scores[activeEngine]);
  const activeQualifies = activeScore >= 3.5 && scores[activeEngine].brand >= 3 && scores[activeEngine].audience >= 3 && scores[activeEngine].media >= 2;
  const cluster = clusters[clusterId];

  function selectCluster(next: ClusterId) {
    setClusterId(next);
    setEvidence(demoEvidence[next]);
    const nextScores = scoresForCluster(next);
    setScores(nextScores);
    const nextTop = [...engineOrder].sort((a, b) => weightedScore(nextScores[b]) - weightedScore(nextScores[a]))[0];
    setActiveEngine(nextTop);
    const defaultMarkets: Record<ClusterId, string> = {
      dach: "Germany / Austria / Switzerland", benelux: "Belgium / Netherlands / Luxembourg",
      nordics: "Nordics", cee: "Central & Eastern Europe", see: "South East Europe + Greece",
    };
    setMarketName(defaultMarkets[next]);
  }

  function updateScore(engine: EngineId, criterion: Criterion, value: number) {
    setScores((current) => ({ ...current, [engine]: { ...current[engine], [criterion]: value } }));
  }

  function resetDraft() {
    setEvidence(demoEvidence[clusterId]);
    setScores(scoresForCluster(clusterId));
    setCopied(false);
  }

  const briefText = useMemo(() => {
    const priorityLines = rankedEngines.map((item, index) =>
      `${index + 1}. ${engines[item.id].name} — ${item.score.toFixed(1)}/5 (${levelForScore(item.score)})`,
    ).join("\n");
    const top = rankedEngines.slice(0, 3).map((item) => engines[item.id].name).join(", ");
    return `NESCAFÉ RTD — CEP ENGINE MARKET BRIEF

MARKET
${marketName}
Cluster: ${cluster.name} — ${cluster.profile}
Growth driver: ${cluster.driver}
Audience route: ${audienceRoute}
Objective: ${objective}

RECOMMENDED ENGINE PRIORITY
${priorityLines}

LEAD SYSTEM
Build around ${top}.
The engine is the stable human transition. Local Hooks are executions inside it.

SELECTED ENGINE
${engines[activeEngine].name}
Moment: ${engines[activeEngine].moment}
Transition: ${engines[activeEngine].transition}
Strategic job: ${engines[activeEngine].job}
Audience reward: ${audienceRewards[audienceRoute][activeEngine]}

LOCAL HOOK DIRECTION
${cluster.moments[activeEngine]}

PRODUCT PROOF
Available: ${cluster.available}
Hero: ${cluster.hero}

MEDIA CONTEXT
${cluster.media}

EVIDENCE CAPTURED
Brand permission: ${evidence.brandPermission || "To confirm"}
Product proof: ${evidence.productTruth || "To confirm"}
Brand performance/whitespace: ${evidence.brandPerformance || "To confirm"}
Audience transition: ${evidence.audienceTension || "To confirm"}
Audience behaviour: ${evidence.audienceBehaviour || "To confirm"}
Audience reward/proof: ${evidence.audienceProof || "To confirm"}
Media demand: ${evidence.mediaDemand || "To confirm"}
Media context: ${evidence.mediaContext || "To confirm"}
Media response: ${evidence.mediaResponse || "To confirm"}

STATUS
Working strategic hypothesis. Validate with local brand, audience and media data before investment decisions.`;
  }, [marketName, cluster, audienceRoute, objective, rankedEngines, activeEngine, evidence]);

  async function copyBrief() {
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadBrief() {
    const blob = new Blob([briefText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `NESCAFE_RTD_CEP_Brief_${cluster.name.replaceAll(" ", "_")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const steps = ["Build evidence", "Score engines", "Translate to market", "Export brief"];

  return (
    <main>
      <header className="topbar">
        <a className="brandmark" href="#top" aria-label="NESCAFÉ RTD CEP Engine Builder home">
          <img className="brandmark-logo" src="nescafe-red-mark.png" alt="" aria-hidden="true" />
          <span className="brandmark-copy">
            <span className="brandmark-kicker">NESCAFÉ RTD</span>
            <span className="brandmark-name">CEP Engine Builder</span>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="draft-status"><span className="status-dot" /> Draft saved locally</span>
          <button className="ghost-button" onClick={resetDraft}>Reset market demo</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">EVIDENCE → ENGINE → CLUSTER → LOCAL HOOK</p>
          <h1>Build the six<br /><span>“Ready to…”</span> engines.</h1>
          <p className="hero-copy">Turn brand, audience and media evidence into a scored CEP system — then translate it into a market-ready creative brief.</p>
        </div>
        <div className="hero-visual" aria-label="Brand, audience and media combine to build one engine">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="signal signal-brand">BRAND</div><div className="signal signal-audience">AUDIENCE</div>
          <div className="signal signal-media">MEDIA</div><div className="engine-core">ONE<br />ENGINE</div>
        </div>
      </section>

      <nav className="stepper" aria-label="Builder progress">
        {steps.map((label, index) => (
          <button key={label} onClick={() => setStep(index)} className={step === index ? "step active" : step > index ? "step complete" : "step"}>
            <span>{step > index ? "✓" : index + 1}</span><strong>{label}</strong>
          </button>
        ))}
      </nav>

      <div className="workspace">
        {step === 0 && (
          <section className="panel" aria-labelledby="evidence-title">
            <div className="section-heading">
              <div><p className="eyebrow">STEP 01 — BUILD THE EVIDENCE</p><h2 id="evidence-title">Where do the engines come from?</h2>
                <p>Capture enough evidence for all three streams to agree. Use the profile as a starting hypothesis, then replace it with local facts.</p></div>
              <div className="completion"><strong>{completeness}%</strong><span>evidence complete</span></div>
            </div>

            <div className="setup-grid">
              <label>Market / scope<input value={marketName} onChange={(event) => setMarketName(event.target.value)} /></label>
              <label>Cluster<select value={clusterId} onChange={(event) => selectCluster(event.target.value as ClusterId)}>
                {Object.entries(clusters).map(([id, item]) => <option key={id} value={id}>{item.name} — {item.profile}</option>)}
              </select></label>
              <label>Audience route<select value={audienceRoute} onChange={(event) => setAudienceRoute(event.target.value as AudienceRoute)}>
                <option>Balanced</option><option>Explorer</option><option>Perfectionist</option>
              </select></label>
              <label>Growth objective<select value={objective} onChange={(event) => setObjective(event.target.value)}>
                <option>Grow frequency across more daily moments</option><option>Drive trial of the portfolio</option>
                <option>Increase consideration and preference</option><option>Support a new SKU or flavour launch</option>
              </select></label>
            </div>

            <div className="evidence-grid">
              {evidenceGroups.map((group) => (
                <article className={`evidence-card ${group.color}`} key={group.id}>
                  <div className="card-heading"><div><span>{group.question}</span><h3>{group.title}</h3></div>
                    <div className="data-icon">{group.id === "brand" ? "B" : group.id === "audience" ? "A" : "M"}</div></div>
                  {group.fields.map(([id, label, prompt]) => (
                    <label className="textarea-label" key={id}><span>{label}</span><small>{prompt}</small>
                      <textarea value={evidence[id]} onChange={(event) => setEvidence((current) => ({ ...current, [id]: event.target.value }))} />
                    </label>
                  ))}
                  <div className="source-line"><b>Typical sources</b>{group.sources}</div>
                </article>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="panel" aria-labelledby="score-title">
            <div className="section-heading">
              <div><p className="eyebrow">STEP 02 — SCORE THE SIX ENGINES</p><h2 id="score-title">Which territories deserve engine status?</h2>
                <p>Select an engine and score the five gates. The recommended rule is ≥3.5 overall, Brand and Audience ≥3, and Media ≥2.</p></div>
              <div className="hypothesis-tag">Working hypothesis</div>
            </div>

            <div className="engine-strip">
              {engineOrder.map((id) => {
                const score = weightedScore(scores[id]); const level = levelForScore(score);
                return <button key={id} className={activeEngine === id ? "engine-tile active" : "engine-tile"} onClick={() => setActiveEngine(id)}>
                  <span>{engines[id].number}</span><strong>{engines[id].name.replace("Ready to ", "")}</strong>
                  <em className={levelClass(level)}>{score.toFixed(1)} · {level}</em>
                </button>;
              })}
            </div>

            <div className="scoring-layout">
              <div className="engine-definition">
                <p className="engine-number">ENGINE {engines[activeEngine].number}</p><h3>{engines[activeEngine].name}</h3>
                <p className="moment">{engines[activeEngine].moment}</p><div className="transition">{engines[activeEngine].transition}</div>
                <p className="job">{engines[activeEngine].job}</p>
                <div className="engine-score"><div><strong>{activeScore.toFixed(1)}</strong><span>/ 5</span></div>
                  <b className={activeQualifies ? "qualifies" : "needs-evidence"}>{activeQualifies ? "QUALIFIES" : "NEEDS EVIDENCE"}</b></div>
              </div>
              <div className="score-controls">
                {criteria.map((criterion) => (
                  <label className="score-row" key={criterion.id}>
                    <span className="score-label"><b>{criterion.label}</b><small>{criterion.question}</small></span>
                    <input type="range" min="0" max="5" step="0.1" value={scores[activeEngine][criterion.id]}
                      onChange={(event) => updateScore(activeEngine, criterion.id, Number(event.target.value))} />
                    <output>{scores[activeEngine][criterion.id].toFixed(1)}</output><em>{criterion.weight}%</em>
                  </label>
                ))}
              </div>
            </div>
            <div className="evidence-prompts">
              <article><span>BRAND DATA TO READ</span><p>{engines[activeEngine].brand}</p></article>
              <article><span>AUDIENCE DATA TO READ</span><p>{engines[activeEngine].audience}</p></article>
              <article><span>MEDIA DATA TO READ</span><p>{engines[activeEngine].media}</p></article>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="panel" aria-labelledby="translate-title">
            <div className="section-heading">
              <div><p className="eyebrow">STEP 03 — TRANSLATE TO MARKET</p><h2 id="translate-title">Localise the behaviour, not the idea.</h2>
                <p>The engine stays stable. The cluster changes its priority. The market turns it into a recognisable local Hook.</p></div>
              <select className="cluster-switch" value={clusterId} onChange={(event) => selectCluster(event.target.value as ClusterId)}>
                {Object.entries(clusters).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
              </select>
            </div>

            <div className="cluster-summary">
              <div><span>{cluster.name}</span><h3>{cluster.profile}</h3><p>Growth driver: <b>{cluster.driver}</b></p></div>
              <div><span>AVAILABLE PRODUCT</span><p>{cluster.available}</p></div>
              <div><span>HERO PRODUCT PROOF</span><p>{cluster.hero}</p></div>
            </div>
            <div className="priority-table" role="table" aria-label="Engine priorities">
              <div className="priority-row header" role="row"><span>ENGINE</span><span>SCORE</span><span>PRIORITY</span><span>STRATEGIC JOB</span></div>
              {rankedEngines.map((item) => {
                const level = levelForScore(item.score);
                return <button key={item.id} className={activeEngine === item.id ? "priority-row selected" : "priority-row"}
                  onClick={() => setActiveEngine(item.id)} role="row">
                  <span><b>{engines[item.id].number}</b>{engines[item.id].name}</span><span>{item.score.toFixed(1)}</span>
                  <span><em className={levelClass(level)}>{level}</em></span><span>{engines[item.id].job}</span>
                </button>;
              })}
            </div>

            <div className="hook-builder">
              <div className="hook-intro"><p className="eyebrow">LOCAL HOOK BUILDER</p><h3>{engines[activeEngine].name}</h3>
                <p>{engines[activeEngine].moment} · {engines[activeEngine].transition}</p>
                <label>Audience expression<select value={audienceRoute} onChange={(event) => setAudienceRoute(event.target.value as AudienceRoute)}>
                  <option>Balanced</option><option>Explorer</option><option>Perfectionist</option>
                </select></label>
              </div>
              <div className="hook-output">
                <article><span>HOLD FIXED</span><p>{engines[activeEngine].job}</p></article>
                <article><span>AUDIENCE REWARD</span><p>{audienceRewards[audienceRoute][activeEngine]}</p></article>
                <article className="wide"><span>LOCAL HOOK DIRECTION</span><p>{cluster.moments[activeEngine]}</p></article>
                <article><span>PRODUCT PROOF</span><p>{cluster.hero}</p></article>
                <article><span>MEDIA CONTEXT</span><p>{cluster.media}</p></article>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="panel brief-panel" aria-labelledby="brief-title">
            <div className="section-heading no-print">
              <div><p className="eyebrow">STEP 04 — EXPORT THE MARKET BRIEF</p><h2 id="brief-title">Your engine recommendation is ready.</h2>
                <p>Copy it into a working document, download it, or print the page to PDF.</p></div>
              <div className="brief-actions"><button className="secondary-button" onClick={copyBrief}>{copied ? "Copied" : "Copy brief"}</button>
                <button className="secondary-button" onClick={downloadBrief}>Download .txt</button>
                <button className="primary-button" onClick={() => window.print()}>Print / PDF</button></div>
            </div>

            <article className="brief-sheet">
              <div className="brief-header"><div><span>NESCAFÉ RTD</span><h2>CEP Engine Market Brief</h2></div>
                <div className="brief-meta"><b>{cluster.name}</b><span>{marketName}</span></div></div>
              <div className="brief-grid">
                <div className="brief-block"><span>GROWTH DRIVER</span><strong>{cluster.driver}</strong></div>
                <div className="brief-block"><span>AUDIENCE ROUTE</span><strong>{audienceRoute}</strong></div>
                <div className="brief-block wide"><span>OBJECTIVE</span><strong>{objective}</strong></div>
              </div>
              <div className="brief-section"><span className="brief-label">RECOMMENDED ENGINE PRIORITY</span>
                <div className="rank-cards">{rankedEngines.slice(0, 3).map((item, index) => (
                  <button key={item.id} onClick={() => setActiveEngine(item.id)} className={activeEngine === item.id ? "rank-card active" : "rank-card"}>
                    <span>0{index + 1}</span><b>{engines[item.id].name}</b><em>{item.score.toFixed(1)} / 5</em>
                  </button>
                ))}</div>
              </div>
              <div className="brief-section selected-brief">
                <div className="selected-title"><span>SELECTED ENGINE</span><h3>{engines[activeEngine].name}</h3><p>{engines[activeEngine].transition}</p></div>
                <div className="selected-content">
                  <article><span>STRATEGIC JOB</span><p>{engines[activeEngine].job}</p></article>
                  <article><span>AUDIENCE REWARD</span><p>{audienceRewards[audienceRoute][activeEngine]}</p></article>
                  <article className="wide"><span>LOCAL HOOK</span><p>{cluster.moments[activeEngine]}</p></article>
                  <article><span>PRODUCT PROOF</span><p>{cluster.hero}</p></article><article><span>MEDIA CONTEXT</span><p>{cluster.media}</p></article>
                </div>
              </div>
              <div className="brief-footer"><b>WORKING STRATEGIC HYPOTHESIS</b><span>Validate with local brand, audience and media data before investment decisions.</span></div>
            </article>
          </section>
        )}

        <div className="navigation no-print"><button className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
          <span>Step {step + 1} of 4</span><button className="primary-button" disabled={step === 3} onClick={() => setStep((current) => Math.min(3, current + 1))}>{step === 2 ? "Build brief" : "Continue"}</button></div>
      </div>

      <footer className="site-footer no-print"><span>NESCAFÉ RTD · ALWAYS READY</span><span>Internal working tool · Strategic hypotheses require local validation</span></footer>
    </main>
  );
}
