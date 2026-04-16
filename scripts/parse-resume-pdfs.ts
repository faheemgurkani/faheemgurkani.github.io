/**
 * Build-time script: parses the three resume PDFs in public/assets/ and writes:
 *   public/data/resume-texts.json    — full text per resume (legacy, kept for compatibility)
 *   public/data/resume-projects.json — per-resume: { title, description }[]
 *
 * Run automatically via the "prebuild" npm script.
 */
import fs from "fs";
import path from "path";

const RESUME_FILES: Record<string, { src: string; dest: string }> = {
  "AI/ML Engineer": {
    src: "CV - AI:ML Engineer.pdf",
    dest: "Muhammad-Faheem-AI-ML-Engineer.pdf",
  },
  "Backend Engineer": {
    src: "CV - Backend Engineer.pdf",
    dest: "Muhammad-Faheem-Backend-Engineer.pdf",
  },
  "CV Engineer": {
    src: "CV - CV Engineer.pdf",
    dest: "Muhammad-Faheem-CV-Engineer.pdf",
  },
};

const SECTION_HEADERS = new Set([
  "EXPERIENCE", "EDUCATION", "SKILLS", "CERTIFICATIONS",
  "PUBLICATIONS", "AWARDS", "SUMMARY", "OBJECTIVE", "PROJECTS",
]);

interface ResumeProject { title: string; description: string; }

function extractProjects(text: string): ResumeProject[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const projectsIdx = lines.findIndex((l) => l.toUpperCase() === "PROJECTS");
  if (projectsIdx === -1) return [];

  const projects: ResumeProject[] = [];
  let currentTitle: string | null = null;
  let bulletLines: string[] = [];

  const flush = () => {
    if (currentTitle) {
      projects.push({
        title: currentTitle,
        description: bulletLines
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      });
    }
    currentTitle = null;
    bulletLines = [];
  };

  for (let i = projectsIdx + 1; i < lines.length; i++) {
    const line = lines[i];

    if (SECTION_HEADERS.has(line.toUpperCase())) break;

    const isBullet =
      line.startsWith("•") || line.startsWith("-") || line.startsWith("*");

    if (isBullet) {
      bulletLines.push(line.replace(/^[•\-*]\s*/, ""));
      continue;
    }

    // Title heuristic: uppercase-starting, ≤90 chars, no metrics/urls/prose
    const looksLikeTitle =
      line.length >= 5 &&
      line.length <= 90 &&
      /^[A-Z"]/.test(line) &&
      !line.includes("http") &&
      !line.includes("github.com") &&
      !/\d+\s*ms/i.test(line) &&
      !/\d+\s*FPS/i.test(line) &&
      !/\d+%/.test(line) &&
      !/\d+\.\d+/.test(line) &&          // decimals → metric prose
      line.split(",").length <= 2 &&      // ≤1 comma → not a continuation list
      !line.endsWith(".") &&             // prose sentences end with a period
      !line.endsWith(",");

    if (looksLikeTitle) {
      flush();
      currentTitle = line;
    } else if (currentTitle) {
      // continuation prose appended to description
      bulletLines.push(line);
    }
  }
  flush();
  return projects;
}

const assetsDir = path.join(process.cwd(), "assests");
const outDir = path.join(process.cwd(), "public", "data");

async function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse") as {
    PDFParse: new (opts: { data: Uint8Array }) => {
      getText: () => Promise<{ text: string }>;
    };
  };

  const texts: Record<string, string> = {};
  const resumeProjects: Record<string, ResumeProject[]> = {};

  for (const [label, { src, dest }] of Object.entries(RESUME_FILES)) {
    const srcPath = path.join(assetsDir, src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[parse-resume-pdfs] Missing: ${src} — skipping`);
      texts[label] = "";
      resumeProjects[label] = [];
      continue;
    }
    const buffer = fs.readFileSync(srcPath);

    // Copy to public/assets/ for download links
    const destPath = path.join(outDir, "..", "assets", dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);

    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const { text } = await parser.getText();
    texts[label] = text;
    resumeProjects[label] = extractProjects(text);
    console.log(
      `[parse-resume-pdfs] ${src} → [${resumeProjects[label].map((p) => p.title).join(", ")}]`,
    );
  }

  fs.writeFileSync(
    path.join(outDir, "resume-texts.json"),
    JSON.stringify(texts, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(outDir, "resume-projects.json"),
    JSON.stringify(resumeProjects, null, 2),
    "utf8",
  );
  console.log("[parse-resume-pdfs] Done → resume-texts.json + resume-projects.json");
}

run().catch((err) => {
  console.error("[parse-resume-pdfs] Error:", err);
  process.exit(1);
});
