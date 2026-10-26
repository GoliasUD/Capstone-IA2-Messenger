import mongoose from 'mongoose';

const privateNoteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrimeUser', required: true, index: true
  },
  text: {
    type: String, required: true,
    trim: true, maxLength: 280
  }
}, { timestamps: true });

export const PrivateNote = mongoose.model(
  'PrivateNote', privateNoteSchema
);
