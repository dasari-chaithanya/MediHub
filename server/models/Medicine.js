/**
 * Medicine Model (models/Medicine.js)
 * MediDex medicine data with full-text search and substitute linking.
 */
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true,
            maxlength: 200,
        },
        genericName: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        form: {
            type: String,
            trim: true,
            default: 'Tablet',
        },
        strength: {
            type: String,
            trim: true,
            default: '',
        },
        manufacturer: {
            type: String,
            trim: true,
            default: '',
        },
        priceInr: {
            type: String,
            default: '',
        },
        prescriptionRequired: {
            type: Boolean,
            default: false,
        },
        usage: {
            type: [String],
            default: [],
        },
        dosage: {
            type: String,
            default: '',
        },
        sideEffects: {
            type: [String],
            default: [],
        },
        warnings: {
            type: [String],
            default: [],
        },
        relatedConditions: {
            type: [String],
            default: [],
        },
        // Dynamic substitute linking (ObjectId references to other medicines)
        substitutes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
        }],
        // Keep original substitute names for seeder resolution
        _substituteNames: {
            type: [String],
            select: false, // Hidden from normal queries
        },
    },
    {
        timestamps: true,
    }
);

// Full-text search index on name, genericName, and relatedConditions
medicineSchema.index(
    {
        name: 'text',
        genericName: 'text',
        category: 'text',
        relatedConditions: 'text',
    },
    {
        weights: {
            name: 10,
            genericName: 5,
            category: 3,
            relatedConditions: 2,
        },
        name: 'medicine_text_index',
    }
);

// Category index for filtered queries
medicineSchema.index({ category: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
