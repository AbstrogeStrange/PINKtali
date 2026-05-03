import { PrismaClient, UserRole, VideoType, VideoStatus, Visibility, CampaignStatus, BudgetType, BidModel, AdFormat, LikeTarget } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete heavily relational data first
  await prisma.comment.deleteMany();
  await prisma.view.deleteMany();
  await prisma.like.deleteMany();
  await prisma.adImpression.deleteMany();
  await prisma.adCreative.deleteMany();
  await prisma.adCampaign.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipTier.deleteMany();
  await prisma.video.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding 3 Creator Accounts with Channels...');
  const creators = [];
  
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash: '$2b$10$Ep3sM2gA9j5N1Z4P6BvV0uO3r5mXw.T0Yl8G.P0J.B.U.U.U.U.U', // mock hash
        displayName: faker.person.fullName(),
        handle: faker.internet.userName().toLowerCase(),
        role: UserRole.CREATOR,
        isVerified: faker.datatype.boolean(),
        avatarUrl: faker.image.avatar(),
        bannerUrl: faker.image.urlLoremFlickr({ category: 'landscape' }),
        channel: {
          create: {
            handle: faker.internet.userName().toLowerCase() + '_channel',
            name: faker.company.name() + ' Studio',
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatar(),
            bannerUrl: faker.image.urlLoremFlickr({ category: 'landscape' }),
            subscriberCount: faker.number.int({ min: 1000, max: 1000000 }),
            monetizationStatus: 'ACTIVE',
          }
        }
      },
      include: { channel: true }
    });
    creators.push(user);
    console.log(`Created Creator: ${user.handle}`);

    if (user.channel) {
      // Create Membership Tiers for this channel
      await prisma.membershipTier.create({
        data: {
          channelId: user.channel.id,
          name: 'Supporter',
          priceUSD: 4.99,
          benefits: ['Loyalty badges', 'Custom emoji'],
          badgeEmoji: '⭐',
          sortOrder: 1,
        }
      });
    }
  }

  console.log('Seeding 10 Videos per Creator (5 Long, 5 Short)...');
  const allVideos = [];

  for (const creator of creators) {
    const channelId = creator.channel!.id;

    for (let i = 0; i < 10; i++) {
      const isShort = i >= 5;
      const video = await prisma.video.create({
        data: {
          channelId,
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.paragraphs(2),
          tags: [faker.word.sample(), faker.word.sample(), faker.word.sample()],
          type: isShort ? VideoType.SHORT : VideoType.LONG_FORM,
          status: VideoStatus.LIVE,
          visibility: Visibility.PUBLIC,
          durationSeconds: isShort ? faker.number.int({ min: 15, max: 60 }) : faker.number.int({ min: 300, max: 3600 }),
          fileSizeBytes: faker.number.int({ min: 10000000, max: 1000000000 }),
          hlsManifestUrl: 'https://example.com/mock-manifest.m3u8',
          thumbnailUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
          viewCount: faker.number.int({ min: 100, max: 500000 }),
          likeCount: faker.number.int({ min: 10, max: 50000 }),
          isMonetized: true,
          publishedAt: faker.date.recent({ days: 30 }),
        }
      });
      allVideos.push(video);
    }
  }

  console.log('Seeding Viewer Accounts and Comments...');
  const viewers = [];
  for (let i = 0; i < 5; i++) {
    const viewer = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash: 'mock',
        displayName: faker.person.fullName(),
        handle: faker.internet.userName().toLowerCase(),
        role: UserRole.VIEWER,
      }
    });
    viewers.push(viewer);

    // Add random comments to some videos
    for (let j = 0; j < 3; j++) {
      const randomVideo = faker.helpers.arrayElement(allVideos);
      await prisma.comment.create({
        data: {
          videoId: randomVideo.id,
          userId: viewer.id,
          body: faker.lorem.sentence(),
          status: 'PUBLISHED'
        }
      });

      // Add a like
      await prisma.like.create({
        data: {
          userId: viewer.id,
          targetType: LikeTarget.VIDEO,
          targetId: randomVideo.id,
          value: 1,
        }
      });
    }
  }

  console.log('Seeding Sample Ad Campaigns...');
  const adCampaign = await prisma.adCampaign.create({
    data: {
      advertiserId: viewers[0].id, // Mocking advertiser as a user
      name: 'Summer Sale 2026',
      status: CampaignStatus.ACTIVE,
      budgetType: BudgetType.DAILY,
      budgetAmount: 1000,
      bidModel: BidModel.CPM,
      bidAmount: 5.5,
      startDate: new Date(),
      targetCountries: ['US', 'CA', 'UK'],
      creatives: {
        create: {
          format: AdFormat.PRE_ROLL,
          videoUrl: 'https://example.com/ad.mp4',
          clickUrl: 'https://example.com/sale',
          ctaText: 'Shop Now',
          durationSeconds: 15,
          isApproved: true,
        }
      }
    },
    include: { creatives: true }
  });

  console.log('Seeding Complete! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
