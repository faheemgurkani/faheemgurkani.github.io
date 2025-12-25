import { Project, Experience, Education, Certification, SkillCategory } from './types';

export const PERSONAL_INFO = {
  name: "Muhammad Faheem",
  role: "AI Engineer | Machine Learning Engineer | Backend Engineer",
  tagline: "Engineering intelligent systems for the real world.",
  email: "faheemgurkani@gmail.com",
  phone: "+92 331-9090179",
  social: {
    linkedin: "muhammad-faheem",
    github: "faheemgurkani",
    medium: "faheemgurkani"
  }
};

export const EDUCATION: Education[] = [
  {
    institution: "National University of Computer and Emerging Sciences",
    degree: "Bachelor of Science, Artificial Intelligence",
    period: "Aug 2022 – Present",
    details: [
      "GPA: 3.21/4.00",
      "Honors: Dean’s List (Spring 2023)",
      "Relevant Coursework: ANN, Machine Learning, Digital Image Processing, NLP, Data Structures, Algorithms"
    ]
  },
  {
    institution: "Army Public School and College System",
    degree: "F.Sc. (Pre-Engineering)",
    period: "June 2022",
    details: [
      "Marks: 1019/1100",
      "Ranked 2nd highest in graduating class"
    ]
  }
];

export const EXPERIENCE: Experience[] = [
  {
    company: "National Aerospace Science & Technology Park (NASTP)",
    role: "AI Engineering Intern",
    location: "Rawalpindi, Pakistan",
    period: "June 2025 – August 2025",
    points: [
      "Developed a workflow to extract and digitize business card data using OCR, enabling streamlined contact management and user actions.",
      "Built an offline gRPC-based system for multi-person behavior recognition, integrating detection, tracking, pose estimation, and action classification for analytic reporting."
    ]
  },
  {
    company: "Harbin Engineering University",
    role: "Research Intern",
    location: "Remote (Harbin, China)",
    period: "June 2025 – August 2025",
    points: [
      "Worked on technical and programming assignments of a research project related to Artificial Intelligence (Deep Learning for Speech Processing)."
    ]
  },
  {
    company: "National Centre For Physics (NCP)",
    role: "Research Intern",
    location: "Islamabad, ICT, Pakistan",
    period: "July 2024 – July 2025",
    points: [
      "Collaborated with a research team to analyze classical and deep learning models for object tracking.",
      "Conducted research on fault detection and anomaly detection methodologies for HVAC systems, evaluating both traditional and advanced deep learning approaches."
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    title: "Action Segmentation Using MS-TCN",
    description: "Implements a multi-stage temporal convolutional network in PyTorch to segment and label actions in video frame sequences.",
    technologies: ["PyTorch", "Deep Learning", "MS-TCN"]
  },
  {
    title: "Driver Assistance System Using RT-DETR",
    description: "A real-time driver assistance system using a fine-tuned RT-DETR object detector, featuring dual data pipelines, full training/inference workflow, and an integrated FastAPI–Next.js application for processing dashcam videos with ADAS alerts.",
    technologies: ["RT-DETR", "FastAPI", "Next.js", "Computer Vision"]
  },
  {
    title: "Malaria Classification & Interpretability",
    description: "Builds a CNN to distinguish parasitized from healthy blood cell images and applies Grad-CAM to visualize decision-making regions.",
    technologies: ["CNN", "Grad-CAM", "Medical Imaging", "Deep Learning"]
  },
  {
    title: "Trendstory Microservice",
    description: "Delivers a FastAPI/gRPC service that fetches trending YouTube and Google Trends topics to generate theme-customized stories using advanced language models.",
    technologies: ["FastAPI", "gRPC", "LLMs", "Microservices"]
  },
  {
    title: "Privacy-Aware Agent MCP System",
    description: "A privacy-aware multi-step workflow using the Model Context Protocol (MCP) architecture, combining tool-based reasoning with language model capabilities to securely process sensitive user queries.",
    technologies: ["MCP", "LLM Agents", "Privacy", "Tool-use"]
  },
  {
    title: "Agentic AI Workflow for Tabular Data",
    description: "Showcases an Agentic (single agent) AI System leveraging LangGraph, OpenAI's LLMs, and LangChain Tools to perform intelligent workflows on tabular datasets stored in a DuckDB database.",
    technologies: ["LangGraph", "LangChain", "OpenAI", "DuckDB"]
  },
  {
    title: "Text Controlled Object Relocation",
    description: "A vision-language pipeline capable of detecting, segmenting, removing, and relocating objects in a scene based on a natural language prompt, while maintaining visual consistency through inpainting and relighting.",
    technologies: ["Vision-Language Models", "Inpainting", "Segmentation"]
  },
  {
    title: "Multi-person Behaviour Recognition",
    description: "An offline gRPC-based pipeline for detecting, tracking, and classifying behaviors of multiple people. Supports pose estimation (ViTPose), action recognition (TimeSformer), and generates visual outputs.",
    technologies: ["gRPC", "ViTPose", "TimeSformer", "Computer Vision"]
  },
  {
    title: "Agentic RAG Multi-Project Research Lab",
    description: "A secure, multi-tenant RAG framework enabling intelligent, privacy-preserving assistants to query lab documents with strict data isolation, PII masking, and injection protection.",
    technologies: ["RAG", "Multi-tenancy", "Security", "PII Masking"]
  }
];

export const SKILLS: SkillCategory[] = [
  {
    category: "Languages",
    skills: ["Python", "C/C++", "C#", "JavaScript"]
  },
  {
    category: "ML & Deep Learning",
    skills: ["PyTorch", "TensorFlow", "Keras", "scikit-learn", "YOLO", "Hugging Face", "ONNX", "TensorRT", "LangChain", "LangGraph", "crewAI"]
  },
  {
    category: "Web & APIs",
    skills: ["Docker", "AWS", "Streamlit", "Gradio", "REST APIs", "MCP", "FastMCP", "Next.js"]
  },
  {
    category: "Data & Tools",
    skills: ["NumPy", "Pandas", "Git", "GitHub", "Linux (Ubuntu)", "n8n"]
  }
];

export const CERTIFICATIONS: Certification[] = [
  { name: "Building RAG Agents with LLMs", issuer: "NVIDIA", year: "2025" },
  { name: "Generative AI with Large Language Models", issuer: "DeepLearning.AI", year: "2024" },
  { name: "Convolutional Neural Networks", issuer: "DeepLearning.AI", year: "2024" },
  { name: "AWS Cloud Technical Essentials", issuer: "Amazon Web Services", year: "2024" },
  { name: "DevOps on AWS", issuer: "Amazon Web Services", year: "2024" },
  { name: "Neural Networks and Deep Learning", issuer: "DeepLearning.AI", year: "2023" },
];