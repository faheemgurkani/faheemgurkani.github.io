export const profileData = {
  name: "Faheem.dev",
  quote: {
    text: "In the midst of chaos, there is also opportunity",
    author: "Sun-Tzu, A Arte da Guerra",
  },
  avatar: "/profile-picture.png",
  email: "faheemgurkani@gmail.com",
  phone: "+92 331-9090179",
  location: "Islamabad, Pakistan",
  social: {
    x: "https://x.com/faheemGurkani",
    github: "https://github.com/faheemgurkani",
    linkedin: "https://www.linkedin.com/in/muhammad-faheem-367a1b279/",
    medium: "https://medium.com/@faheemgurkani",
    substack: "https://therepresentationmanifold.substack.com",
    kaggle: "https://www.kaggle.com/faheemgurkani",
  },
}

export const socialLinks = [
  { label: "X", href: profileData.social.x },
  { label: "GITHUB", href: profileData.social.github },
  { label: "LINKEDIN", href: profileData.social.linkedin },
  { label: "MEDIUM", href: profileData.social.medium },
  { label: "SUBSTACK", href: profileData.social.substack },
  { label: "KAGGLE", href: profileData.social.kaggle },
] as const

export const GITHUB_USERNAME = "faheemgurkani"

/** Spotify GitHub Profile widget (now playing). */
export const SPOTIFY_UID = "31s7sk5rygjmtvf7pv4v7tlpg3di"
export const SPOTIFY_PROFILE_URL =
  `https://spotify-github-profile.kittinanx.com/api/view?uid=${SPOTIFY_UID}&redirect=true`
export const SPOTIFY_WIDGET_URL =
  `https://spotify-github-profile.kittinanx.com/api/view?uid=${SPOTIFY_UID}&cover_image=true&theme=novatorem&show_offline=false&background_color=0d0d0d&interchange=false&bar_color=737373&bar_color_cover=false`

export const RESUME_OPTIONS = [
  {
    label: "AI/ML Engineer",
    path: "/assets/Muhammad-Faheem-AI-ML-Engineer.pdf",
    filename: "Muhammad Faheem - AI-ML Engineer.pdf",
  },
  {
    label: "Backend Engineer",
    path: "/assets/Muhammad-Faheem-Backend-Engineer.pdf",
    filename: "Muhammad Faheem - Backend Engineer.pdf",
  },
  {
    label: "CV Engineer",
    path: "/assets/Muhammad-Faheem-CV-Engineer.pdf",
    filename: "Muhammad Faheem - CV Engineer.pdf",
  },
] as const

export const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/32703517175793864b061a2c1063759f"

function skillBar(level: number, width = 16): string {
  const filled = Math.max(0, Math.min(width, Math.round((level / 100) * width)))
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`
}

export const aboutData = {
  initMessage: "[ INITIALIZING PROTOCOL",
  headline: "Researcher & AI Engineer",
  headlineRoles: ["AI", "ML", "Backend", "Systems"] as const,
  headlineParts: {
    before: "Researcher & ",
    highlight: "AI",
    after: " Engineer",
  },
  description:
    "I am a dedicated AI and Machine Learning Engineer with a strong foundation in Computer Science and Artificial Intelligence. Currently pursuing my Bachelor's at the National University of Computer and Emerging Sciences (Islamabad Campus), I specialize in LLMs, Computer Vision, Agentic Workflows (RAG, MCP), and production-grade backend systems.",
  stats: [
    { value: "03+", label: "Years XP", target: 3, suffix: "+", pad: 2 },
    { value: "047", label: "Projects", target: 47, pad: 3 },
    { value: "062", label: "Stars", target: 62, pad: 3 },
    { value: "256k", label: "Lines of Code", target: 256, suffix: "k" },
  ],
  services: [
    {
      code: "SRV_01",
      title: "Research & Development",
      description:
        "Bridging research and production — classical ML through deep learning pipelines for real-world systems.",
    },
    {
      code: "SRV_02",
      title: "Generative AI & LLMs",
      description:
        "Building RAG agents, MCP tool-use systems, and LangGraph workflows for intelligent assistants.",
    },
    {
      code: "SRV_03",
      title: "Computer Vision",
      description:
        "Object detection, action segmentation, pose estimation, and interpretability with Grad-CAM / RT-DETR.",
    },
    {
      code: "SRV_04",
      title: "Cloud & Backend",
      description:
        "Deploying scalable AI systems with FastAPI, Docker, microservices, AWS, and Next.js frontends.",
    },
  ],
  marquee: [
    "OPEN TO AI / ML ROLES",
    "RESEARCH COLLABORATIONS",
    "AGENTIC SYSTEMS",
    "COMPUTER VISION",
    "BACKEND ENGINEERING",
  ],
}

export const resumeData = {
  education: [
    {
      code: "EDU_01",
      title: "NUCES — BS Artificial Intelligence",
      period: "Aug 2022 — Present",
      description:
        "GPA: 3.21/4.00 · Dean's List (Spring 2023) · Coursework: ANN, Machine Learning, Digital Image Processing, NLP, Data Structures, Algorithms.",
    },
    {
      code: "EDU_02",
      title: "APSACS — F.Sc. Pre-Engineering",
      period: "June 2022",
      description: "Marks: 1019/1100 · Ranked 2nd highest in graduating class.",
    },
  ],
  experience: {
    jobs: [
      {
        code: "EXP_01",
        title: "Research Engineer",
        company: "R7Simsens",
        employmentType: "Internship",
        period: "Mar 2026 — Jun 2026",
        duration: "4 mos",
        location: "Virginia, United States · Remote",
        bullets: [
          "Developed LLM-based pipeline components for autonomous vehicle simulation infrastructure, focusing on structured map representation and generation.",
          "Contributed to multi-modal AI architectures spanning HD map and scenario generation, integrating state-of-the-art world foundation models.",
        ],
        skills: ["Research and Development (R&D)"],
      },
      {
        code: "EXP_02",
        title: "Research Intern",
        company: "Harbin Engineering University",
        employmentType: "Internship",
        period: "Jun 2025 — Aug 2025",
        duration: "3 mos",
        location: "Islamabad, Pakistan · Remote",
        bullets: [
          "Completed technical and programming assignments on a research project in Artificial Intelligence — deep learning for speech processing.",
        ],
      },
      {
        code: "EXP_03",
        title: "AI Engineering Intern",
        company: "National Aerospace Science & Technology Park (NASTP)",
        employmentType: "Internship",
        period: "Jun 2025 — Aug 2025",
        duration: "3 mos",
        location: "Rawalpindi, Pakistan · On-site",
        bullets: [
          "Designed and implemented an LLM-assisted OCR pipeline for business-card digitization with structured entity extraction and contact-management integration.",
          "Built an offline gRPC multi-person behavior analysis system combining object detection, MOT, pose estimation, and spatio-temporal action recognition for controlled evaluation and benchmarking.",
        ],
        skills: ["Machine Learning", "Deep Learning"],
      },
      {
        code: "EXP_04",
        title: "Hosted Researcher",
        company: "AITeC, National Centre for Physics (NCP)",
        employmentType: "Internship",
        period: "Aug 2024 — Aug 2025",
        duration: "1 yr 1 mo",
        location: "Islamabad, Pakistan · On-site",
        bullets: [
          "Comparative analysis of classical and deep learning object-tracking methods with focus on single-object tracking (SOT).",
          "Researched deep learning fault/anomaly detection for HVAC systems, leading to an accepted IEEE SusTech 2026 paper: “Deep Learning-Based Fault Detection Framework for Predictive Maintenance in HVAC Systems.”",
        ],
      },
    ],
    societies: [
      {
        code: "SOC_01",
        organization: "Google Developer Groups on Campus — FAST Islamabad",
        employmentType: "Apprenticeship",
        period: "Sep 2023 — May 2026",
        duration: "2 yrs 9 mos",
        location: "Islamabad, Pakistan · On-site",
        roles: [
          {
            title: "Officer | Team: Backend Dev. / Technical Projects",
            period: "Oct 2025 — May 2026",
            duration: "8 mos",
            bullets: [
              "Lead backend development and technical project delivery for campus GDG initiatives.",
              "Coordinate cross-functional teams on event tooling, APIs, and developer workflows.",
            ],
            skills: ["Organization Skills"],
          },
          {
            title: "Head | Team: Information & Coordination / PR-Internals",
            period: "Sep 2024 — Oct 2025",
            duration: "1 yr 2 mos",
            bullets: [
              "Led information, coordination, and internal PR operations for the campus chapter.",
              "Managed internal communications, event logistics, and officer coordination across teams.",
            ],
            skills: ["Organization Skills"],
          },
          {
            title: "Officer | Team: Information & Coordination / PR-Internals",
            period: "Sep 2023 — Sep 2024",
            duration: "1 yr 1 mo",
            bullets: [
              "Supported PR-internals and information coordination for GDG FAST Islamabad events.",
              "Assisted in organizing campus tech activities and member engagement programs.",
            ],
            skills: ["Organization Skills"],
          },
        ],
      },
    ],
  },
  skills: [
    {
      id: "languages",
      code: "MOD_01",
      category: "Languages",
      path: "skills/languages/",
      items: [
        { name: "Python", level: 95, bar: skillBar(95) },
        { name: "C/C++", level: 78, bar: skillBar(78) },
        { name: "C#", level: 65, bar: skillBar(65) },
        { name: "JavaScript", level: 72, bar: skillBar(72) },
      ],
    },
    {
      id: "ml-dl",
      code: "MOD_02",
      category: "ML & Deep Learning",
      path: "skills/ml_deep_learning/",
      items: [
        { name: "PyTorch", level: 92, bar: skillBar(92) },
        { name: "TensorFlow", level: 80, bar: skillBar(80) },
        { name: "Keras", level: 78, bar: skillBar(78) },
        { name: "scikit-learn", level: 85, bar: skillBar(85) },
        { name: "YOLO", level: 82, bar: skillBar(82) },
        { name: "Hugging Face", level: 84, bar: skillBar(84) },
        { name: "ONNX", level: 70, bar: skillBar(70) },
        { name: "TensorRT", level: 68, bar: skillBar(68) },
        { name: "LangChain", level: 86, bar: skillBar(86) },
        { name: "LangGraph", level: 84, bar: skillBar(84) },
        { name: "crewAI", level: 75, bar: skillBar(75) },
      ],
    },
    {
      id: "web-apis",
      code: "MOD_03",
      category: "Web & APIs",
      path: "skills/web_apis/",
      items: [
        { name: "Docker", level: 80, bar: skillBar(80) },
        { name: "AWS", level: 72, bar: skillBar(72) },
        { name: "Streamlit", level: 78, bar: skillBar(78) },
        { name: "Gradio", level: 76, bar: skillBar(76) },
        { name: "REST APIs", level: 85, bar: skillBar(85) },
        { name: "MCP", level: 82, bar: skillBar(82) },
        { name: "FastMCP", level: 80, bar: skillBar(80) },
        { name: "Next.js", level: 78, bar: skillBar(78) },
      ],
    },
    {
      id: "data-tools",
      code: "MOD_04",
      category: "Data & Tools",
      path: "skills/data_tools/",
      items: [
        { name: "NumPy", level: 90, bar: skillBar(90) },
        { name: "Pandas", level: 88, bar: skillBar(88) },
        { name: "Git", level: 85, bar: skillBar(85) },
        { name: "GitHub", level: 85, bar: skillBar(85) },
        { name: "Linux (Ubuntu)", level: 80, bar: skillBar(80) },
        { name: "n8n", level: 70, bar: skillBar(70) },
      ],
    },
  ],
}

export const certificationData = {
  items: [
    {
      code: "CERT_01",
      title: "Disaster Risk Monitoring Using Satellite Imagery",
      period: "NVIDIA · 2025",
      description: "Satellite imagery and remote-sensing ML for disaster risk monitoring.",
    },
    {
      code: "CERT_02",
      title: "Building RAG Agents with LLMs",
      period: "NVIDIA · 2025",
      description: "Retrieval-augmented generation agents with large language models.",
    },
    {
      code: "CERT_03",
      title: "Generative AI with Large Language Models",
      period: "DeepLearning.AI · 2024",
      description: "Foundations and applications of generative AI and LLMs.",
    },
    {
      code: "CERT_04",
      title: "Convolutional Neural Networks",
      period: "DeepLearning.AI · 2024",
      description: "CNN architectures for vision tasks and transfer learning.",
    },
    {
      code: "CERT_05",
      title: "AWS Cloud Technical Essentials",
      period: "Amazon Web Services · 2024",
      description: "Core AWS services, IAM, compute, storage, and networking.",
    },
    {
      code: "CERT_06",
      title: "DevOps on AWS",
      period: "Amazon Web Services · 2024",
      description: "CI/CD, infrastructure automation, and DevOps practices on AWS.",
    },
    {
      code: "CERT_07",
      title: "Neural Networks and Deep Learning",
      period: "DeepLearning.AI · 2023",
      description: "Fundamentals of neural networks and deep learning.",
    },
  ],
  linkedinUrl:
    "https://www.linkedin.com/in/muhammad-faheem-367a1b279/details/certifications/",
}

/** Curated fallback projects when GitHub API is unavailable. */
export const curatedProjects = [
  {
    code: "PROJ_01",
    title: "Action Segmentation Using MS-TCN",
    category: "computer vision",
    image: "/placeholder.svg",
    tags: "#PYTORCH #MS-TCN #CV",
    description:
      "Multi-stage temporal convolutional network in PyTorch to segment and label actions in video sequences.",
    repoUrl: "https://github.com/faheemgurkani/action-segmentation-using-ms-tcn",
  },
  {
    code: "PROJ_02",
    title: "Driver Assistance System Using RT-DETR",
    category: "computer vision",
    image: "/placeholder.svg",
    tags: "#RT-DETR #FASTAPI #NEXTJS",
    description:
      "Real-time ADAS with fine-tuned RT-DETR, dual data pipelines, and FastAPI–Next.js dashcam processing.",
    repoUrl: "https://github.com/faheemgurkani/driver-assistance-system-using-RT-DETR",
  },
  {
    code: "PROJ_03",
    title: "Malaria Classification & Interpretability",
    category: "ai/ml",
    image: "/placeholder.svg",
    tags: "#CNN #GRAD-CAM #MEDICAL",
    description:
      "CNN to classify parasitized vs healthy cells with Grad-CAM decision visualization.",
    repoUrl:
      "https://github.com/faheemgurkani/malaria-classification-and-interpretability-with-grad-cam",
  },
  {
    code: "PROJ_04",
    title: "Trendstory Microservice",
    category: "backend",
    image: "/placeholder.svg",
    tags: "#FASTAPI #GRPC #LLMS",
    description:
      "FastAPI/gRPC service that turns YouTube and Google Trends topics into theme-customized stories.",
    repoUrl: "https://github.com/faheemgurkani/trendstory-microservice",
  },
  {
    code: "PROJ_05",
    title: "Privacy-Aware Agent MCP System",
    category: "ai/ml",
    image: "/placeholder.svg",
    tags: "#MCP #AGENTS #PRIVACY",
    description:
      "Privacy-aware multi-step MCP workflow combining tool-based reasoning with LLMs.",
    repoUrl: "https://github.com/faheemgurkani/privacy-agent-mcp",
  },
  {
    code: "PROJ_06",
    title: "Agentic AI Workflow for Tabular Data",
    category: "ai/ml",
    image: "/placeholder.svg",
    tags: "#LANGGRAPH #OPENAI #DUCKDB",
    description:
      "Single-agent LangGraph system for intelligent workflows on DuckDB tabular datasets.",
    repoUrl:
      "https://github.com/faheemgurkani/agentic-workflow-for-tabular-data-using-langraph-and-openai",
  },
  {
    code: "PROJ_07",
    title: "Text Controlled Object Relocation",
    category: "computer vision",
    image: "/placeholder.svg",
    tags: "#VLM #INPAINTING #CV",
    description:
      "Vision-language pipeline to detect, segment, remove, and relocate objects from natural language prompts.",
    repoUrl:
      "https://github.com/faheemgurkani/text-controlled-object-relocation-and-relighting",
  },
  {
    code: "PROJ_08",
    title: "Multi-person Behaviour Recognition",
    category: "computer vision",
    image: "/placeholder.svg",
    tags: "#GRPC #VITPOSE #TIMESFORMER",
    description:
      "Offline gRPC pipeline for multi-person detection, tracking, pose, and action classification.",
    repoUrl: "https://github.com/faheemgurkani/multi-person-behavior-recognition-system",
  },
  {
    code: "PROJ_09",
    title: "Agentic RAG Multi-Project Research Lab",
    category: "ai/ml",
    image: "/placeholder.svg",
    tags: "#RAG #SECURITY #MULTI-TENANT",
    description:
      "Secure multi-tenant RAG framework with data isolation, PII masking, and injection protection.",
    repoUrl: "https://github.com/faheemgurkani/agentic-rag-multi-project-research-lab",
  },
]

export const portfolioData = {
  categories: ["all", "computer vision", "ai/ml", "backend", "systems"],
  projects: curatedProjects,
}

export const blogData = {
  posts: [
    {
      code: "LOG_001",
      title: "LocateAnything on Real Traffic: A Zero-Shot Evaluation on D²-City Dashcam Video",
      category: "Computer Vision",
      date: "Jun 23, 2026",
      readTime: "19 min",
      excerpt:
        "A zero-shot evaluation of LocateAnything-3B on D²-City — no fine-tuning, no domain adaptation, just the pretrained model on real traffic.",
      tags: ["autonomous-vehicles", "nvidia", "computer-vision", "VLM"],
      href: "https://medium.com/@faheemgurkani/can-a-generalist-vision-language-model-see-traffic-3ec6a85cf4d5",
    },
    {
      code: "LOG_002",
      title: "The Epistemic Gap: Why Foundational Models Hallucinate",
      category: "LLMs",
      date: "Feb 01, 2026",
      readTime: "12 min",
      excerpt:
        "From statistical necessity to reward design failure — why foundational models hallucinate and the path to calibrated honesty.",
      tags: ["LLM", "hallucinations", "foundational-model"],
      href: "https://medium.com/@faheemgurkani/the-epistemic-gap-why-foundational-models-hallucinate-and-the-path-to-calibrated-honesty-cc637db665a9",
    },
    {
      code: "LOG_003",
      title: "The Evolution of Vision Architectures: CNNs to Swin Transformers",
      category: "Computer Vision",
      date: "Dec 22, 2025",
      readTime: "8 min",
      excerpt:
        "From inductive bias to scalable self-attention — tracing modern computer vision from CNNs to Vision and Swin Transformers.",
      tags: ["CNN", "transformers", "swin"],
      href: "https://medium.com/@faheemgurkani/the-evolution-of-vision-architectures-from-cnns-to-vision-transformers-and-swin-transformers-86e851952eae",
    },
    {
      code: "LOG_004",
      title: "RT-DETR: How DETRs Finally Beat YOLOs in Real-time Detection",
      category: "Computer Vision",
      date: "Nov 02, 2025",
      readTime: "6 min",
      excerpt:
        "How Baidu and Peking University’s RT-DETR redefines real-time object detection without relying on NMS.",
      tags: ["RT-DETR", "object-detection", "transformers"],
      href: "https://medium.com/@faheemgurkani/rt-detr-how-detrs-finally-beat-yolos-in-real-time-object-detection-a817aaf69a74",
    },
    {
      code: "LOG_005",
      title: "Self-Supervision: Overcoming the Bottlenecks of Supervised Learning",
      category: "ML",
      date: "Aug 15, 2025",
      readTime: "4 min",
      excerpt:
        "How self-supervised learning has powered large language models and beyond.",
      tags: ["self-supervised", "LLM", "ML"],
      href: "https://medium.com/@faheemgurkani/self-supervision-overcoming-the-bottlenecks-of-supervised-learning-d6ab3c1a00b9",
    },
    {
      code: "LOG_006",
      title: "Exploring Class Activation Maps (CAM) for CNN Interpretability",
      category: "Interpretability",
      date: "Jan 22, 2025",
      readTime: "8 min",
      excerpt:
        "A guide to Class Activation Maps and Grad-CAM for making CNN decisions transparent.",
      tags: ["Grad-CAM", "CNN", "interpretability"],
      href: "https://medium.com/@faheemgurkani/exploring-class-activation-maps-cam-unveiling-the-decision-making-process-of-cnns-fb9de759880e",
    },
  ],
}

export const contactData = {
  email: "faheemgurkani@gmail.com",
  phone: "+92 331-9090179",
  location: "Islamabad, Pakistan",
  intro:
    "I am currently open to research collaborations and engineering roles in AI, Machine Learning, and Backend development. Feel free to reach out directly or send a message using the form.",
}
