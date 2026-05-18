/**
 * Medicine Seeder (seeds/medicineSeeder.js)
 * Migrates data/medicines.json → MongoDB.
 *
 * Two-pass strategy:
 * 1. Insert all medicines with _substituteNames
 * 2. Resolve substitute names → ObjectId references
 *
 * Usage: npm run seed
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Use the same DB connection logic
const { connectDB, disconnectDB } = require('../config/database');
const Medicine = require('../models/Medicine');

async function seed() {
    console.log('\n🌱 MediHub Medicine Seeder\n');

    await connectDB();

    // Load JSON data
    const jsonPath = path.join(__dirname, '..', '..', 'data', 'medicines.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('❌ medicines.json not found at:', jsonPath);
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📦 Loaded ${rawData.length} medicines from JSON`);

    // Clear existing data
    const existingCount = await Medicine.countDocuments();
    if (existingCount > 0) {
        console.log(`🗑️  Clearing ${existingCount} existing medicines...`);
        await Medicine.deleteMany({});
    }

    // --- PASS 1: Insert all medicines ---
    console.log('📝 Pass 1: Inserting medicines...');

    const insertData = rawData.map(med => ({
        name: med.name,
        genericName: med.generic_name || '',
        category: med.category || 'General',
        form: med.form || 'Tablet',
        strength: med.strength || '',
        manufacturer: med.manufacturer || '',
        priceInr: med.price_inr || '',
        prescriptionRequired: med.prescription_required || false,
        usage: med.usage || [],
        dosage: med.dosage || '',
        sideEffects: med.side_effects || [],
        warnings: med.warnings || [],
        relatedConditions: med.related_conditions || [],
        _substituteNames: med.substitutes || [],
        substitutes: [], // Will be resolved in pass 2
    }));

    await Medicine.insertMany(insertData);
    console.log(`✅ Inserted ${insertData.length} medicines`);

    // --- PASS 2: Resolve substitute references ---
    console.log('🔗 Pass 2: Linking substitutes...');

    // Build name → _id lookup map
    const allMeds = await Medicine.find().select('+_substituteNames');
    const nameToId = new Map();
    allMeds.forEach(med => {
        nameToId.set(med.name.toLowerCase(), med._id);
    });

    let linkedCount = 0;
    let unresolvedNames = new Set();

    for (const med of allMeds) {
        if (!med._substituteNames || med._substituteNames.length === 0) continue;

        const substituteIds = [];
        for (const subName of med._substituteNames) {
            const subId = nameToId.get(subName.toLowerCase());
            if (subId) {
                substituteIds.push(subId);
                linkedCount++;
            } else {
                unresolvedNames.add(subName);
            }
        }

        if (substituteIds.length > 0) {
            await Medicine.findByIdAndUpdate(med._id, {
                $set: { substitutes: substituteIds },
            });
        }
    }

    console.log(`✅ Linked ${linkedCount} substitute references`);
    if (unresolvedNames.size > 0) {
        console.log(`⚠️  ${unresolvedNames.size} substitute names not found in database:`);
        [...unresolvedNames].slice(0, 10).forEach(n => console.log(`   └─ "${n}"`));
        if (unresolvedNames.size > 10) {
            console.log(`   └─ ... and ${unresolvedNames.size - 10} more`);
        }
    }

    // Summary
    const categories = await Medicine.distinct('category');
    console.log(`\n📊 Summary:`);
    console.log(`   Medicines: ${insertData.length}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   Substitute links: ${linkedCount}`);
    console.log(`   Unresolved subs: ${unresolvedNames.size}`);

    await disconnectDB();
    console.log('\n✨ Seeding complete.\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
});
