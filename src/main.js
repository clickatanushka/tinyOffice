import './style.css'

const agents = [
  { id: 'research', name: 'Rae Morgan', role: 'Research analyst', initials: 'RM', color: 'mint', skills: ['research', 'compare', 'find', 'options', 'sources', 'market'] },
  { id: 'writing', name: 'Jules Park', role: 'Writer & editor', initials: 'JP', color: 'coral', skills: ['write', 'draft', 'email', 'summarize', 'rewrite', 'copy', 'post'] },
  { id: 'operations', name: 'Ari Ellis', role: 'Operations planner', initials: 'AE', color: 'blue', skills: ['plan', 'organize', 'checklist', 'schedule', 'process', 'steps', 'workflow'] },
]
const defaultNotes = `TINY OFFICE / SHARED BRAIN

We are a four-person product studio working remotely.
Our voice is clear, useful, and human. Prefer short sentences.
Keep plans practical: name an owner, a next step, and a time when possible.
For research, compare at least three options and show the trade-offs.`
const state = {
  notes: localStorage.getItem('tiny-office-brain') ?? defaultNotes,
  tasks: JSON.parse(localStorage.getItem('tiny-office-history') ?? '[]'),
  activeId: null,
  preferredAgent: 'auto',
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function routeTask(text) {
  const normalized = text.toLowerCase()
  const ranked = agents.map((agent) => ({ agent, score: agent.skills.filter((skill) => normalized.includes(skill)).length }))
  ranked.sort((left, right) => right.score - left.score)
  return ranked[0].score ? ranked[0].agent : agents[2]
}

function getAgent(id) { return agents.find((agent) => agent.id === id) ?? agents[0] }
function activeTask() { return state.tasks.find((task) => task.id === state.activeId) ?? state.tasks[0] ?? null }
function clock(time) { return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(time) }
function svg(path) { return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>` }

function render() {
  const task = activeTask()
  const finished = state.tasks.filter((item) => item.status === 'done')
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      <header class="topbar"><a class="brand" href="#top"><span class="brand-mark"><i></i><i></i><i></i></span><span>TINY<span class="brand-light"> OFFICE</span></span></a><div class="topbar-right"><span class="local-status"><i></i> RUNNING LOCALLY</span><span class="mode-tag">LEARNING MODE</span></div></header>
      <main id="top">
        <section class="intro"><div><p class="eyebrow"><span></span> YOUR SMALL, CAPABLE TEAM</p><h1>Good work takes<br><em>a few good minds.</em></h1><p class="intro-copy">Give the office a job. Watch it find the right desk, pick up shared notes, and bring back a useful first pass.</p></div><div class="day-stamp"><span>OFFICE HOURS</span><strong>09 <i>:</i> 41</strong><span>LOCAL SIMULATION</span></div></section>
        <div class="workspace-grid">
          <section class="work-column" aria-label="Task workspace">
            <form class="task-composer" id="task-form"><div class="composer-heading"><div><span class="section-index">01</span><h2>Put something on the desk</h2></div><span class="composer-hint">TRY A SMALL, CLEAR TASK</span></div><label class="visually-hidden" for="task-input">Describe a task for the office</label><textarea id="task-input" maxlength="280" rows="2" placeholder="e.g. Compare three project note apps for our remote studio" required></textarea><div class="composer-footer"><span class="assignment-copy" id="assignment-copy">ROUTE: <b>automatic</b></span><button class="run-button" type="submit">Send to the office ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</button></div><div class="example-row"><span>QUICK START</span><button type="button" data-action="example">Draft a welcome email for a new teammate</button></div></form>
            <section class="flow-section"><div class="section-heading"><div><span class="section-index">02</span><h2>The work, in motion</h2></div><span class="count-label">${finished.length} COMPLETED</span></div>${task ? renderTask(task) : '<div class="empty-work"><span class="empty-sun">✳</span><div><strong>Nothing on the floor yet.</strong><p>Send a task above and follow its trip through the office.</p></div></div>'}${renderLog(task)}</section>
            <section class="history-section"><div class="section-heading"><div><span class="section-index">03</span><h2>Recently finished</h2></div><button class="text-button" type="button" data-action="clear">CLEAR</button></div>${renderHistory(finished)}</section>
          </section>
          <aside class="side-column" aria-label="Office resources">
            <section class="team-section"><div class="section-heading"><div><span class="section-index">TEAM</span><h2>Three desks, one office</h2></div><span class="online-count"><i></i> 3 READY</span></div><p class="section-blurb">Choose a desk to steer the next job, or let the office route it.</p><div class="agent-list">${agents.map((agent) => renderAgent(agent)).join('')}</div><button class="auto-route ${state.preferredAgent === 'auto' ? 'is-selected' : ''}" type="button" data-agent="auto"><span class="auto-glyph">✳</span><span><strong>Let the office decide</strong><small>Match task words to agent skills</small></span><i class="radio-dot"></i></button></section>
            <section class="brain-section"><div class="brain-heading"><div><span class="brain-icon">${svg('<path d="M5 4h14v13l-4 3H5z"/><path d="M8 9h8M8 13h6"/>')}</span><div><span class="section-index">SHARED CONTEXT</span><h2>The little brain</h2></div></div><span class="saved-indicator" id="saved-indicator">SAVED</span></div><p class="section-blurb">Every agent reads these notes before they start.</p><label class="visually-hidden" for="brain-notes">Shared office notes</label><textarea id="brain-notes" class="brain-editor" rows="8" maxlength="1200">${escapeHtml(state.notes)}</textarea><div class="brain-footer"><span>STORED IN THIS BROWSER</span><button class="save-button" type="button" data-action="save">Save notes</button></div></section>
            <p class="simulation-note"><i></i>This is a workflow simulation. No AI service is connected.</p>
          </aside>
        </div>
      </main><footer class="footer"><span>TINY OFFICE <b>/</b> A WORKFLOW LAB</span><span>LOCAL DATA · NO API KEY NEEDED</span></footer>
    </div>`
  bindEvents()
}

function renderAgent(agent) {
  const busy = state.tasks.some((task) => task.agentId === agent.id && task.status !== 'done')
  const selected = state.preferredAgent === agent.id
  return `<button class="agent-row ${selected ? 'is-selected' : ''}" type="button" data-agent="${agent.id}" aria-pressed="${selected}"><span class="avatar avatar-${agent.color}">${agent.initials}</span><span class="agent-info"><strong>${agent.name}</strong><small>${agent.role}</small></span><span class="agent-presence ${busy ? 'is-busy' : ''}"><i></i>${busy ? 'BUSY' : 'READY'}</span></button>`
}

function renderTask(task) {
  const agent = getAgent(task.agentId)
  const stages = ['queued', 'working', 'review', 'done']
  const current = stages.indexOf(task.status)
  const labels = ['Queued', 'Working', 'Review', 'Done']
  return `<article class="task-card"><div class="task-card-top"><span class="task-status"><i></i>${task.status === 'done' ? 'DELIVERED' : `ON ${agent.name.split(' ')[0]}'S DESK`}</span><span class="task-time">${clock(task.createdAt)}</span></div><h3>${escapeHtml(task.description)}</h3><div class="assigned-agent"><span class="avatar avatar-${agent.color}">${agent.initials}</span><span><strong>${agent.name}</strong><small>${agent.role}</small></span><span class="assigned-label">${task.manual ? 'ASSIGNED' : 'ROUTED'}</span></div><div class="pipeline">${labels.map((label, index) => `<div class="pipeline-stage ${index < current || task.status === 'done' ? 'is-complete' : ''} ${index === current && task.status !== 'done' ? 'is-current' : ''}"><span class="pipeline-node">${index < current || task.status === 'done' ? '✓' : `0${index + 1}`}</span>${label}</div>`).join('')}</div>${task.result ? `<div class="deliverable"><div class="deliverable-heading"><span>✳ FIRST PASS</span><span>FROM SHARED NOTES</span></div><h4>${task.result.title}</h4><p>${escapeHtml(task.result.body)}</p><ul>${task.result.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul><p class="deliverable-foot">Context used: “${escapeHtml(task.result.context)}”</p></div>` : `<div class="working-message"><i></i>${task.status === 'queued' ? 'Waiting for a desk to open...' : task.status === 'working' ? `${agent.name.split(' ')[0]} is reading shared notes and working...` : 'Putting the deliverable together...'}</div>`}</article>`
}

function renderLog(task) {
  if (!task) return '<div class="activity-empty">The office log will appear here.</div>'
  return `<div class="activity-log"><div class="activity-label">OFFICE LOG <span></span></div>${task.events.map((event, index) => `<div class="activity-event ${index === 0 && task.status !== 'done' ? 'is-latest' : ''}"><b>${event.mark}</b><p>${escapeHtml(event.text)}</p><time>${clock(event.at)}</time></div>`).join('')}</div>`
}

function renderHistory(tasks) {
  if (!tasks.length) return '<div class="history-empty">Finished work will collect here.</div>'
  return `<ul class="history-list">${tasks.slice(0, 4).map((task) => `<li><button class="history-item" type="button" data-task-id="${task.id}"><span class="history-check">✓</span><span class="history-copy"><strong>${escapeHtml(task.description)}</strong><small>${getAgent(task.agentId).name} · ${clock(task.createdAt)}</small></span><span class="history-arrow">→</span></button></li>`).join('')}</ul>`
}

function bindEvents() {
  document.querySelector('#task-form').addEventListener('submit', submitTask)
  document.querySelectorAll('[data-agent]').forEach((button) => button.addEventListener('click', () => { state.preferredAgent = button.dataset.agent; render() }))
  document.querySelector('[data-action="example"]').addEventListener('click', () => { const input = document.querySelector('#task-input'); input.value = 'Draft a welcome email for a new teammate'; input.focus() })
  document.querySelector('[data-action="save"]').addEventListener('click', saveNotes)
  document.querySelector('[data-action="clear"]').addEventListener('click', clearHistory)
  document.querySelectorAll('[data-task-id]').forEach((button) => button.addEventListener('click', () => { state.activeId = button.dataset.taskId; render() }))
  document.querySelector('#task-input').addEventListener('input', (event) => {
    const agent = state.preferredAgent === 'auto' ? routeTask(event.target.value || 'plan a task') : getAgent(state.preferredAgent)
    document.querySelector('#assignment-copy').innerHTML = `ROUTE: <b>${escapeHtml(state.preferredAgent === 'auto' ? `auto → ${agent.name.split(' ')[0]}` : agent.name.split(' ')[0])}</b>`
  })
}

function submitTask(event) {
  event.preventDefault()
  const input = document.querySelector('#task-input')
  const description = input.value.trim()
  if (!description) return
  const manual = state.preferredAgent !== 'auto'
  const agent = manual ? getAgent(state.preferredAgent) : routeTask(description)
  const now = Date.now()
  const task = { id: crypto.randomUUID(), description, agentId: agent.id, manual, createdAt: now, status: 'queued', events: [{ mark: '01', text: `Task received. ${manual ? `You assigned it to ${agent.name}.` : `Router matched it to ${agent.name} based on task words.`}`, at: now }] }
  state.tasks.unshift(task)
  state.activeId = task.id
  input.value = ''
  render()
  window.setTimeout(() => advanceTask(task.id, 'working', '02', `${agent.name} opened the shared brain and picked useful context.`), 600)
  window.setTimeout(() => { const found = state.tasks.find((item) => item.id === task.id); if (!found) return; found.result = makeDeliverable(found); advanceTask(task.id, 'review', '03', `${agent.name} drafted a first pass. Check it against your notes.`) }, 1450)
  window.setTimeout(() => { advanceTask(task.id, 'done', '04', 'Deliverable filed in the office. You can reopen it from Recently finished.'); saveHistory() }, 2400)
}

function advanceTask(id, status, mark, text) {
  const task = state.tasks.find((item) => item.id === id)
  if (!task) return
  task.status = status
  task.events.unshift({ mark, text, at: Date.now() })
  render()
}

function makeDeliverable(task) {
  const agent = getAgent(task.agentId)
  const lines = state.notes.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('TINY OFFICE'))
  const context = lines[0] ?? 'No office notes have been added yet.'
  const tone = lines.find((line) => /voice|tone|short|clear|human/i.test(line)) ?? 'Keep the result clear and useful.'
  const practical = lines.find((line) => /owner|next step|time|practical/i.test(line)) ?? 'Name one practical next step.'
  const templates = {
    research: ['A quick comparison', `For “${task.description}”, compare options against the team's real constraints, not just feature lists.`, ['Option A: simplest to try; trade-off: fewer controls.', 'Option B: balanced setup; trade-off: a little more upkeep.', 'Option C: most flexible; trade-off: needs a clear owner.']],
    writing: ['A first draft', `Hi there,\n\nWe’re glad you’re here. ${context.replace(/[.!?]$/, '')}. We’ll make sure you have the context and people you need to get started.`, ['Share the one thing to do first.', 'Introduce the person to ask for help.', 'Keep the tone warm and low on jargon.']],
    operations: ['A practical plan', `Start with a small, time-boxed pass at “${task.description}”. Keep the steps visible so the team can adjust as they learn.`, ['Choose one owner for the next step.', 'Set a short check-in after the first attempt.', 'Write down what changed and what is blocked.']],
  }
  const [title, body, points] = templates[agent.id]
  return { title, body, points: [tone, practical, ...points].slice(0, 4), context }
}

function saveNotes() {
  state.notes = document.querySelector('#brain-notes').value
  localStorage.setItem('tiny-office-brain', state.notes)
  const badge = document.querySelector('#saved-indicator')
  badge.textContent = 'SAVED JUST NOW'
  window.setTimeout(() => { if (badge.isConnected) badge.textContent = 'SAVED' }, 1400)
}

function saveHistory() {
  state.tasks = state.tasks.slice(0, 24)
  localStorage.setItem('tiny-office-history', JSON.stringify(state.tasks.filter((task) => task.status === 'done').slice(0, 12)))
}

function clearHistory() {
  state.tasks = state.tasks.filter((task) => task.status !== 'done')
  state.activeId = state.tasks[0]?.id ?? null
  localStorage.setItem('tiny-office-history', '[]')
  render()
}

render()
