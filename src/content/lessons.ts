// Lesson content. Rules (see README "Lesson content rules"):
// - Every lesson cites its sources; every factual claim traces to one of them.
// - U.S. government sources (CDC, NIDA, NCI's Smokefree Teen) are public domain; we paraphrase in our own words.
// - No statistic appears unless a cited source states it.
// Sources were fetched and checked on 2026-10-25.

export interface Citation {
  title: string;
  org: string;
  url: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // index into options
  explain: string;
}

export interface Lesson {
  slug: string;
  track: string;
  title: string;
  emoji: string;
  cards: { title: string; body: string; visual?: "reward-loop" | "craving-wave" }[];
  quiz: QuizQuestion[];
  citations: Citation[];
}

const SRC = {
  cdcYouth: {
    title: "E-Cigarettes and Youth: What Parents Need to Know",
    org: "Centers for Disease Control and Prevention (CDC)",
    url: "https://www.cdc.gov/tobacco/e-cigarettes/youth.html",
  },
  nida: {
    title: "Vaping Devices (Electronic Cigarettes) DrugFacts",
    org: "National Institute on Drug Abuse (NIDA), NIH",
    url: "https://nida.nih.gov/publications/drugfacts/vaping-devices-electronic-cigarettes",
  },
  cravings: {
    title: "Deal With Vape Cravings",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/deal-with-vape-cravings",
  },
  withdrawal: {
    title: "Vaping Addiction and Nicotine Withdrawal",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/vaping-addiction-nicotine-withdrawal",
  },
  firstDay: {
    title: "Your First Day Without Vaping",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/your-first-day-without-vaping",
  },
  triggers: {
    title: "Understand Your Vaping Triggers",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/understand-your-vaping-triggers",
  },
  howToQuit: {
    title: "How to Quit Vaping",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/how-to-quit-vaping",
  },
  stress: {
    title: "Anxiety, Stress, and Vaping",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/quit-vaping/anxiety-stress-vaping",
  },
  realityCheck: {
    title: "Vaping Reality Check",
    org: "Smokefree Teen, National Cancer Institute",
    url: "https://teen.smokefree.gov/vaping-reality-check",
  },
  stickWithIt: {
    title: "Stick With It",
    org: "Smokefree.gov, National Cancer Institute",
    url: "https://smokefree.gov/challenges-when-quitting/stick-with-it",
  },
  ab2711: {
    title: "California Education Code §48900 (as amended by AB 2711, Stats. 2024, Ch. 840)",
    org: "California Legislative Information",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=EDC&sectionNum=48900",
  },
  edc48901: {
    title: "California Education Code §48901(d), defining “tobacco product” via Bus. & Prof. Code §22950.5(d), which includes electronic cigarettes",
    org: "California Legislative Information",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=EDC&sectionNum=48901",
  },
  stanfordToolkit: {
    title: "Tobacco Prevention Toolkit (incl. Healthy Futures, You and Me, Together Vape-Free)",
    org: "Stanford REACH Lab",
    url: "https://med.stanford.edu/tobaccopreventiontoolkit.html",
  },
} satisfies Record<string, Citation>;

export const LESSONS: Lesson[] = [
  {
    slug: "nicotine-and-your-brain",
    track: "vaping",
    title: "What nicotine does to a teen brain",
    emoji: "🧠",
    cards: [
      {
        title: "Your brain is still under construction",
        body: "The teen years are a big time for brain development, and it keeps going into young adulthood. The CDC says no tobacco product, vapes included, is safe, especially for teens and young adults.",
      },
      {
        title: "The reward loop",
        body: "Nicotine switches on your brain's reward circuits and raises dopamine, a chemical messenger that makes your brain want to repeat whatever caused it. That loop is what makes vaping feel like something you need.",
        visual: "reward-loop",
      },
      {
        title: "What it can affect",
        body: "The CDC says nicotine can harm the parts of a teen's brain that handle attention, learning, mood, and impulse control: the exact stuff you need for school.",
      },
      {
        title: "Most vapes have it",
        body: "Most e-cigarettes contain nicotine, and nicotine in any form is highly addictive. The aerosol also usually carries flavorings and other chemicals.",
      },
    ],
    quiz: [
      {
        q: "Which brain chemical does nicotine raise, making you want to use it again?",
        options: ["Dopamine", "Melatonin", "Insulin"],
        answer: 0,
        explain: "Nicotine raises dopamine in the reward circuit, which reinforces the habit.",
      },
      {
        q: "According to the CDC, nicotine can harm the parts of a teen brain that control…",
        options: ["Only your sense of smell", "Attention, learning, mood, and impulse control", "Nothing, it's harmless"],
        answer: 1,
        explain: "Attention, learning, mood, and impulse control are all still developing in teens.",
      },
      {
        q: "True or false: brain development is finished by the start of high school.",
        options: ["True", "False"],
        answer: 1,
        explain: "False. NIDA says development continues into young adulthood.",
      },
    ],
    citations: [SRC.cdcYouth, SRC.nida],
  },
  {
    slug: "cravings-pass",
    track: "vaping",
    title: "Cravings peak and pass",
    emoji: "🌊",
    cards: [
      {
        title: "A craving is temporary",
        body: "Cravings feel huge in the moment, but they fade, and they keep getting weaker the longer you stay quit. Your job isn't to never feel one. It's to outlast it.",
        visual: "craving-wave",
      },
      {
        title: "Switch it up",
        body: "When one hits, stop what you're doing and do something different. Even a small change in routine can shake it off.",
      },
      {
        title: "Move or breathe",
        body: "Walk, take the stairs a few times, or breathe in slowly through your nose and out through your mouth, about 10 times.",
      },
      {
        title: "Don't do it alone",
        body: "Text someone supportive, play a game on your phone, or chat with a free expert. That's what the SOS button in this app is for.",
      },
    ],
    quiz: [
      {
        q: "What happens to cravings the longer you stay vape-free?",
        options: ["They get stronger forever", "They fade over time", "They stay exactly the same"],
        answer: 1,
        explain: "Smokefree Teen: cravings are temporary and fade the longer you stay quit.",
      },
      {
        q: "A craving hits during homework. Which move is on the expert list?",
        options: ["Take one hit to take the edge off", "Get up and do something different", "Stare at the vape until it passes"],
        answer: 1,
        explain: "Changing what you're doing is a top tip. 'Just one hit' keeps the reward loop going.",
      },
      {
        q: "The breathing tip says to breathe in through your ___ and out through your ___.",
        options: ["nose / mouth", "mouth / nose", "mouth / mouth"],
        answer: 0,
        explain: "In slowly through your nose, out slowly through your mouth, about 10 times.",
      },
    ],
    citations: [SRC.cravings],
  },
  {
    slug: "first-week",
    track: "vaping",
    title: "Surviving the first week",
    emoji: "📅",
    cards: [
      {
        title: "Withdrawal is real, and it ends",
        body: "Feeling irritable, anxious, down, tired, foggy, hungry, or having trouble sleeping is normal after quitting. These feelings fade if you stay away from vapes.",
      },
      {
        title: "Quit day: not even one hit",
        body: "Take it one day at a time. Throw away your vapes, pods, and chargers so they're not there when it gets hard.",
      },
      {
        title: "Basics that help",
        body: "Drink lots of water, make sleep a priority, and keep gum or snacks in your backpack.",
      },
      {
        title: "Tell people",
        body: "Let friends and family know your quit day, and ask for support in the first days and weeks. Reward yourself at the end of each vape-free day.",
      },
    ],
    quiz: [
      {
        q: "Which of these is a normal withdrawal symptom?",
        options: ["Feeling irritable or restless", "Growing taller", "Better night vision"],
        answer: 0,
        explain: "Irritability, anxiety, low mood, tiredness, and trouble sleeping are all common, and they fade.",
      },
      {
        q: "What should you do with your vapes, pods, and chargers on quit day?",
        options: ["Hide them just in case", "Throw them away", "Give them to a friend"],
        answer: 1,
        explain: "Getting rid of them removes the easy option when a craving hits.",
      },
      {
        q: "What's the rule for quit day?",
        options: ["Cut down to half", "Not even one hit", "Only vape at night"],
        answer: 1,
        explain: "Smokefree Teen: the most important thing on quit day is not vaping at all.",
      },
    ],
    citations: [SRC.withdrawal, SRC.firstDay],
  },
  {
    slug: "know-your-triggers",
    track: "vaping",
    title: "Know your triggers",
    emoji: "🎯",
    cards: [
      {
        title: "Three kinds",
        body: "Social triggers (friends vaping, parties, being offered a flavor), everyday triggers (your phone, the school bathroom, homework), and emotional triggers (stress, boredom, even feeling happy).",
      },
      {
        title: "Social",
        body: "Plan what you'll say ahead of time, avoid places where people vape, and ask friends not to vape around you.",
      },
      {
        title: "Everyday",
        body: "Change your routine, find a replacement habit, and watch out for downtime. That's when cravings sneak in.",
      },
      {
        title: "Emotional",
        body: "Take a break, move around, take care of yourself, and reach out to someone. Celebrate wins without a vape.",
      },
    ],
    quiz: [
      {
        q: "'Going into the school bathroom' is what kind of trigger?",
        options: ["Social", "Everyday", "Emotional"],
        answer: 1,
        explain: "It's a place and routine, so it's an everyday trigger.",
      },
      {
        q: "Can positive feelings like excitement be triggers?",
        options: ["Yes", "No, only bad moods"],
        answer: 0,
        explain: "Happy, excited, or relieved can all trigger cravings too.",
      },
      {
        q: "Best prep for a party where people will vape?",
        options: ["Wing it", "Plan what you'll say if someone offers", "Bring your own vape just in case"],
        answer: 1,
        explain: "Having your line ready makes saying no way easier.",
      },
    ],
    citations: [SRC.triggers, SRC.howToQuit],
  },
  {
    slug: "asking-for-help-is-safe",
    track: "vaping",
    title: "Asking for help can't get you suspended",
    emoji: "🛡️",
    cards: [
      {
        title: "You don't have to do it alone",
        body: "Supportive people make quitting easier. That can be a parent, a counselor, a doctor, or a free quit line.",
      },
      {
        title: "California's AB 2711",
        body: "Since January 1, 2025, California law says a student who voluntarily tells their school they use a tobacco product, in order to get help, can't be suspended just for that disclosure.",
      },
      {
        title: "What it does and doesn't cover",
        body: "It protects you for coming forward to get help. It doesn't cover getting caught. And yes, vapes count: California's Education Code defines 'tobacco product' to include electronic cigarettes.",
      },
      {
        title: "How to start the conversation",
        body: "Try: “I've been vaping and I want to stop. Can you help me figure out how?” Telling them what kind of support you want really helps.",
      },
    ],
    quiz: [
      {
        q: "Under AB 2711, what can't you be suspended for, by itself?",
        options: [
          "Getting caught vaping in class",
          "Voluntarily telling the school you use, to seek help",
          "Selling vapes",
        ],
        answer: 1,
        explain: "The protection is for voluntarily disclosing in order to seek help.",
      },
      {
        q: "When did this California law take effect?",
        options: ["January 1, 2025", "It isn't a real law", "Only in 2030"],
        answer: 0,
        explain: "AB 2711 (Stats. 2024, Ch. 840) took effect January 1, 2025.",
      },
      {
        q: "Who can help you quit?",
        options: ["Only yourself", "Parents, counselors, doctors, free quit lines", "Nobody, it's embarrassing"],
        answer: 1,
        explain: "You don't have to do it alone. Check the Get Help tab for free services.",
      },
    ],
    citations: [SRC.ab2711, SRC.edc48901, SRC.howToQuit],
  },
  {
    slug: "stress-without-vaping",
    track: "vaping",
    title: "Stress without the vape",
    emoji: "😮‍💨",
    cards: [
      {
        title: "The trap",
        body: "It's tempting to reach for a vape when you're stressed or anxious, but vaping isn't an effective way to cope.",
      },
      {
        title: "Mood dips are temporary",
        body: "Feeling worse right after quitting is usually temporary while your body adjusts to being without nicotine.",
      },
      {
        title: "What works instead",
        body: "Stop and breathe, move your body, learn what sets off your anxiety, cut back on caffeine, and reach out to people you trust.",
      },
    ],
    quiz: [
      {
        q: "Is vaping an effective way to cope with stress?",
        options: ["Yes", "No"],
        answer: 1,
        explain: "Smokefree Teen: vaping is not an effective way to cope.",
      },
      {
        q: "Mood changes after quitting are usually…",
        options: ["Permanent", "Temporary while your body adjusts"],
        answer: 1,
        explain: "They usually pass as your body adjusts to no nicotine.",
      },
      {
        q: "Which is on the list of healthy stress tools?",
        options: ["More energy drinks", "Move your body", "Stay up later"],
        answer: 1,
        explain: "Moving your body helps. Cutting caffeine is on the list too.",
      },
    ],
    citations: [SRC.stress],
  },
  {
    slug: "setbacks-arent-failure",
    track: "vaping",
    title: "A setback isn't failure",
    emoji: "🔁",
    cards: [
      {
        title: "Normal, not the end",
        body: "Setbacks are a normal part of quitting. Most people need more than one try to quit for good, and that's okay.",
      },
      {
        title: "Learn, don't quit quitting",
        body: "Use it as information: what triggered it, and what will you do differently next time? Then get back on track.",
      },
      {
        title: "Nothing here gets wiped",
        body: "Cloudbreak doesn't use streaks. It counts the days you show up, and resetting your quit day never erases your lessons, XP, or the days you've already done.",
      },
    ],
    quiz: [
      {
        q: "According to Smokefree.gov, most people need ___ to quit for good.",
        options: ["Exactly one try", "Multiple tries", "A prescription"],
        answer: 1,
        explain: "Multiple attempts are normal, and each one teaches you something.",
      },
      {
        q: "After a setback, the best move is to…",
        options: ["Give up, it's over", "Figure out what triggered it and restart", "Hide it from everyone"],
        answer: 1,
        explain: "Learn from it and get back on track.",
      },
      {
        q: "In Cloudbreak, resetting your quit day erases your progress.",
        options: ["True", "False"],
        answer: 1,
        explain: "False. Your lessons, XP, and the days you showed up all stay. A setback doesn't delete anything.",
      },
    ],
    citations: [SRC.stickWithIt],
  },
  {
    slug: "money-math",
    track: "vaping",
    title: "The money math",
    emoji: "💸",
    cards: [
      {
        title: "Do the math",
        body: "Add up what you spend on vapes in a week, then multiply by 52. That's your yearly vape bill.",
      },
      {
        title: "Make it real",
        body: "Your dashboard tracks money saved since your quit day. Pick something you'd actually buy with it.",
      },
      {
        title: "Not just money",
        body: "The aerosol you inhale has chemicals that can harm your lungs and heart.",
      },
    ],
    quiz: [
      {
        q: "To find your yearly vape spending, multiply your weekly spending by…",
        options: ["12", "52", "365"],
        answer: 1,
        explain: "There are 52 weeks in a year.",
      },
      {
        q: "If you spent $15 a week, how much is that a year?",
        options: ["$180", "$780", "$5,475"],
        answer: 1,
        explain: "$15 × 52 = $780.",
      },
      {
        q: "Vape aerosol can harm your…",
        options: ["Lungs and heart", "Nothing at all"],
        answer: 0,
        explain: "Smokefree Teen: it has chemicals that can harm your lungs and heart.",
      },
    ],
    citations: [SRC.realityCheck],
  },
];

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
