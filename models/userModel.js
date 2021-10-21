import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'type field name is required.'],
    trim: true,
    maxlength: [20, 'your username must have less than or equal to 20 characters.'],
    minlength: [3, 'your username must have at least 3 characters.'],
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, 'type field email is required.'],
    unique: [true, 'there is an account already associated with this email.'],
    validate: [validator.isEmail, 'Please input a valid email.'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A password is required.'],
    minlength: [8, 'the tour name must have at least 8 characters.'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (element) {
        return element === this.password;
      },
      message: 'your passwords do not match. Please try again',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.matchPassword = async function (enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

userSchema.methods.noUpdatedUser = async function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    let result = jwtTimeStamp < changedTimeStamp;
    return result;
  }

  return false;
};

userSchema.methods.genPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 5000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
