# Tiny Office

Tiny Office is a local, beginner-friendly simulation of an agent team workflow. Describe a task, watch the keyword router select a specialist, and follow the task through queued, working, review, and done. The result is a template-based sample deliverable, not a response from an AI model.

## Run it

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No API key, backend, or account is needed.

## Follow the workflow

- `src/main.js` contains the agent roster, keyword router, task state transitions, local persistence, and deliverable templates.
- The shared brain is editable in the right panel and saved in browser `localStorage`. The sample deliverables reuse those notes.
- The office log records routing, context use, drafting, and completion so the workflow is visible.
- Tasks and notes stay in this browser. Clear task history in the page or clear this site's local storage to reset the demo.

This is a learning model of an office workflow, not a connected AI agent platform. It does not call external services or perform actions outside the page.
