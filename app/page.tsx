"use client";

import { useEffect, useMemo, useState } from "react";
import {
  marketProfiles,
  markets,
  type AudienceRoute,
  type ClusterId,
  type EngineId,
  type MarketId,
  type PriorityLevel,
} from "./market-profiles";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Criterion = "brand" | "audience" | "media" | "distinctive" | "transfer";
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

const engineActivation: Record<EngineId, {
  daypart: string; trigger: string; mediaRole: string; creatorStory: string; kpis: string;
}> = {
  start: {
    daypart: "06:00–09:30 · wake-up, preparation and commute",
    trigger: "Serve around first movement: leaving home, entering transit, arriving at work/university or beginning a morning routine.",
    mediaRole: "Create fast recognition of the moment, then establish NESCAFÉ RTD as the cold, zero-prep way to get moving.",
    creatorStory: "Show the real first friction of the day, the grab/open/sip, and the visible shift into motion. The product must enable the routine—not decorate it.",
    kpis: "Attention in the first 2 seconds, completed views, branded search, store visits and morning sales response.",
  },
  reset: {
    daypart: "13:00–16:30 · post-lunch, desk/study slump and warm-weather lull",
    trigger: "Activate when energy visibly drops: after lunch, between meetings/classes or when heat makes the afternoon feel flat.",
    mediaRole: "Interrupt passive scrolling with an immediate cold/sensory contrast and dramatise the return to pace.",
    creatorStory: "Make the before-and-after believable: show the low point, a proper cold coffee break, and what the creator is ready to re-enter next.",
    kpis: "Thumb-stop rate, video completion, saves, flavour interest, retail click-through and afternoon conversion.",
  },
  switch: {
    daypart: "16:00–19:00 · work/study handover into errands, exercise or social time",
    trigger: "Target moments when one role or place ends and another begins, especially mobility between work, study and personal plans.",
    mediaRole: "Own the handover by linking portability and taste to the audience’s next mode.",
    creatorStory: "Use a transition format: work-to-gym, lecture-to-city, desk-to-dinner or commute-to-evening. Keep the product as the bridge between modes.",
    kpis: "Qualified reach in transition windows, video completion, store proximity response and purchase intent.",
  },
  yes: {
    daypart: "Thursday–Sunday afternoons/evenings · spontaneous plan and event windows",
    trigger: "Use messages, event calendars, weather, location and proximity signals that indicate a plan is forming now.",
    mediaRole: "Turn indecision into action and make the product an easy choice on the way to the plan.",
    creatorStory: "Start with the invitation or last-minute plan, show the decision to join, then bring NESCAFÉ RTD naturally into the journey.",
    kpis: "Engagement, shares, map/store actions, event-area reach, incremental footfall and conversion.",
  },
  discover: {
    daypart: "Mid-morning to early evening · browse, snack and shopping windows",
    trigger: "Reach audiences while they are looking for flavours, reviews, café alternatives, new products or small treats.",
    mediaRole: "Resolve trial uncertainty with flavour, texture, coffee-quality and value proof close to purchase.",
    creatorStory: "Use a credible first-try or comparison format. Describe the taste specifically and show why this SKU is worth choosing again.",
    kpis: "Saves, product-page views, search lift, sampling response, add-to-cart, trial and flavour-level repeat.",
  },
  share: {
    daypart: "Social and group-choice occasions · weekends, events and shared breaks",
    trigger: "Activate around recommendation behaviour, group plans, reviews, UGC and occasions where one person influences the choice.",
    mediaRole: "Give a credible product find enough social value to travel from one person to the group.",
    creatorStory: "Show the recommendation being passed on—not just stated. Capture the group reaction, choice or ritual that follows.",
    kpis: "Share rate, saves, UGC response, referrals, social-commerce actions and group-occasion sales.",
  },
};

const clusterActivation: Record<ClusterId, {
  localInsight: string; channels: string[]; targeting: string; creatorArchetype: string;
  creatorFit: string; creatorFormats: string; creatorMandatories: string;
}> = {
  dach: {
    localInsight: "Morning routines are functional and disciplined. Frame NESCAFÉ RTD as a credible cold-coffee accelerator that fits commuting, office arrival and pre-workout behaviour without losing taste standards.",
    channels: [
      "YouTube · 6s Bumper and 15s OLV for fast reach and product-role demonstration",
      "Meta · Reels, Stories and Feed for routine, productivity and lifestyle contexts",
      "TikTok · native in-feed vertical video built around real morning/afternoon behaviour",
      "DOOH + retail · transit, office, convenience and gym-adjacent placements close to purchase",
    ],
    targeting: "Commuters, early starters, fitness/routine audiences and office or WFH contexts; layer daypart, transit and convenience-store proximity where available.",
    creatorArchetype: "Coffee lifestylers, productivity voices, fitness/running creators and credible everyday vloggers.",
    creatorFit: "Strong Germany/DACH audience concentration; routine-led content; clean visual language; credible coffee or active-lifestyle permission; avoids exaggerated energy claims.",
    creatorFormats: "GRWM, morning routine, pre-workout/commute vlog, desk-reset and ‘what I’m getting ready for’ vertical stories.",
    creatorMandatories: "Show a real preparation or reset behaviour, clear cold product visibility, a specific next activity and a natural Always Ready payoff. Capture clean 9:16 masters for paid boosting.",
  },
  benelux: {
    localInsight: "The opportunity is a deliberate café-quality micro-treat inside a modern routine. Use cycling, work/study breaks and local discovery without turning the brand into generic indulgence.",
    channels: [
      "Meta · Reels, Stories and carousel for aesthetic taste, routine and discovery content",
      "TikTok · creator-led flavour discovery, café comparison and micro-treat formats",
      "YouTube · Shorts plus 15s OLV for sensory and product-quality proof",
      "Retail + mobility media · cycling routes, urban convenience and shopper touchpoints",
    ],
    targeting: "Urban cyclists, coffee and food explorers, work/study audiences and premium-snack seekers; prioritise mid-morning and mid-afternoon discovery windows.",
    creatorArchetype: "Aesthetic food and drink creators, barista voices, city-cycling vloggers and modern lifestyle curators.",
    creatorFit: "Taste vocabulary and visual craft; trusted local recommendations; strong save/share behaviour; credible rather than over-produced café comparisons.",
    creatorFormats: "Koffietijd break, bike-to-work ritual, barista-style taste test, local hotspot pairing and ‘small reward’ diary.",
    creatorMandatories: "Describe flavour and texture specifically, show coldness and pack clearly, anchor the story in a real local routine and deliver editable vertical cutdowns for paid social.",
  },
  nordics: {
    localInsight: "Coffee needs to feel useful, well designed and understated. Let clean function, portability and credible coffee taste lead across transit, cycling, ferry and outdoor transitions.",
    channels: [
      "TikTok + Meta Reels · short-form commute, active-lifestyle and minimalist routine content",
      "YouTube · Shorts and 15s OLV for functional product demonstration",
      "CTV/OLV · incremental reach around work, study and lifestyle content",
      "Transit/retail DOOH · stations, ferries, campuses and convenience environments",
    ],
    targeting: "Mobile urban audiences, commuters, students and active-lifestyle cohorts; use mobility, weather and outdoor-context signals with restrained frequency.",
    creatorArchetype: "Minimalist lifestyle creators, commuters, runners/cyclists, students and design-conscious coffee voices.",
    creatorFit: "Understated delivery, clean composition, high local relevance and believable functional use; avoid loud challenge formats or forced indulgence.",
    creatorFormats: "Commute POV, ferry/transit diary, pack-and-go routine, active break and simple first-sip product review.",
    creatorMandatories: "Make the function immediate, show portable use and coffee credibility, keep claims grounded, and supply clean footage with space for local supers and paid cutdowns.",
  },
  cee: {
    localInsight: "NESCAFÉ RTD can make a global coffee brand feel like accessible everyday luxury. Product visibility, flavour excitement and social currency should work together near impulse purchase.",
    channels: [
      "TikTok · fast product discovery, snack review, challenge and creator-whitelisted formats",
      "Meta · Reels, Stories and Feed for lifestyle signalling and retargeting",
      "YouTube · Shorts and 6s/15s OLV for broad reach and pack recognition",
      "Retail media + DOOH · convenience stores, campuses, malls and urban youth routes",
    ],
    targeting: "Students, young professionals, snack/flavour explorers and trend-engaged audiences; connect social discovery to convenience-retail proximity and retargeting.",
    creatorArchetype: "Snack reviewers, trend translators, campus/city vloggers and aspirational lifestyle creators.",
    creatorFit: "High product-discovery credibility, visible engagement from the local market, strong pack handling and an ability to make premium cues feel attainable.",
    creatorFormats: "First-try review, flavour ranking, convenience-store find, campus-to-city transition and group reaction.",
    creatorMandatories: "Land flavour plus coffee quality, keep the pack recognisable, show where/how it is bought and capture a recommendation moment that can be boosted as a Partnership Ad.",
  },
  see: {
    localInsight: "Refreshment is strongest when it leads into a social next step. Use visible heat, cold-product contrast and real afternoon-to-evening mobility—not generic beach imagery.",
    channels: [
      "Meta Reels + Stories · high-reach lifestyle, event and golden-hour contexts",
      "TikTok · native creator stories around heat, plans, music and social movement",
      "YouTube · Shorts, 6s Bumper and 15s OLV for refreshment and product proof",
      "Weather/event media + DOOH · warm-day, coastal, campus, music and convenience locations",
    ],
    targeting: "Warm-weather audiences, students/young professionals, festival and music cohorts and people moving toward social occasions; layer temperature, time and event proximity.",
    creatorArchetype: "Lifestyle hosts, music/event creators, coastal-city vloggers and socially connected coffee or food voices.",
    creatorFit: "Strong local audience, genuine group chemistry, credible event/lifestyle access and an ability to show refreshment without losing coffee quality.",
    creatorFormats: "Hot-afternoon reset, post-lecture plan, golden-hour journey, event preparation and group recommendation.",
    creatorMandatories: "Show the state change, ice-cold sensory proof, a clear next plan and visible product use. Secure usage rights and clean vertical assets for weather/event-triggered paid support.",
  },
};

type MarketLocal = {
  driver: string;
  available: string;
  hero: string;
  media: string;
  localInsight: string;
  coffeeContext: string;
  mobilityContext: string;
  retailContext: string;
  validationAsk: string;
  sourceBasis: string;
  channels: string;
  targeting: string;
  creatorArchetype: string;
  creatorFit: string;
  creatorFormats: string;
  creatorMandatories: string;
  moments: Record<EngineId, string>;
};

type MarketDraft = {
  audienceRoute: AudienceRoute;
  objective: string;
  evidence: Evidence;
  scores: EngineScores;
  activeEngine: EngineId;
  local: MarketLocal;
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

function scoresForLevels(levels: Record<EngineId, PriorityLevel>): EngineScores {
  return Object.fromEntries(engineOrder.map((engine) => [engine, { ...scorePreset[levels[engine]] }])) as EngineScores;
}

function evidenceForMarket(marketId: MarketId): Evidence {
  const profile = marketProfiles[marketId];
  const available = clusters[markets[marketId].starter].available;
  return {
    brandPermission: profile.permission,
    productTruth: `${available}. ${profile.hero}`,
    brandPerformance: profile.whitespace,
    audienceTension: profile.tension,
    audienceBehaviour: profile.routine,
    audienceProof: profile.reward,
    mediaDemand: profile.mediaDemand,
    mediaContext: profile.mediaContext,
    mediaResponse: profile.mediaResponse,
  };
}

function starterLocal(marketId: MarketId): MarketLocal {
  const market = markets[marketId];
  const profile = marketProfiles[marketId];
  return {
    driver: profile.driver,
    available: clusters[market.starter].available,
    hero: profile.hero,
    media: profile.mediaContext,
    localInsight: profile.localInsight,
    coffeeContext: profile.coffeeContext,
    mobilityContext: profile.routine,
    retailContext: profile.retailContext,
    validationAsk: profile.validationAsk,
    sourceBasis: "Market-specific strategic starter informed by the European Coffee Report 2024–2025, DataReportal 2026 country reports, Eurostat transport context and local coffee-culture desk research. Replace hypotheses with local Nestlé brand, sales, audience, platform and retailer evidence before investment.",
    channels: profile.channels.join("\n"),
    targeting: profile.targeting,
    creatorArchetype: profile.creatorArchetype,
    creatorFit: profile.creatorFit,
    creatorFormats: profile.creatorFormats,
    creatorMandatories: `Open on a recognisable ${market.name} behaviour, not a borrowed cluster cue. Show a real product purchase or use, specific coffee and sensory proof, the next activity, clean 9:16 masters and paid-usage rights.`,
    moments: { ...profile.moments },
  };
}

function defaultDraftForMarket(marketId: MarketId): MarketDraft {
  const profile = marketProfiles[marketId];
  const scores = scoresForLevels(profile.levels);
  const activeEngine = [...engineOrder].sort((a, b) => weightedScore(scores[b]) - weightedScore(scores[a]))[0];
  return {
    audienceRoute: profile.route,
    objective: profile.objective,
    evidence: evidenceForMarket(marketId),
    scores,
    activeEngine,
    local: starterLocal(marketId),
  };
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
  const initialDraft = defaultDraftForMarket("germany");
  const [step, setStep] = useState(0);
  const [marketId, setMarketId] = useState<MarketId>("germany");
  const [audienceRoute, setAudienceRoute] = useState<AudienceRoute>(initialDraft.audienceRoute);
  const [objective, setObjective] = useState(initialDraft.objective);
  const [evidence, setEvidence] = useState<Evidence>(initialDraft.evidence);
  const [scores, setScores] = useState<EngineScores>(initialDraft.scores);
  const [activeEngine, setActiveEngine] = useState<EngineId>(initialDraft.activeEngine);
  const [local, setLocal] = useState<MarketLocal>(initialDraft.local);
  const [marketDrafts, setMarketDrafts] = useState<Partial<Record<MarketId, MarketDraft>>>({});
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("nescafe-cep-builder");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.version === 3 && parsed.marketId && markets[parsed.marketId as MarketId]) {
          const nextMarket = parsed.marketId as MarketId;
          const drafts = (parsed.drafts ?? {}) as Partial<Record<MarketId, MarketDraft>>;
          const draft = drafts[nextMarket] ?? defaultDraftForMarket(nextMarket);
          setMarketDrafts(drafts);
          setMarketId(nextMarket);
          loadDraft(draft);
        } else {
          const nextMarket = parsed.marketId && markets[parsed.marketId as MarketId] ? parsed.marketId as MarketId : "germany";
          setMarketId(nextMarket);
          loadDraft(defaultDraftForMarket(nextMarket));
        }
      } catch {
        // Keep the built-in demo when a device draft cannot be read.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const currentDraft = captureDraft();
    window.localStorage.setItem("nescafe-cep-builder", JSON.stringify({
      version: 3,
      marketId,
      drafts: { ...marketDrafts, [marketId]: currentDraft },
    }));
  }, [hydrated, marketId, audienceRoute, objective, evidence, scores, activeEngine, local, marketDrafts]);

  const rankedEngines = useMemo(() => engineOrder
    .map((id) => ({ id, score: weightedScore(scores[id]) }))
    .sort((a, b) => b.score - a.score), [scores]);

  const activeScore = weightedScore(scores[activeEngine]);
  const activeQualifies = activeScore >= 3.5 && scores[activeEngine].brand >= 3 && scores[activeEngine].audience >= 3 && scores[activeEngine].media >= 2;
  const market = markets[marketId];
  const activation = engineActivation[activeEngine];

  function captureDraft(): MarketDraft {
    return { audienceRoute, objective, evidence, scores, activeEngine, local };
  }

  function loadDraft(draft: MarketDraft) {
    setAudienceRoute(draft.audienceRoute);
    setObjective(draft.objective);
    setEvidence(draft.evidence);
    setScores(draft.scores);
    setActiveEngine(draft.activeEngine);
    setLocal(draft.local);
  }

  function selectMarket(next: MarketId) {
    const drafts = { ...marketDrafts, [marketId]: captureDraft() };
    const nextDraft = drafts[next] ?? defaultDraftForMarket(next);
    setMarketDrafts(drafts);
    setMarketId(next);
    loadDraft(nextDraft);
    setCopied(false);
  }

  function updateScore(engine: EngineId, criterion: Criterion, value: number) {
    setScores((current) => ({ ...current, [engine]: { ...current[engine], [criterion]: value } }));
  }

  function resetDraft() {
    const fresh = defaultDraftForMarket(marketId);
    setMarketDrafts((current) => ({ ...current, [marketId]: fresh }));
    loadDraft(fresh);
    setCopied(false);
  }

  const briefText = useMemo(() => {
    const priorityLines = rankedEngines.map((item, index) =>
      `${index + 1}. ${engines[item.id].name} — ${item.score.toFixed(1)}/5 (${levelForScore(item.score)})`,
    ).join("\n");
    const top = rankedEngines.slice(0, 3).map((item) => engines[item.id].name).join(", ");
    return `NESCAFÉ RTD — CEP ENGINE MARKET BRIEF

MARKET
${market.name}
Growth driver: ${local.driver}
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
${local.moments[activeEngine]}

PRODUCT PROOF
Available: ${local.available}
Hero: ${local.hero}

CONSUMER INSIGHT
${evidence.audienceTension || "To confirm"}
Behaviour: ${evidence.audienceBehaviour || "To confirm"}

HOW NESCAFÉ CAN OWN THIS MOMENT
${engines[activeEngine].job}
${evidence.brandPermission || "Brand permission to confirm"}

LOCAL MARKET INSIGHT
${local.localInsight}

MARKET CONTEXT
Coffee/category: ${local.coffeeContext}
Mobility and occasion: ${local.mobilityContext}
Shopper and retail: ${local.retailContext}

WHEN TO TARGET
${activation.daypart}
${activation.trigger}

MEDIA PLAN
Role: ${activation.mediaRole}
Channels and formats:
${local.channels.split("\n").filter(Boolean).map((channel) => `- ${channel}`).join("\n")}
Audience and context targeting: ${local.targeting}
Measurement: ${activation.kpis}

CREATOR APPROACH
Archetype: ${local.creatorArchetype}
Selection criteria: ${local.creatorFit}
Story: ${activation.creatorStory}
Formats: ${local.creatorFormats}
Mandatories and paid use: ${local.creatorMandatories}

LOCAL VALIDATION REQUIRED
${local.validationAsk}

SOURCE BASIS
${local.sourceBasis}

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
  }, [market, local, audienceRoute, objective, rankedEngines, activeEngine, evidence, activation]);

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
    anchor.download = `NESCAFE_RTD_CEP_Brief_${market.name.replaceAll(" ", "_")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const steps = ["Evidence", "Engine scoring", "Market translation", "Market brief"];

  return (
    <main>
      <header className="topbar" id="top">
        <div className="brandmark" aria-label="NESCAFÉ RTD CEP Engine Builder">
          <div className="nescafe-logo-panel">
            <img className="nescafe-logo" src={`${basePath}/nescafe-logo-white.png`} alt="NESCAFÉ" />
          </div>
          <span className="brandmark-name">CEP Engine Builder</span>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={resetDraft}>Reset</button>
        </div>
      </header>

      <nav className="stepper" aria-label="Builder progress">
        {steps.map((label, index) => (
          <button key={label} onClick={() => setStep(index)} className={step === index ? "step active" : step > index ? "step complete" : "step"}>
            <strong>{label}</strong>
          </button>
        ))}
      </nav>

      <div className="workspace">
        {step === 0 && (
          <section className="panel" aria-labelledby="evidence-title">
            <div className="section-heading section-heading-visual">
              <h2 id="evidence-title">Build the evidence</h2>
              <img src={`${basePath}/rtd-evidence.webp`} alt="NESCAFÉ RTD being taken from a chilled fridge" />
            </div>

            <div className="setup-grid">
              <label>Market<select value={marketId} onChange={(event) => selectMarket(event.target.value as MarketId)}>
                {Object.entries(markets).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
              </select><small className="cluster-reference">{market.cluster} cluster</small></label>
              <label>Audience route<select value={audienceRoute} onChange={(event) => setAudienceRoute(event.target.value as AudienceRoute)}>
                <option>Balanced</option><option>Explorer</option><option>Perfectionist</option>
              </select></label>
              <label>Growth objective<input value={objective} onChange={(event) => setObjective(event.target.value)} /></label>
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
              <h2 id="score-title">Score the engines</h2>
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
              <h2 id="translate-title">Translate to market</h2>
              <select className="market-switch" aria-label="Market" value={marketId} onChange={(event) => selectMarket(event.target.value as MarketId)}>
                {Object.entries(markets).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
              </select>
            </div>

            <div className="market-summary">
              <div className="market-identity"><span>{market.cluster} CLUSTER</span><h3>{market.name}</h3><p>Independent evidence, scoring and brief</p></div>
              <label><span>GROWTH DRIVER</span><input value={local.driver} onChange={(event) => setLocal((current) => ({ ...current, driver: event.target.value }))} /></label>
              <label><span>AVAILABLE PRODUCT</span><input value={local.available} onChange={(event) => setLocal((current) => ({ ...current, available: event.target.value }))} /></label>
              <label><span>HERO PRODUCT PROOF</span><input value={local.hero} onChange={(event) => setLocal((current) => ({ ...current, hero: event.target.value }))} /></label>
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
              <div className="hook-intro">
                <img className="hook-image" src={`${basePath}/rtd-commute.webp`} alt="NESCAFÉ RTD during a city commute" />
                <div className="hook-intro-copy"><span>LOCAL HOOK</span><h3>{engines[activeEngine].name}</h3>
                  <p>{engines[activeEngine].transition}</p>
                  <label>Audience<select value={audienceRoute} onChange={(event) => setAudienceRoute(event.target.value as AudienceRoute)}>
                    <option>Balanced</option><option>Explorer</option><option>Perfectionist</option>
                  </select></label>
                </div>
              </div>
              <div className="hook-output">
                <article><span>HOLD FIXED</span><p>{engines[activeEngine].job}</p></article>
                <article><span>AUDIENCE REWARD</span><p>{audienceRewards[audienceRoute][activeEngine]}</p></article>
                <article className="wide editable-output"><label><span>LOCAL HOOK DIRECTION</span><textarea value={local.moments[activeEngine]} onChange={(event) => setLocal((current) => ({ ...current, moments: { ...current.moments, [activeEngine]: event.target.value } }))} /></label></article>
                <article className="editable-output"><label><span>LOCAL MARKET INSIGHT</span><textarea value={local.localInsight} onChange={(event) => setLocal((current) => ({ ...current, localInsight: event.target.value }))} /></label></article>
                <article className="editable-output"><label><span>MEDIA CONTEXT</span><textarea value={local.media} onChange={(event) => setLocal((current) => ({ ...current, media: event.target.value }))} /></label></article>
              </div>
            </div>

            <div className="market-detail-grid">
              <label><span>COFFEE + CATEGORY CONTEXT</span><textarea value={local.coffeeContext} onChange={(event) => setLocal((current) => ({ ...current, coffeeContext: event.target.value }))} /></label>
              <label><span>MOBILITY + OCCASION CONTEXT</span><textarea value={local.mobilityContext} onChange={(event) => setLocal((current) => ({ ...current, mobilityContext: event.target.value }))} /></label>
              <label><span>SHOPPER + RETAIL CONTEXT</span><textarea value={local.retailContext} onChange={(event) => setLocal((current) => ({ ...current, retailContext: event.target.value }))} /></label>
              <label><span>LOCAL VALIDATION REQUIRED</span><textarea value={local.validationAsk} onChange={(event) => setLocal((current) => ({ ...current, validationAsk: event.target.value }))} /></label>
              <label><span>CHANNELS + FORMATS</span><textarea value={local.channels} onChange={(event) => setLocal((current) => ({ ...current, channels: event.target.value }))} /></label>
              <label><span>AUDIENCE + CONTEXT TARGETING</span><textarea value={local.targeting} onChange={(event) => setLocal((current) => ({ ...current, targeting: event.target.value }))} /></label>
              <label><span>CREATOR ARCHETYPE</span><textarea value={local.creatorArchetype} onChange={(event) => setLocal((current) => ({ ...current, creatorArchetype: event.target.value }))} /></label>
              <label><span>CREATOR FORMATS</span><textarea value={local.creatorFormats} onChange={(event) => setLocal((current) => ({ ...current, creatorFormats: event.target.value }))} /></label>
            </div>
            <p className="market-source"><b>STARTER BASIS</b>{local.sourceBasis}</p>
          </section>
        )}

        {step === 3 && (
          <section className="panel brief-panel" aria-labelledby="brief-title">
            <div className="section-heading no-print">
              <h2 id="brief-title">Market brief</h2>
              <div className="brief-actions"><button className="secondary-button" onClick={copyBrief}>{copied ? "Copied" : "Copy brief"}</button>
                <button className="secondary-button" onClick={downloadBrief}>Download .txt</button>
                <button className="primary-button" onClick={() => window.print()}>Print / PDF</button></div>
            </div>

            <article className="brief-sheet">
              <div className="brief-header"><div><span>NESCAFÉ RTD</span><h2>CEP Engine Market Brief</h2></div>
                <div className="brief-header-side"><div className="brief-meta"><span>{market.cluster} CLUSTER</span><b>{market.name}</b></div>
                  <img className="brief-image" src={`${basePath}/rtd-brief.webp`} alt="Cold NESCAFÉ RTD product in an active city moment" /></div></div>
              <div className="brief-grid">
                <div className="brief-block"><span>GROWTH DRIVER</span><strong>{local.driver}</strong></div>
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
                  <article className="wide"><span>LOCAL HOOK</span><p>{local.moments[activeEngine]}</p></article>
                  <article><span>PRODUCT PROOF</span><p>{local.hero}</p></article><article><span>AVAILABLE PRODUCTS</span><p>{local.available}</p></article>
                </div>
              </div>

              <div className="brief-section">
                <span className="brief-label">MARKET SPRINGBOARD</span>
                <div className="insight-grid">
                  <article><span>CONSUMER INSIGHT</span><p>{evidence.audienceTension}</p><p className="detail-line">{evidence.audienceBehaviour}</p></article>
                  <article><span>HOW NESCAFÉ CAN OWN THE MOMENT</span><p>{engines[activeEngine].job}</p><p className="detail-line">{evidence.brandPermission}</p></article>
                  <article><span>LOCAL MARKET INSIGHT</span><p>{local.localInsight}</p></article>
                  <article><span>WHEN TO TARGET</span><strong>{activation.daypart}</strong><p>{activation.trigger}</p></article>
                  <article><span>COFFEE + CATEGORY CONTEXT</span><p>{local.coffeeContext}</p></article>
                  <article><span>MOBILITY + OCCASION CONTEXT</span><p>{local.mobilityContext}</p></article>
                  <article><span>SHOPPER + RETAIL CONTEXT</span><p>{local.retailContext}</p></article>
                  <article><span>LOCAL VALIDATION REQUIRED</span><p>{local.validationAsk}</p></article>
                </div>
              </div>

              <div className="brief-section activation-grid">
                <article className="activation-card media-activation">
                  <div className="activation-heading"><span>MEDIA OUTPUT</span><h3>Channels, timing and activation</h3></div>
                  <div className="activation-row"><span>MEDIA ROLE</span><p>{activation.mediaRole}</p></div>
                  <div className="activation-row"><span>CHANNELS + FORMATS</span><ul>{local.channels.split("\n").filter(Boolean).map((channel) => <li key={channel}>{channel}</li>)}</ul></div>
                  <div className="activation-row"><span>AUDIENCE + CONTEXT</span><p>{local.targeting}</p></div>
                  <div className="activation-row"><span>MEASUREMENT</span><p>{activation.kpis}</p></div>
                </article>

                <article className="activation-card creator-activation">
                  <div className="activation-heading"><span>CREATOR OUTPUT</span><h3>Who to use and what to make</h3></div>
                  <div className="activation-row"><span>CREATOR ARCHETYPE</span><p>{local.creatorArchetype}</p></div>
                  <div className="activation-row"><span>SELECTION CRITERIA</span><p>{local.creatorFit}</p></div>
                  <div className="activation-row"><span>CREATOR STORY</span><p>{activation.creatorStory}</p></div>
                  <div className="activation-row"><span>FORMATS + TERRITORIES</span><p>{local.creatorFormats}</p></div>
                  <div className="activation-row"><span>MANDATORIES + PAID USE</span><p>{local.creatorMandatories}</p></div>
                </article>
              </div>
              <div className="brief-footer"><b>WORKING STRATEGIC HYPOTHESIS</b><span>{local.sourceBasis}</span></div>
            </article>
          </section>
        )}

        <div className="navigation no-print"><button className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
          <button className="primary-button" disabled={step === 3} onClick={() => setStep((current) => Math.min(3, current + 1))}>{step === 2 ? "Build brief" : "Continue"}</button></div>
      </div>
    </main>
  );
}
