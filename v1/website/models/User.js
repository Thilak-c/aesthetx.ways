import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the user.'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email for the user.'],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times due to Next.js fast refresh
export default mongoose.models.User || mongoose.model('User', UserSchema);
