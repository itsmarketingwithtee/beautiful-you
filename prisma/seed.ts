import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed test account
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      isGuest: false,
      ageVerified: true,
      settings: {
        create: {
          notificationsEnabled: false,
          subscriptionStatus: 'free',
        },
      },
    },
  });
  console.log('Test user seeded:', testUser.id);

  // Seed affirmations
  const affirmations = [
    // Self-Love (12)
    { text: 'I am worthy of love and respect.', category: 'Self-Love' },
    { text: 'I embrace who I am, flaws and all.', category: 'Self-Love' },
    { text: 'I deserve happiness and joy in my life.', category: 'Self-Love' },
    { text: 'I am enough, just as I am.', category: 'Self-Love' },
    { text: 'My self-worth is not determined by others.', category: 'Self-Love' },
    { text: 'I choose to be kind to myself today.', category: 'Self-Love' },
    { text: 'I honor my needs and take care of myself.', category: 'Self-Love' },
    { text: 'I am deserving of all the good things life has to offer.', category: 'Self-Love' },
    { text: 'I love and accept myself unconditionally.', category: 'Self-Love' },
    { text: 'I am proud of the person I am becoming.', category: 'Self-Love' },
    { text: 'I radiate confidence and self-assurance.', category: 'Self-Love' },
    { text: 'I trust myself to make the right decisions.', category: 'Self-Love' },

    // Strength (12)
    { text: 'I am stronger than my challenges.', category: 'Strength' },
    { text: 'Every setback is a setup for a comeback.', category: 'Strength' },
    { text: 'I have the power to overcome anything.', category: 'Strength' },
    { text: 'My strength comes from within.', category: 'Strength' },
    { text: 'I am resilient and can handle whatever comes my way.', category: 'Strength' },
    { text: 'Challenges help me grow and become stronger.', category: 'Strength' },
    { text: 'I am brave enough to face my fears.', category: 'Strength' },
    { text: 'I possess the courage to pursue my dreams.', category: 'Strength' },
    { text: 'I am a warrior, not a worrier.', category: 'Strength' },
    { text: 'My inner strength is greater than any obstacle.', category: 'Strength' },
    { text: 'I face difficulties with grace and determination.', category: 'Strength' },
    { text: 'I am capable of achieving great things.', category: 'Strength' },

    // Hope (11)
    { text: 'Tomorrow holds new possibilities.', category: 'Hope' },
    { text: 'Even the darkest night will end with sunrise.', category: 'Hope' },
    { text: 'Better days are ahead of me.', category: 'Hope' },
    { text: 'I believe in a brighter future.', category: 'Hope' },
    { text: 'Hope is always within my reach.', category: 'Hope' },
    { text: 'Every new day brings new opportunities.', category: 'Hope' },
    { text: 'I trust that everything will work out in the end.', category: 'Hope' },
    { text: 'Light always finds its way through the darkness.', category: 'Hope' },
    { text: 'I choose hope over fear.', category: 'Hope' },
    { text: 'My future is filled with endless possibilities.', category: 'Hope' },
    { text: 'I am optimistic about what lies ahead.', category: 'Hope' },

    // Healing (11)
    { text: 'Healing is not linear, and that\'s okay.', category: 'Healing' },
    { text: 'I give myself permission to heal at my own pace.', category: 'Healing' },
    { text: 'Every day I am getting better and better.', category: 'Healing' },
    { text: 'I release what no longer serves me.', category: 'Healing' },
    { text: 'My wounds are transforming into wisdom.', category: 'Healing' },
    { text: 'I am gentle with myself as I heal.', category: 'Healing' },
    { text: 'I allow myself to feel and process my emotions.', category: 'Healing' },
    { text: 'Healing takes time, and I am patient with myself.', category: 'Healing' },
    { text: 'I am worthy of healing and peace.', category: 'Healing' },
    { text: 'Each breath I take fills me with calm and healing energy.', category: 'Healing' },
    { text: 'I forgive myself and others to make room for healing.', category: 'Healing' },

    // Recovery (11)
    { text: 'Every day is a new chance to grow.', category: 'Recovery' },
    { text: 'I am proud of how far I have come.', category: 'Recovery' },
    { text: 'Recovery is a journey, and I celebrate each step.', category: 'Recovery' },
    { text: 'I am rebuilding my life one day at a time.', category: 'Recovery' },
    { text: 'I deserve a life free from suffering.', category: 'Recovery' },
    { text: 'I am grateful for the progress I have made.', category: 'Recovery' },
    { text: 'My past does not define my future.', category: 'Recovery' },
    { text: 'I am committed to my recovery and well-being.', category: 'Recovery' },
    { text: 'Each day of recovery makes me stronger.', category: 'Recovery' },
    { text: 'I choose to move forward with courage and hope.', category: 'Recovery' },
    { text: 'I am not alone in my recovery journey.', category: 'Recovery' },
  ];

  const existingCount = await prisma.affirmation.count();
  if (existingCount === 0) {
    await prisma.affirmation.createMany({
      data: affirmations.map((a) => ({
        text: a.text,
        category: a.category,
        imageUrl: null,
      })),
    });
    console.log(`Seeded ${affirmations.length} affirmations`);
  } else {
    console.log(`Affirmations already exist (${existingCount}), skipping seed`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
