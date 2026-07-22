export const projects = [
  {
    id: "launch-campaign",
    category: "agency",
    title: "Launch Campaign",
    client: "Northstar Creative",
    year: "2025",
    role: "Campaign Strategy + Copy",
    description:
      "A launch campaign designed to give a growing brand a clearer voice, stronger positioning, and a more memorable rollout.",
    challenge:
      "The brand had a strong product but lacked a unified campaign story and consistent message across channels.",
    solution:
      "I developed the campaign concept, messaging hierarchy, launch copy, and creative direction around one central narrative.",
    result:
      "The final campaign created a clearer brand identity and gave the client a repeatable framework for future launches.",
    services: [
      "Campaign Strategy",
      "Brand Messaging",
      "Creative Direction",
      "Launch Copy",
    ],
    accent: "coral",
  },
  {
    id: "social-world",
    category: "agency",
    title: "Social World",
    client: "Orbit Studio",
    year: "2025",
    role: "Social Campaign Development",
    description:
      "A social-first campaign system created to turn brand content into a connected, recognizable world.",
    challenge:
      "The client’s social content felt disconnected and did not have a consistent visual or verbal identity.",
    solution:
      "I created recurring campaign themes, content pillars, copy systems, and a unified direction for each platform.",
    result:
      "The brand gained a more recognizable content presence and a stronger foundation for ongoing publishing.",
    services: [
      "Content Strategy",
      "Social Copy",
      "Campaign Concepts",
      "Brand Voice",
    ],
    accent: "gold",
  },
  {
    id: "brand-restart",
    category: "agency",
    title: "Brand Restart",
    client: "Restart Labs",
    year: "2024",
    role: "Brand Positioning + Messaging",
    description:
      "A brand refresh built around stronger positioning, clearer language, and a more confident market presence.",
    challenge:
      "The company had evolved, but the brand language still represented an older version of the business.",
    solution:
      "I rebuilt the message architecture and created updated positioning, tone, and campaign language.",
    result:
      "The refreshed brand felt more focused, current, and aligned with the company’s future direction.",
    services: [
      "Positioning",
      "Messaging",
      "Tagline Development",
      "Brand Voice",
    ],
    accent: "green",
  },
  {
    id: "future-of-play",
    category: "student",
    title: "Future of Play",
    client: "Student Concept",
    year: "2025",
    role: "Concept + Writing",
    description:
      "A speculative campaign exploring the future of entertainment, gaming, and interactive storytelling.",
    challenge:
      "Create a campaign idea that felt futuristic without losing emotional clarity or human connection.",
    solution:
      "I developed a story-led concept centered on how people may play, connect, and create in the future.",
    result:
      "The project became a complete campaign concept with its own world, voice, and visual direction.",
    services: [
      "Concept Development",
      "Campaign Writing",
      "Research",
      "Creative Direction",
    ],
    accent: "blue",
  },
  {
    id: "culture-quest",
    category: "student",
    title: "Culture Quest",
    client: "Student Concept",
    year: "2024",
    role: "Strategy + Creative Writing",
    description:
      "A campaign concept designed to turn cultural discovery into an interactive journey.",
    challenge:
      "Present cultural education in a way that felt exciting, respectful, and accessible.",
    solution:
      "I built the campaign around exploration, collectible stories, and interactive learning.",
    result:
      "The final concept combined educational value with a playful and memorable experience.",
    services: [
      "Campaign Strategy",
      "Storytelling",
      "Experience Design",
      "Copywriting",
    ],
    accent: "purple",
  },
  {
    id: "level-up-learning",
    category: "student",
    title: "Level Up Learning",
    client: "Student Concept",
    year: "2024",
    role: "Creative Strategy",
    description:
      "An education campaign that uses gaming language to make learning feel active and rewarding.",
    challenge:
      "Make an academic subject feel engaging to a younger, digital-first audience.",
    solution:
      "I structured the campaign around levels, challenges, progress, and achievement.",
    result:
      "The concept transformed a traditional learning message into a more motivational experience.",
    services: [
      "Creative Strategy",
      "Educational Messaging",
      "Campaign Concept",
      "Copywriting",
    ],
    accent: "orange",
  },
];

export const getProjectsByCategory = (category) =>
  projects.filter((project) => project.category === category);

export const getProjectById = (projectId) =>
  projects.find((project) => project.id === projectId);