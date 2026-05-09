import db from './db'

const questions: { category: string; lp_tag: string | null; text: string; difficulty: number }[] = [
  // Initiative
  { category: 'Initiative', lp_tag: null, text: 'Tell me about a time you identified a problem no one else had noticed and took initiative to fix it.', difficulty: 2 },
  { category: 'Initiative', lp_tag: null, text: 'Describe a situation where you went above and beyond what was expected of you.', difficulty: 1 },
  { category: 'Initiative', lp_tag: null, text: 'Give an example of a time you proactively improved a process without being asked.', difficulty: 1 },
  { category: 'Initiative', lp_tag: null, text: 'Tell me about a time you took on a project outside your core responsibilities.', difficulty: 2 },
  { category: 'Initiative', lp_tag: null, text: 'Describe a time you saw an opportunity and acted on it without waiting for direction.', difficulty: 2 },

  // Conflict & disagreement
  { category: 'Conflict & disagreement', lp_tag: null, text: 'Tell me about a time you disagreed with a team member\'s approach. How did you handle it?', difficulty: 2 },
  { category: 'Conflict & disagreement', lp_tag: null, text: 'Describe a situation where you had to push back on a decision made by someone senior to you.', difficulty: 3 },
  { category: 'Conflict & disagreement', lp_tag: null, text: 'Give an example of a conflict within your team and how you helped resolve it.', difficulty: 2 },
  { category: 'Conflict & disagreement', lp_tag: null, text: 'Tell me about a time you had to deliver feedback that was hard to hear for the other person.', difficulty: 2 },
  { category: 'Conflict & disagreement', lp_tag: null, text: 'Describe a time a stakeholder pushed for something you believed was the wrong approach.', difficulty: 3 },

  // Delivery under pressure
  { category: 'Delivery under pressure', lp_tag: null, text: 'Describe a time you had to deliver a project under a very tight deadline. What trade-offs did you make?', difficulty: 2 },
  { category: 'Delivery under pressure', lp_tag: null, text: 'Tell me about a situation where scope expanded unexpectedly mid-project. What did you do?', difficulty: 2 },
  { category: 'Delivery under pressure', lp_tag: null, text: 'Give an example of a time you had to prioritise ruthlessly to hit a deadline.', difficulty: 2 },
  { category: 'Delivery under pressure', lp_tag: null, text: 'Describe a time a key dependency fell through close to a deadline. How did you recover?', difficulty: 3 },
  { category: 'Delivery under pressure', lp_tag: null, text: 'Tell me about the most stressful project you\'ve worked on and how you managed it.', difficulty: 3 },

  // Mentorship & collaboration
  { category: 'Mentorship & collaboration', lp_tag: null, text: 'Tell me about a time you helped a teammate grow or improve their skills.', difficulty: 1 },
  { category: 'Mentorship & collaboration', lp_tag: null, text: 'Describe a situation where you had to onboard someone new and get them productive quickly.', difficulty: 1 },
  { category: 'Mentorship & collaboration', lp_tag: null, text: 'Give an example of a time you learned something significant from a peer or junior colleague.', difficulty: 1 },
  { category: 'Mentorship & collaboration', lp_tag: null, text: 'Tell me about a time you had to adapt your communication style to work effectively with someone very different from you.', difficulty: 2 },
  { category: 'Mentorship & collaboration', lp_tag: null, text: 'Describe a time you built consensus across a team with conflicting priorities.', difficulty: 3 },

  // Debugging & problem solving
  { category: 'Debugging & problem solving', lp_tag: null, text: 'Tell me about the hardest bug you\'ve ever had to track down. How did you approach it?', difficulty: 3 },
  { category: 'Debugging & problem solving', lp_tag: null, text: 'Describe a situation where you had to diagnose a production issue under time pressure.', difficulty: 3 },
  { category: 'Debugging & problem solving', lp_tag: null, text: 'Give an example of a time you had to make a decision with incomplete information.', difficulty: 2 },
  { category: 'Debugging & problem solving', lp_tag: null, text: 'Tell me about a time a system behaved in a way that completely surprised you.', difficulty: 2 },
  { category: 'Debugging & problem solving', lp_tag: null, text: 'Describe a time you had to quickly learn a new technology or domain to solve a problem.', difficulty: 2 },

  // Throughput & ownership
  { category: 'Throughput & ownership', lp_tag: null, text: 'Tell me about a time you significantly improved the performance or reliability of a system.', difficulty: 2 },
  { category: 'Throughput & ownership', lp_tag: null, text: 'Describe a project where you owned the outcome end-to-end. What did that look like?', difficulty: 2 },
  { category: 'Throughput & ownership', lp_tag: null, text: 'Give an example of a time you identified and eliminated a bottleneck in your team\'s workflow.', difficulty: 2 },
  { category: 'Throughput & ownership', lp_tag: null, text: 'Tell me about a time you had to maintain quality while moving very fast.', difficulty: 3 },
  { category: 'Throughput & ownership', lp_tag: null, text: 'Describe a situation where you saw technical debt causing real problems and took steps to address it.', difficulty: 3 },
]

const existing = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number }

if (existing.count === 0) {
  const insert = db.prepare(
    'INSERT INTO questions (category, lp_tag, text, difficulty) VALUES (?, ?, ?, ?)'
  )
  db.exec('BEGIN')
  for (const q of questions) {
    insert.run(q.category, q.lp_tag, q.text, q.difficulty)
  }
  db.exec('COMMIT')
  console.log(`Seeded ${questions.length} questions.`)
} else {
  console.log(`Questions already seeded (${existing.count} rows). Skipping.`)
}
