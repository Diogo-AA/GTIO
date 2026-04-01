import 'dotenv/config'
import Groq from "groq-sdk";
import fs from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEST_STRATEGIES = {
  component: {
    pattern: /\.(tsx|jsx)$/,
    framework: "playwright",
    imports: `import { test, expect } from '@playwright/test'`,
    instructions: `Generate comprehensive tests for this React component using the Playwright test runner (test, expect).
Focus on rendering behaviour, props variations, and key user interactions exposed by the component's public API.
Avoid implementation details; prefer assertions based on rendered output (text content, attributes, accessible roles).
Include meaningful test descriptions and cover edge cases relevant to how the component is expected to be used.`,
  },
  service: {
    pattern: /\.(ts|js)$/,
    framework: "playwright",
    imports: `import { test, expect } from '@playwright/test'`,
    instructions: `Generate unit tests for this service/utility using the Playwright test runner (test, expect).
Cover: happy paths, error handling, edge cases, and boundary conditions.
Use plain JavaScript/TypeScript to mock external dependencies (fetch, axios, third-party libs) when needed.
Test pure functions thoroughly with multiple input scenarios and clear, specific expectations.`,
  },
  e2e: {
    pattern: /\.(tsx|jsx|ts|js)$/,
    framework: "playwright",
    imports: `import { test, expect } from '@playwright/test'`,
    instructions: `Generate E2E tests using Playwright.
Cover: complete user flows, navigation, form submissions, and critical paths.
Use page.goto(), locators, and assertions on visible elements.
Include setup/teardown and realistic user interaction sequences.`,
  },
};

function detectFileType(filePath, forceType) {
  if (forceType) return forceType;

  const content = filePath.toLowerCase();
  if (
    content.includes("/pages/") ||
    content.includes("\\pages\\") ||
    content.includes("/views/") ||
    content.includes(".page.")
  ) {
    return "e2e";
  }
  if (
    content.includes("/services/") ||
    content.includes("\\services\\") ||
    content.includes("/utils/") ||
    content.includes("\\utils\\") ||
    content.includes("/hooks/") ||
    content.includes("\\hooks\\") ||
    content.includes("/lib/") ||
    content.includes("\\lib\\")
  ) {
    return "service";
  }
  if (content.includes(".tsx") || content.includes(".jsx")) {
    return "component";
  }
  return "service";
}

function getTestOutputPath(sourceFile, testType) {
  const dir = path.dirname(sourceFile);
  const base = path.basename(sourceFile, path.extname(sourceFile));

  if (testType === "e2e") {
    return path.join(dir, "__e2e__", `${base}.spec.ts`);
  }
  return path.join(dir, "__tests__", `${base}.test.tsx`);
}

async function callGroq(prompt) {
  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });
  return completion.choices[0].message.content;
}

async function loadE2EContext() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const localesDir = path.join(__dirname, 'src/i18n/locales');
  const i18nHelperPath = path.join(__dirname, 'src/pages/__e2e__/i18n.ts');
  const [esJson, i18nHelper] = await Promise.all([
    fs.readFile(path.join(localesDir, 'es.json'), 'utf-8'),
    fs.readFile(i18nHelperPath, 'utf-8'),
  ]);
  return { esJson, i18nHelper };
}

async function generateTests(sourceFile, options = {}) {
  const { forceType, dryRun = false, verbose = false } = options;

  console.log(`\n🤖 AI Test Agent (Groq)`);
  console.log(`📂 Source: ${sourceFile}`);

  const sourceCode = await fs.readFile(sourceFile, "utf-8");
  const testType = detectFileType(sourceFile, forceType);
  const strategy = TEST_STRATEGIES[testType];

  console.log(`🎯 Test type detected: ${testType} (${strategy.framework})`);

  let e2eContext = '';
  if (testType === 'e2e') {
    const { esJson, i18nHelper } = await loadE2EContext();
    e2eContext = `
## i18n translations (es.json)
\`\`\`json
${esJson}
\`\`\`

## i18n test helper (already exists at ./i18n.ts — import from here)
\`\`\`typescript
${i18nHelper}
\`\`\`

## DOM & project conventions you MUST follow
- Import translations with: import { t } from './i18n'
- ALWAYS use t('key') for any text assertion — never hardcode translated strings
- Toasts are rendered as: <div class="toast toast-{type}"><span class="toast-msg">...</span></div> inside #toast-container
- Tab buttons inside a nav use class "tab" and "tab active" — but other UI elements may also use these classes.
  Always scope tab selectors to their parent container, e.g. .tabs button or .lang-selector button
- The app uses react-router with a baseURL of http://localhost:5500
- Tests run against the live app (http://localhost:5500) — do NOT mock API calls
- For tests that require authentication, use demo login first:
    await page.locator('button.btn-ghost', { hasText: t('login.demo') }).click()
`;
  }

  const prompt = `You are an expert software engineer specializing in test-driven development.

${strategy.instructions}
${e2eContext}
Source file: ${sourceFile}

\`\`\`typescript
${sourceCode}
\`\`\`

Generate a complete, production-ready test file. Requirements:
- Start with necessary imports: ${strategy.imports}
- Use descriptive test names that explain the expected behavior
- Group related tests with describe blocks
- Cover at least: happy path, error states, edge cases
- Make tests independent (no shared mutable state between tests)
- Return ONLY the test code, no markdown, no explanation, no code fences`;

  console.log(`⏳ Calling Groq API...`);

  let generatedTests = await callGroq(prompt);
  generatedTests = generatedTests.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  const outputPath = getTestOutputPath(sourceFile, testType);

  if (verbose) {
    console.log(`\n📝 Generated tests:\n`);
    console.log(generatedTests);
  }

  if (!dryRun) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, generatedTests, "utf-8");
    console.log(`✅ Tests written to: ${outputPath}`);
  } else {
    console.log(`🔍 Dry run — tests NOT written to disk`);
    console.log(`   Would write to: ${outputPath}`);
  }

  return { outputPath, testType, generatedTests, dryRun };
}

async function runTests(outputPath, testType) {
  console.log(`\n🚀 Running tests...`);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  let bin, args;
  if (testType === "e2e") {
    const normalizedPath = outputPath.replace(/\\/g, '/');
    bin = path.join(__dirname, "node_modules", ".bin", "playwright");
    args = ["test", normalizedPath, "--reporter=line"];
  } else {
    bin = path.join(__dirname, "node_modules", ".bin", "vitest");
    args = ["run", outputPath, "--reporter=verbose"];
  }

  console.log(`   $ ${bin} ${args.join(" ")}\n`);

  const result = spawnSync(bin, args, { encoding: "utf-8", stdio: "pipe" });
  const output = result.stdout || "";
  if (result.status === 0) {
    console.log(output);
    console.log(`✅ All tests passed!`);
    return { success: true, output };
  } else {
    console.error(`❌ Some tests failed:\n`);
    console.error(result.stdout || result.stderr || "");
    return { success: false, output: result.stdout, error: result.stderr };
  }
}

async function fixFailingTests(sourceFile, testFile, failureOutput, attempt) {
  console.log(`\n🔧 Attempt ${attempt}: Asking Groq to fix failing tests...`);

  const sourceCode = await fs.readFile(sourceFile, "utf-8");
  const testCode = await fs.readFile(testFile, "utf-8");

  const prompt = `You are debugging failing tests. Fix the test file so all tests pass.

Source code:
\`\`\`typescript
${sourceCode}
\`\`\`

Current test file:
\`\`\`typescript
${testCode}
\`\`\`

Test failure output:
\`\`\`
${failureOutput}
\`\`\`

Return ONLY the corrected test file contents. No markdown, no explanation, no code fences.`;

  let fixedTests = await callGroq(prompt);
  fixedTests = fixedTests.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  await fs.writeFile(testFile, fixedTests, "utf-8");
  console.log(`   Updated: ${testFile}`);

  return fixedTests;
}

async function agentLoop(sourceFile, options = {}) {
  const { maxRetries = 3, skipRun = false, ...generateOptions } = options;

  const { outputPath, testType, dryRun } = await generateTests(
    sourceFile,
    generateOptions
  );

  if (skipRun || dryRun) {
    console.log(`\n⏭️  Skipping test execution`);
    return;
  }

  let result = await runTests(outputPath, testType);

  let attempt = 1;
  while (!result.success && attempt <= maxRetries) {
    await fixFailingTests(sourceFile, outputPath, result.output, attempt);
    result = await runTests(outputPath, testType);
    attempt++;
  }

  if (!result.success) {
    console.error(
      `\n💥 Tests still failing after ${maxRetries} fix attempts. Manual review needed.`
    );
    process.exit(1);
  }

  console.log(`\n🎉 Done! Tests generated and passing at: ${outputPath}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  const files = [];

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--type":
        options.forceType = args[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--skip-run":
        options.skipRun = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--retries":
        options.maxRetries = parseInt(args[++i], 10);
        break;
      default:
        if (!args[i].startsWith("--")) files.push(args[i]);
    }
  }

  return { files, options };
}

async function main() {
  const { files, options } = parseArgs();

  if (files.length === 0) {
    console.error(`Usage: node generate-tests.mjs <file> [options]

Options:
  --type <component|service|e2e>   Force test type (auto-detected by default)
  --dry-run                        Generate tests without writing to disk
  --skip-run                       Write tests but don't execute them
  --verbose                        Print generated test code to console
  --retries <n>                    Max fix attempts on failure (default: 3)

Examples:
  node generate-tests.mjs src/components/LoginForm.tsx
  node generate-tests.mjs src/services/authService.ts --type service
  node generate-tests.mjs src/pages/VotingPage.tsx --type e2e --retries 2
  node generate-tests.mjs src/components/Button.tsx --dry-run --verbose`);
    process.exit(1);
  }

  for (const file of files) {
    try {
      await agentLoop(file, options);
    } catch (err) {
      console.error(`\n💥 Error processing ${file}:`, err.message);
      process.exit(1);
    }
  }
}

main();