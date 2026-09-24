const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    icon: {
      type: String,
      default: 'Package'
    },
    description: {
      type: String,
      default: ''
    },
    verificationFields: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        question: { type: String, required: true },
        placeholder: { type: String, default: '' },
        weight: { type: Number, default: 20 }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
