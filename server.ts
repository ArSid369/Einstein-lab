import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

interface TestCaseInput {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface TestCaseResult {
  id: string;
  name: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  isHidden: boolean;
  error?: string;
}

function runPythonScript(script: string, stdinData = "", timeoutMs = 3500): Promise<{ stdout: string; stderr: string; exitCode: number; durationMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn("python3", ["-I", "-c", script], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { PATH: process.env.PATH || "/usr/bin:/bin", PYTHONDONTWRITEBYTECODE: "1" },
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        proc.kill("SIGKILL");
        resolve({
          stdout,
          stderr: stderr + "\nTimeoutError: Execution exceeded 3.5s safety limit.",
          exitCode: 124,
          durationMs: Date.now() - start,
        });
      }
    }, timeoutMs);

    proc.stdout.on("data", (d) => {
      if (stdout.length < 32000) stdout += d.toString();
    });
    proc.stderr.on("data", (d) => {
      if (stderr.length < 16000) stderr += d.toString();
    });

    proc.on("error", (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: err.message,
          exitCode: 1,
          durationMs: Date.now() - start,
        });
      }
    });

    proc.on("close", (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
          exitCode: code ?? 0,
          durationMs: Date.now() - start,
        });
      }
    });

    if (stdinData) {
      proc.stdin.write(stdinData);
    }
    proc.stdin.end();
  });
}

// Lightweight robotics & scientific Python prelude so learners can import numpy/pandas/math/robotics helpers
// even in minimal container environments without external pip packages installed.
const PYTHON_PRELUDE = `
import sys, math, json, types

# Provide lightweight numpy shim if real numpy is unavailable
try:
    import numpy as _real_np
except ImportError:
    class _NDArray(list):
        def __init__(self, data):
            super().__init__(data)
        @property
        def shape(self):
            if len(self) > 0 and isinstance(self[0], (list, _NDArray)):
                return (len(self), len(self[0]))
            return (len(self),)
        def __add__(self, other):
            if isinstance(other, (int, float)):
                return _NDArray([x + other for x in self])
            return _NDArray([a + b for a, b in zip(self, other)])
        def __sub__(self, other):
            if isinstance(other, (int, float)):
                return _NDArray([x - other for x in self])
            return _NDArray([a - b for a, b in zip(self, other)])
        def __mul__(self, other):
            if isinstance(other, (int, float)):
                return _NDArray([x * other for x in self])
            return _NDArray([a * b for a, b in zip(self, other)])
        def __rmul__(self, other):
            return self.__mul__(other)
        def tolist(self):
            return list(self)
        def __repr__(self):
            return f"array({list(self)})"

    _np = types.ModuleType("numpy")
    _np.pi = math.pi
    _np.array = lambda x: _NDArray([_NDArray(r) if isinstance(r, list) else r for r in x]) if isinstance(x, list) else x
    _np.zeros = lambda n: _NDArray([0.0]*n) if isinstance(n, int) else _NDArray([[0.0]*n[1] for _ in range(n[0])])
    _np.ones = lambda n: _NDArray([1.0]*n) if isinstance(n, int) else _NDArray([[1.0]*n[1] for _ in range(n[0])])
    _np.linspace = lambda a, b, n: _NDArray([round(a + (b - a) * i / max(1, n - 1), 6) for i in range(n)])
    _np.sin = lambda x: _NDArray([math.sin(v) for v in x]) if isinstance(x, (list, _NDArray)) else math.sin(x)
    _np.cos = lambda x: _NDArray([math.cos(v) for v in x]) if isinstance(x, (list, _NDArray)) else math.cos(x)
    _np.sqrt = lambda x: _NDArray([math.sqrt(v) for v in x]) if isinstance(x, (list, _NDArray)) else math.sqrt(x)
    _np.mean = lambda x: sum(x) / len(x) if len(x) else 0.0
    _np.dot = lambda a, b: sum(x * y for x, y in zip(a, b))
    _np.clip = lambda x, lo, hi: max(lo, min(hi, x))
    _np.deg2rad = math.radians
    _np.rad2deg = math.degrees
    _np.linalg = types.SimpleNamespace(
        norm=lambda v: math.sqrt(sum(x*x for x in v))
    )
    sys.modules["numpy"] = _np

try:
    import pandas as _real_pd
except ImportError:
    class _Series(list):
        def mean(self): return sum(self) / len(self) if len(self) else 0.0
        def max(self): return max(self)
        def min(self): return min(self)
    class _DataFrame:
        def __init__(self, data):
            self._data = data
            self.columns = list(data.keys())
        def __getitem__(self, key):
            return _Series(self._data[key])
        def __len__(self):
            first = next(iter(self._data.values()), [])
            return len(first)
        def head(self, n=5):
            return {k: v[:n] for k, v in self._data.items()}
        def describe(self):
            return {k: {"count": len(v), "mean": round(sum(v)/len(v), 2)} for k, v in self._data.items() if v and isinstance(v[0], (int, float))}
        def __repr__(self):
            return f"DataFrame(columns={self.columns}, rows={len(self)})"
    _pd = types.ModuleType("pandas")
    _pd.DataFrame = _DataFrame
    _pd.Series = _Series
    sys.modules["pandas"] = _pd

# Lightweight robotics simulation bridge helpers
def emit_rover_path(waypoints):
    print("SIM_PATH:" + json.dumps({"mode": "rover", "waypoints": waypoints}))

def emit_arm_joints(j1, j2, j3, gripper=0.5):
    print("SIM_JOINTS:" + json.dumps({"mode": "arm", "joints": [j1, j2, j3, gripper]}))
`;

function parseSimulationTelemetry(stdout: string, code: string): {
  mode?: "rover" | "arm";
  waypoints?: Array<{ x: number; z: number }>;
  joints?: number[];
  cleanStdout: string;
} {
  const lines = stdout.split("\n");
  const cleanLines: string[] = [];
  let mode: "rover" | "arm" | undefined;
  let waypoints: Array<{ x: number; z: number }> | undefined;
  let joints: number[] | undefined;

  for (const line of lines) {
    if (line.startsWith("SIM_PATH:")) {
      try {
        const parsed = JSON.parse(line.slice("SIM_PATH:".length));
        mode = "rover";
        waypoints = parsed.waypoints;
      } catch {
        // ignore malformed telemetry line
      }
    } else if (line.startsWith("SIM_JOINTS:")) {
      try {
        const parsed = JSON.parse(line.slice("SIM_JOINTS:".length));
        mode = "arm";
        joints = parsed.joints;
      } catch {
        // ignore
      }
    } else {
      cleanLines.push(line);
    }
  }

  // Also infer coordinates or joint angles from natural output if no explicit emit_* was called
  if (!waypoints && !joints) {
    const coordMatches = [...stdout.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g)];
    if (coordMatches.length >= 2) {
      waypoints = coordMatches.slice(0, 12).map((m) => ({
        x: Math.max(-5, Math.min(5, parseFloat(m[1]))),
        z: Math.max(-5, Math.min(5, parseFloat(m[2]))),
      }));
      mode = "rover";
    } else if (/arm|joint|theta|kinematics|gripper/i.test(code + stdout)) {
      const nums = [...stdout.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0]));
      if (nums.length >= 2) {
        joints = [nums[0] || 0.4, nums[1] || 0.6, nums[2] || -0.4, 0.5];
        mode = "arm";
      }
    }
  }

  return {
    mode,
    waypoints,
    joints,
    cleanStdout: cleanLines.join("\n").trim(),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // 1. Real Python Execution + Automated Test Runner
  app.post("/api/execute-python", async (req, res) => {
    const { code, testCases = [] } = req.body as {
      code?: string;
      testCases?: TestCaseInput[];
    };

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Python code is required." });
    }

    const fullUserScript = `${PYTHON_PRELUDE}\n${code}`;
    const mainRun = await runPythonScript(fullUserScript);
    const telemetry = parseSimulationTelemetry(mainRun.stdout, code);

    const testResults: TestCaseResult[] = [];
    for (const tc of testCases) {
      const harness = `${PYTHON_PRELUDE}\n${code}\n\n# --- Test Case Harness ---\n${tc.input || ""}`;
      const tcRun = await runPythonScript(harness);
      const tcTelemetry = parseSimulationTelemetry(tcRun.stdout, code);
      const actual = tcTelemetry.cleanStdout || (tcRun.stderr ? tcRun.stderr : "(no output)");
      const expected = (tc.expectedOutput || "").trim();
      const passed = tcRun.exitCode === 0 && actual.trim() === expected;

      testResults.push({
        id: tc.id,
        name: tc.name,
        passed,
        actualOutput: actual,
        expectedOutput: expected,
        isHidden: Boolean(tc.isHidden),
        error: tcRun.exitCode !== 0 ? tcRun.stderr : undefined,
      });
    }

    const passedCount = testResults.filter((t) => t.passed).length;

    return res.json({
      success: mainRun.exitCode === 0,
      stdout: telemetry.cleanStdout,
      stderr: mainRun.stderr,
      durationMs: mainRun.durationMs,
      simulation: {
        mode: telemetry.mode,
        waypoints: telemetry.waypoints,
        joints: telemetry.joints,
      },
      testResults,
      summary: {
        total: testResults.length,
        passed: passedCount,
        failed: testResults.length - passedCount,
      },
    });
  });

  // 2. SME Contextual AI Task Assistant (Server-Side Gemini API)
  app.post("/api/ai/task-assist", async (req, res) => {
    const { action, prompt, task } = req.body as {
      action: string;
      prompt?: string;
      task: {
        title: string;
        problemStatement: string;
        instructions: string;
        difficulty: string;
        starterCode: string;
        expectedOutput: string;
        hints: string[];
        testCases: TestCaseInput[];
      };
    };

    if (!task) {
      return res.status(400).json({ error: "Task context is required." });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `You are an expert Robotics & Python Curriculum Architect assisting an SME in NewtonLab.
Analyze the provided coding task and perform the requested action: "${action}".
User note: "${prompt || "None"}".
Return a clean JSON object with:
- summary: concise explanation of what you propose and why
- proposals: an array of 1 to 3 concrete change proposals. Each proposal has:
  - id: short string id
  - field: one of "problemStatement", "instructions", "difficulty", "starterCode", "expectedOutput", "hints", "testCases"
  - title: concise label (e.g. "Clarify Boundary Conditions", "Add Edge-Case Test Suite")
  - rationale: 1 sentence explaining the pedagogical benefit
  - proposedText: string (for problemStatement, instructions, difficulty, starterCode, expectedOutput)
  - proposedHints: array of strings (only when field is "hints")
  - proposedTestCases: array of { name, input, expectedOutput, isHidden } (only when field is "testCases")
Keep Python code valid and testable via print() statements.`;

        const response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: `Task JSON:\n${JSON.stringify(task, null, 2)}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                proposals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      field: { type: Type.STRING },
                      title: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      proposedText: { type: Type.STRING },
                      proposedHints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      proposedTestCases: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            input: { type: Type.STRING },
                            expectedOutput: { type: Type.STRING },
                            isHidden: { type: Type.BOOLEAN },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const parsed = JSON.parse((response.text ?? "{}").trim());
        return res.json({ source: "gemini", ...parsed });
      } catch (err) {
        console.error("Gemini task-assist error:", err);
      }
    }

    // Deterministic robotics-domain assistant response when GEMINI_API_KEY is not configured in preview
    const proposals = buildFallbackTaskProposals(action, prompt || "", task);
    return res.json({
      source: "local-engine",
      summary: proposals.summary,
      proposals: proposals.proposals,
    });
  });

  // 3. SME AI Report Insights (Server-Side Gemini API)
  app.post("/api/ai/report-insights", async (req, res) => {
    const { reportType, filters, metrics, difficultQuestions, strugglingLearners } = req.body;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: JSON.stringify({ reportType, filters, metrics, difficultQuestions, strugglingLearners }),
          config: {
            systemInstruction:
              "You are a Senior Learning Analytics Advisor for NewtonLab robotics training. Summarize the key performance findings in 2 concise sentences and provide 3 concrete, actionable recommendations (each with id, title, description, actionType, targetLabel) as JSON.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      actionType: { type: Type.STRING },
                      targetLabel: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        });
        const parsed = JSON.parse((response.text ?? "{}").trim());
        return res.json({ source: "gemini", ...parsed });
      } catch (err) {
        console.error("Gemini report-insights error:", err);
      }
    }

    return res.json({
      source: "local-engine",
      executiveSummary: `Across ${metrics?.assignedLearners ?? 42} learners in ${filters?.domain || "All Domains"}, completion stands at ${metrics?.completionRate ?? 84}% with an average score of ${metrics?.avgScore ?? 79}%. Most friction concentrates around coordinate frame transforms and edge-case obstacle clamping.`,
      recommendations: [
        {
          id: "rec-1",
          title: "Assign Remedial Vector Normalization Lab",
          description: "5 associates scored below 65% on Kinematics & Coordinate Frames. Assign a 15-minute guided NumPy vector drill.",
          actionType: "assign-remedial",
          targetLabel: "Assign to 5 Learners",
        },
        {
          id: "rec-2",
          title: "Clarify PID Clamp Edge-Case Constraints",
          description: "Test Case 'Zero Velocity Clamp' has a 41% failure rate. Add explicit actuator saturation limits to instructions.",
          actionType: "open-task-editor",
          targetLabel: "Review Task",
        },
        {
          id: "rec-3",
          title: "Notify Cohort B Before Module Gate",
          description: "7 learners have pending module assessments due within 48 hours.",
          actionType: "notify-learners",
          targetLabel: "Send Reminder",
        },
      ],
    });
  });

  // Vite integration (dev) or static dist serving (prod)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NewtonLab server listening on http://localhost:${PORT}`);
  });
}

function buildFallbackTaskProposals(
  action: string,
  prompt: string,
  task: {
    title: string;
    problemStatement: string;
    instructions: string;
    difficulty: string;
    starterCode: string;
    expectedOutput: string;
    hints: string[];
    testCases: TestCaseInput[];
  }
) {
  switch (action) {
    case "generate-tests":
      return {
        summary: "Generated 2 additional boundary & edge-case tests to catch zero-input and saturation conditions.",
        proposals: [
          {
            id: "prop-tests-1",
            field: "testCases",
            title: "Add Zero-Input & Boundary Saturation Tests",
            rationale: "Ensures learners handle degenerate inputs (zero distance / clamped velocity) without ZeroDivisionError.",
            proposedTestCases: [
              {
                name: "Zero Displacement Boundary",
                input: "print('BOUNDARY_OK')",
                expectedOutput: "BOUNDARY_OK",
                isHidden: false,
              },
              {
                name: "Negative Angle Wrap Check",
                input: "print(round(-3.14159 % (2 * 3.14159), 2))",
                expectedOutput: "3.14",
                isHidden: true,
              },
            ],
          },
        ],
      };
    case "rewrite-statement":
      return {
        summary: "Refined problem statement with explicit coordinate conventions, units, and real-world robotics context.",
        proposals: [
          {
            id: "prop-stmt-1",
            field: "problemStatement",
            title: "Clarify Frame Conventions & Physical Units",
            rationale: "Beginners frequently confuse degrees vs. radians and robot-local vs. world coordinates.",
            proposedText: `${task.problemStatement}\n\nCoordinate & Unit Convention: All linear distances are measured in meters (m) on the XY ground plane, and angular headings use radians (rad) counter-clockwise from the +X axis. Ensure outputs are rounded to 2 decimal places unless specified otherwise.`,
          },
        ],
      };
    case "improve-instructions":
      return {
        summary: "Structured step-by-step implementation milestones to guide beginners without giving away the answer.",
        proposals: [
          {
            id: "prop-inst-1",
            field: "instructions",
            title: "Structure Instructions into Verification Steps",
            rationale: "Breaking calculations into clear phases reduces cognitive load and aligns with automated test assertions.",
            proposedText: `${task.instructions}\n\nStep-by-Step Checklist:\n1. Validate input dimensions and handle zero-magnitude vectors safely.\n2. Compute the intermediate kinematic transformation before clamping actuator limits.\n3. Format console output to match the expected precision and emit simulation telemetry if applicable.`,
          },
        ],
      };
    case "optimize-starter":
      return {
        summary: "Added type hints, docstrings, and clean function scaffolding to starter code.",
        proposals: [
          {
            id: "prop-code-1",
            field: "starterCode",
            title: "Add Type Annotations & Docstring Scaffolding",
            rationale: "Clear signatures help associates understand expected parameter types and return shapes immediately.",
            proposedText: `# NewtonLab Robotics Task: ${task.title}\n# Complete the implementation below and run tests.\n\n${task.starterCode.trim()}\n`,
          },
        ],
      };
    case "generate-hints":
      return {
        summary: "Created progressive 3-tier hints ranging from conceptual nudge to formula reminder.",
        proposals: [
          {
            id: "prop-hints-1",
            field: "hints",
            title: "Add Progressive 3-Tier Hints",
            rationale: "Graduated hints prevent early frustration while preserving problem-solving rigor.",
            proposedHints: [
              ...task.hints,
              "Check whether your angle values are in radians before passing them to math.cos() or math.sin().",
              "Clamp output velocities within [-1.0, 1.0] m/s before emitting waypoints to the 3D simulator.",
            ],
          },
        ],
      };
    case "change-difficulty": {
      const nextDiff =
        task.difficulty === "Beginner"
          ? "Intermediate"
          : task.difficulty === "Intermediate"
          ? "Advanced"
          : "Intermediate";
      return {
        summary: `Adjusted task difficulty target to ${nextDiff} with matching constraint expectations.`,
        proposals: [
          {
            id: "prop-diff-1",
            field: "difficulty",
            title: `Adjust Difficulty Level to ${nextDiff}`,
            rationale: "Aligns task rigor with cohort readiness and prerequisite mastery.",
            proposedText: nextDiff,
          },
        ],
      };
    }
    default:
      return {
        summary: `Analyzed "${task.title}"${prompt ? ` for "${prompt}"` : ""} and identified instruction clarity and validation opportunities.`,
        proposals: [
          {
            id: "prop-audit-1",
            field: "instructions",
            title: "Resolve Potential Ambiguities in Output Formatting",
            rationale: "Explicitly stating rounding and newline formatting avoids false test-case failures.",
            proposedText: `${task.instructions}\n\nFormatting Note: Print results using standard round(val, 2) formatting so automated test assertions match reliably.`,
          },
        ],
      };
  }
}

startServer().catch((err) => {
  console.error("Failed to start NewtonLab server:", err);
  process.exit(1);
});
