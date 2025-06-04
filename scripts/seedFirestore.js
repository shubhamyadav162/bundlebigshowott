#!/usr/bin/env node
'use strict';

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
if (!serviceAccountPath) {
  console.error('Error: SERVICE_ACCOUNT_KEY_PATH environment variable is not set.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const { FieldValue } = admin.firestore;

async function seed() {
  try {
    // 1. Seed Series collection
    const seriesData = [
      {
        id: 'series1',
        title: 'The Great Adventure',
        description: 'An epic journey across the world.',
        genre: 'Adventure',
        releaseYear: 2024,
        rating: 4.5,
        duration: 120,
        imageUrl: 'https://example.com/series1.jpg',
        episodesCount: 10,
        createdAt: FieldValue.serverTimestamp(),
      },
      {
        id: 'series2',
        title: 'Mystery Manor',
        description: 'A group investigates mysterious events at an old mansion.',
        genre: 'Mystery',
        releaseYear: 2023,
        rating: 4.2,
        duration: 45,
        imageUrl: 'https://example.com/series2.jpg',
        episodesCount: 8,
        createdAt: FieldValue.serverTimestamp(),
      },
    ];

    for (const series of seriesData) {
      const seriesRef = db.collection('series').doc(series.id);
      await seriesRef.set(series);
      console.log(`Created series: ${series.title}`);

      // 2. Seed Episodes subcollection
      for (let i = 1; i <= series.episodesCount; i++) {
        const ep = {
          id: `${series.id}-ep${i}`,
          title: `Episode ${i}`,
          synopsis: `Synopsis for episode ${i}.`,
          duration: 20 + i,
          episodeNumber: i,
          videoUrl: `https://example.com/${series.id}/episode${i}.mp4`,
          createdAt: FieldValue.serverTimestamp(),
        };
        await seriesRef.collection('episodes').doc(ep.id).set(ep);
        console.log(`  Created episode: ${ep.title}`);
      }
    }

    // 3. Seed Users collection
    const usersData = [
      {
        id: 'user1',
        email: 'user1@example.com',
        name: 'John Doe',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        watchlist: [],
        preferences: {
          videoQuality: 'HD',
          audioLanguage: 'en',
          subtitlesEnabled: true,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
    ];
    for (const user of usersData) {
      const userRef = db.collection('users').doc(user.id);
      await userRef.set(user);
      console.log(`Created user: ${user.email}`);
    }

    // 4. Seed Analytics collection (empty placeholder)
    // ... existing code above this line ...

    // 5. Seed Promos collection
    const promosData = [
      {
        id: 'promo1',
        discount_type: 'percentage',
        discount_value: 10,
        valid_from: FieldValue.serverTimestamp(),
        valid_until: FieldValue.serverTimestamp(),
        max_redemptions: 100,
        current_redemptions: 0,
        active: true,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
    ];
    for (const promo of promosData) {
      await db.collection('promos').doc(promo.id).set(promo);
      console.log(`Created promo: ${promo.id}`);
    }

    // 6. Seed User_Promos collection
    const userPromosData = [
      {
        id: 'up1',
        user_id: 'user1',
        promo_code_id: 'promo1',
        redeemed_at: FieldValue.serverTimestamp(),
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
    ];
    for (const up of userPromosData) {
      await db.collection('user_promos').doc(up.id).set(up);
      console.log(`Created user_promo: ${up.id}`);
    }

    // 7. Seed Reviews collection
    const reviewsData = [
      {
        id: 'review1',
        user_id: 'user1',
        content_id: 'series1',
        episode_id: 'series1-ep1',
        rating: 5,
        comment: 'Great start!',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
    ];
    for (const rev of reviewsData) {
      await db.collection('reviews').doc(rev.id).set(rev);
      console.log(`Created review: ${rev.id}`);
    }

    // 8. Seed Notifications collection
    const notificationsData = [
      {
        id: 'notif1',
        user_id: 'user1',
        type: 'reminder',
        title: 'Continue Watching',
        message: 'Don\'t miss your next episode!',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
    ];
    for (const notif of notificationsData) {
      await db.collection('notifications').doc(notif.id).set(notif);
      console.log(`Created notification: ${notif.id}`);
    }

    // 9. Seed Contents collection
    const contentsData = [
      {
        id: 'content1',
        title: 'The Great Adventure',
        content_type: 'series',
        description: 'An epic journey across the world.',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
    ];
    for (const content of contentsData) {
      await db.collection('contents').doc(content.id).set(content);
      console.log(`Created content: ${content.id}`);
    }

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error while seeding Firestore:', error);
  } finally {
    process.exit(0);
  }
}

seed(); 