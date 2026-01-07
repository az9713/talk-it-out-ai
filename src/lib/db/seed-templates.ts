import { db, sessionTemplates } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const systemTemplates = [
  // Household
  {
    name: 'Household Chores Division',
    description: 'Discuss how household responsibilities and chores are divided between partners.',
    category: 'household' as const,
    promptContext: 'We need to discuss how household chores and responsibilities are divided. There may be feelings of imbalance or frustration about who does what around the house.',
    suggestedOpening: "I'd like to talk about how we divide household chores. I've been feeling...",
  },
  {
    name: 'Living Space Differences',
    description: 'Address different preferences for cleanliness, organization, or home environment.',
    category: 'household' as const,
    promptContext: 'We have different preferences about our living space - perhaps around cleanliness standards, organization, or how we want our home to feel.',
    suggestedOpening: "I want to discuss our different views on how we keep our home. When I see...",
  },

  // Finances
  {
    name: 'Spending Habits',
    description: 'Discuss different approaches to spending money and financial priorities.',
    category: 'finances' as const,
    promptContext: 'We have different views on spending money. This might involve disagreements about purchases, financial priorities, or what counts as necessary vs. discretionary spending.',
    suggestedOpening: "I'd like to talk about our spending because I feel...",
  },
  {
    name: 'Financial Goals',
    description: 'Align on savings, investments, and long-term financial planning.',
    category: 'finances' as const,
    promptContext: 'We need to discuss our financial goals and how to work toward them together. This includes savings, investments, and planning for our future.',
    suggestedOpening: "I want to discuss our financial future because I need...",
  },

  // Communication
  {
    name: 'Feeling Unheard',
    description: 'Address feelings of not being listened to or understood in conversations.',
    category: 'communication' as const,
    promptContext: "I often feel like my perspective isn't being heard or fully understood in our conversations. This affects how connected I feel.",
    suggestedOpening: 'Sometimes when we talk, I feel like my perspective gets lost. I feel...',
  },
  {
    name: 'Communication Styles',
    description: 'Navigate different ways of expressing thoughts, emotions, and needs.',
    category: 'communication' as const,
    promptContext: 'We have different communication styles that sometimes create misunderstandings. One of us might be more direct while the other prefers indirect communication.',
    suggestedOpening: "I've noticed we communicate differently, and I want to understand...",
  },
  {
    name: 'Difficult Conversations',
    description: 'Learn to approach sensitive topics with care and openness.',
    category: 'communication' as const,
    promptContext: "There's a sensitive topic we've been avoiding or struggling to discuss productively. We need a safe space to address it.",
    suggestedOpening: "There's something important I've been wanting to discuss with you...",
  },

  // Parenting
  {
    name: 'Parenting Approaches',
    description: 'Discuss different views on discipline, routines, or child-rearing philosophies.',
    category: 'parenting' as const,
    promptContext: 'We have different views on parenting - this might be about discipline, schedules, screen time, education, or other aspects of raising our children.',
    suggestedOpening: "I'd like to discuss our approach to parenting because I'm feeling...",
  },
  {
    name: 'Sharing Parenting Load',
    description: 'Address imbalances in childcare responsibilities and involvement.',
    category: 'parenting' as const,
    promptContext: "There's an imbalance in how we share parenting responsibilities. One partner may feel they're carrying more of the childcare burden.",
    suggestedOpening: 'I want to talk about how we share parenting duties. I feel...',
  },

  // Work
  {
    name: 'Work-Life Balance',
    description: 'Navigate tensions between career demands and relationship/family time.',
    category: 'work' as const,
    promptContext: "Work demands are affecting our relationship or family life. There's tension about how much time and energy goes to work versus us.",
    suggestedOpening: "I've been struggling with the balance between work and us. I feel...",
  },
  {
    name: 'Career Decisions',
    description: 'Discuss major career changes, job offers, or professional aspirations.',
    category: 'work' as const,
    promptContext: "There's a career decision to make that affects both of us - perhaps a job change, relocation, or shift in career direction.",
    suggestedOpening: "I want to discuss a career opportunity because I need your perspective...",
  },

  // Boundaries
  {
    name: 'Personal Space & Time',
    description: 'Discuss needs for alone time, personal hobbies, and individual space.',
    category: 'boundaries' as const,
    promptContext: 'We need to discuss boundaries around personal time and space. One or both of us may need more individual time while maintaining our connection.',
    suggestedOpening: 'I want to talk about my need for personal space. I feel...',
  },
  {
    name: 'Family & Friends Boundaries',
    description: 'Navigate relationships with extended family and friends.',
    category: 'boundaries' as const,
    promptContext: "There are tensions about boundaries with family members or friends - perhaps around visits, involvement in decisions, or respecting our relationship's privacy.",
    suggestedOpening: "I'd like to discuss how we handle boundaries with family/friends...",
  },

  // Intimacy
  {
    name: 'Emotional Connection',
    description: 'Address feelings of emotional distance or desire for deeper connection.',
    category: 'intimacy' as const,
    promptContext: "There's a feeling of emotional distance between us. We want to feel more connected but something is creating a barrier.",
    suggestedOpening: "I've been feeling emotionally distant and I miss feeling close to you...",
  },
  {
    name: 'Physical Intimacy',
    description: 'Discuss needs and desires around physical affection and intimacy.',
    category: 'intimacy' as const,
    promptContext: 'We have different needs or desires around physical intimacy. This is a sensitive topic that requires care and understanding.',
    suggestedOpening: 'I want to gently discuss our physical intimacy because I need...',
  },

  // Other
  {
    name: 'Life Transitions',
    description: 'Navigate major life changes like moving, retirement, or health challenges.',
    category: 'other' as const,
    promptContext: "We're facing a significant life transition that's creating stress or uncertainty. We need to support each other through this change.",
    suggestedOpening: "With everything changing, I feel... and I need...",
  },
  {
    name: 'Trust & Rebuilding',
    description: 'Work through trust issues and the process of rebuilding trust.',
    category: 'other' as const,
    promptContext: "Trust has been damaged in our relationship and we're working to rebuild it. This requires honest conversation about feelings, needs, and commitments.",
    suggestedOpening: 'I want to talk about rebuilding trust between us. I feel...',
  },
];

export async function seedSystemTemplates() {
  // Check if system templates already exist
  const existing = await db.query.sessionTemplates.findFirst({
    where: eq(sessionTemplates.isSystem, true),
  });

  if (existing) {
    console.log('System templates already exist, skipping seed.');
    return { seeded: false, count: 0 };
  }

  // Insert system templates
  const inserted = await db
    .insert(sessionTemplates)
    .values(
      systemTemplates.map((template) => ({
        ...template,
        isSystem: true,
        userId: null,
      }))
    )
    .returning();

  console.log(`Seeded ${inserted.length} system templates.`);
  return { seeded: true, count: inserted.length };
}
