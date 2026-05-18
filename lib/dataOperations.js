import { connectDB } from './db';
import User from '@/models/User';
import Session from '@/models/Session';
import PasswordResetOTP from '@/models/PasswordResetOTP';
import Trash from '@/models/Trash';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Cart from '@/models/Cart';
import Wishlist from '@/models/Wishlist';
import Order from '@/models/Order';
import RecentlyViewed from '@/models/RecentlyViewed';
import View from '@/models/View';
import DailyAccess from '@/models/DailyAccess';
import Report from '@/models/Report';
import ChatSession from '@/models/ChatSession';
import ChatMessage from '@/models/ChatMessage';
import SupportTicket from '@/models/SupportTicket';
import Collection from '@/models/Collection';
import ReportTemplate from '@/models/ReportTemplate';
import ReportInstance from '@/models/ReportInstance';
import ScheduledReport from '@/models/ScheduledReport';
import ReportExport from '@/models/ReportExport';
import ReportSubscription from '@/models/ReportSubscription';
import EmailNotification from '@/models/EmailNotification';
import UserActivity from '@/models/UserActivity';
import ActiveSession from '@/models/ActiveSession';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from './jwt';

const models = {
  users: User,
  sessions: Session,
  passwordResetOTPs: PasswordResetOTP,
  trash: Trash,
  products: Product,
  reviews: Review,
  cart: Cart,
  wishlist: Wishlist,
  orders: Order,
  recentlyViewed: RecentlyViewed,
  views: View,
  dailyAccess: DailyAccess,
  reports: Report,
  chatSessions: ChatSession,
  chatMessages: ChatMessage,
  supportTickets: SupportTicket,
  collections: Collection,
  reportTemplates: ReportTemplate,
  reportInstances: ReportInstance,
  scheduledReports: ScheduledReport,
  reportExports: ReportExport,
  reportSubscriptions: ReportSubscription,
  emailNotifications: EmailNotification,
  userActivity: UserActivity,
  activeSessions: ActiveSession,
};

function nowIso() {
  return new Date().toISOString();
}

function toObjectId(id) {
  if (!id) return id;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

const operations = {
  // ===== AUTH =====
  auth: {
    async signup({ email, password, name }) {
      if (password.length < 8) throw new Error('Password must be at least 8 characters long');
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
      if (existing) throw new Error('Email already registered');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email: normalizedEmail, passwordHash, name: name || '', role: 'user', isActive: true, onboardingStep: 1, onboardingCompleted: false, interests: [] });
      const sessionToken = signToken({ userId: user._id.toString(), role: 'user' });
      return { success: true, sessionToken, userId: user._id.toString() };
    },
    async signIn({ email, password }) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) throw new Error('Invalid email or password');
      if (user.isDeleted) return { status: 'account_deleted', deletionInfo: { deletedAt: user.deletedAt, email: user.email, name: user.name || 'User' } };
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) throw new Error('Invalid email or password');
      if (user.isActive === false) await User.findByIdAndUpdate(user._id, { isActive: true });
      const sessionToken = signToken({ userId: user._id.toString(), role: user.role });
      return { status: 'success', sessionToken, userId: user._id.toString() };
    },
    async adminSignIn({ email, password }) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) throw new Error('Invalid credentials');
      if (user.isDeleted) return { status: 'account_deleted', deletionInfo: { deletedAt: user.deletedAt, email: user.email, name: user.name || 'Admin' } };
      if (user.role !== 'admin' && user.role !== 'super_admin') throw new Error('Access denied. Admin privileges required.');
      if (user.isActive === false) throw new Error('Admin account is inactive. Contact super admin.');
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) throw new Error('Invalid credentials');
      const sessionToken = signToken({ userId: user._id.toString(), role: user.role });
      return { status: 'success', sessionToken, userId: user._id.toString(), role: user.role, name: user.name || '', email: user.email };
    },
    async createSuperAdmin({ email, password, name }) {
      const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
      if (existingSuperAdmin) throw new Error('Super admin already exists. Contact existing super admin.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters long');
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
      if (existing) throw new Error('Email already registered');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email: normalizedEmail, passwordHash, name, role: 'super_admin', isActive: true, onboardingStep: 4, onboardingCompleted: true, interests: [] });
      const sessionToken = signToken({ userId: user._id.toString(), role: 'super_admin' });
      return { success: true, sessionToken, userId: user._id.toString(), role: 'super_admin' };
    },
    async requestPasswordResetOTP({ email, ...rest }) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
      if (!user) return { success: true, message: 'If the email exists, an OTP has been sent.' };
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await PasswordResetOTP.deleteMany({ email: normalizedEmail });
      await PasswordResetOTP.create({ email: normalizedEmail, otp, expiresAt, used: false });
      return { success: true, message: 'If the email exists, an OTP has been sent.', email: normalizedEmail, userName: user.name || 'User' };
    },
    async verifyPasswordResetOTP({ email, otp }) {
      const normalizedEmail = email.toLowerCase().trim();
      const otpRecord = await PasswordResetOTP.findOne({ email: normalizedEmail, otp, used: false });
      if (!otpRecord) return { success: false, message: 'Invalid OTP. Please try again.' };
      if (new Date(otpRecord.expiresAt) < new Date()) {
        await PasswordResetOTP.findByIdAndDelete(otpRecord._id);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }
      otpRecord.verified = true;
      await otpRecord.save();
      return { success: true, message: 'OTP verified' };
    },
    async resetPasswordWithOTP({ email, otp, newPassword }) {
      if (!newPassword || newPassword.length < 8) throw new Error('Password must be at least 8 characters long');
      const normalizedEmail = email.toLowerCase().trim();
      const otpRecord = await PasswordResetOTP.findOne({ email: normalizedEmail, otp, used: false, verified: true });
      if (!otpRecord) throw new Error('Invalid or expired OTP. Please request a new one.');
      if (new Date(otpRecord.expiresAt) < new Date()) {
        await PasswordResetOTP.findByIdAndDelete(otpRecord._id);
        throw new Error('OTP has expired. Please request a new one.');
      }
      const user = await User.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
      if (!user) throw new Error('User not found');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      await user.save();
      otpRecord.used = true;
      await otpRecord.save();
      await Session.deleteMany({ userId: user._id });
      return { success: true, message: 'Password reset successfully. Please login with your new password.' };
    },
    async setUserPasswordWithView({ userId, newPassword, adminId }) {
      const admin = await User.findById(toObjectId(adminId));
      if (!admin || admin.role !== 'super_admin') throw new Error('Access denied. Only super admins can set passwords.');
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      user.tempPassword = newPassword;
      user.tempPasswordSetAt = nowIso();
      await user.save();
      return { success: true, message: 'Password set successfully. User can login with the new password.' };
    },
    async resetAdminPassword({ email, newPassword }) {
      const user = await User.findOne({ email: email.toLowerCase().trim(), role: { $in: ['admin', 'super_admin'] } });
      if (!user) throw new Error('Admin user not found');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(user._id, { passwordHash, updatedAt: nowIso() });
      return { success: true, message: 'Admin password reset successfully' };
    },
  },

  // ===== USERS =====
  users: {
    async meByToken({ token }) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).lean();
        if (user && !user.isDeleted) return user;
        return null;
      }
      const session = await Session.findOne({ sessionToken: token }).populate('userId');
      if (!session) return null;
      const user = session.userId;
      if (!user || user.isDeleted) return null;
      if (new Date(session.expiresAt) < new Date()) {
        await Session.findByIdAndDelete(session._id);
        return null;
      }
      return user;
    },
    async adminMeByToken({ token }) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).lean();
        if (user && !user.isDeleted && (user.role === 'admin' || user.role === 'super_admin') && user.isActive !== false) return user;
        return null;
      }
      const session = await Session.findOne({ sessionToken: token }).populate('userId');
      if (!session) return null;
      const user = session.userId;
      if (!user || user.isDeleted) return null;
      if (user.role !== 'admin' && user.role !== 'super_admin') return null;
      if (user.isActive === false) return null;
      if (new Date(session.expiresAt) < new Date()) {
        await Session.findByIdAndDelete(session._id);
        return null;
      }
      return user;
    },
    async getAllUsers() {
      return User.find({ isDeleted: { $ne: true } }).lean();
    },
    async getUserByEmail({ email }) {
      return User.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } }).lean();
    },
    async getOnboarding({ userId }) {
      const user = await User.findById(toObjectId(userId)).lean();
      if (!user) throw new Error('User not found');
      return {
        onboardingStep: user.onboardingStep || 1,
        onboardingCompleted: user.onboardingCompleted || false,
        phoneNumber: user.phoneNumber,
        phoneNumberLocked: user.phoneNumberLocked,
        permanentAddress: user.permanentAddress,
        permanentAddressLocked: user.permanentAddressLocked,
        interests: user.interests || [],
      };
    },
    async viewUserPassword({ userId, requestedBy }) {
      const requestor = await User.findById(toObjectId(requestedBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      const targetUser = await User.findById(toObjectId(userId));
      if (!targetUser) throw new Error('User not found');
      if (targetUser.role === 'super_admin' && targetUser._id.toString() !== requestedBy) throw new Error('Cannot view other super admin passwords');
      return {
        userId: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        passwordHash: targetUser.passwordHash,
        note: 'Password hashes cannot be reversed to plain text.',
        accessedAt: nowIso(),
        accessedBy: requestor.email,
      };
    },
    async viewTempPassword({ userId, requestedBy }) {
      const requestor = await User.findById(toObjectId(requestedBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      const targetUser = await User.findById(toObjectId(userId));
      if (!targetUser) throw new Error('User not found');
      return {
        userId: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        tempPassword: targetUser.tempPassword || null,
        tempPasswordSetAt: targetUser.tempPasswordSetAt || null,
        accessedAt: nowIso(),
        accessedBy: requestor.email,
      };
    },
    async getTrashItems({ tableName }) {
      const filter = tableName ? { tableName } : {};
      return Trash.find(filter).sort({ deletedAt: -1 }).lean();
    },
    async saveProfile({ userId, name, photoUrl, interests, selectedSizes }) {
      const update = { updatedAt: nowIso() };
      if (name !== undefined) update.name = name;
      if (photoUrl !== undefined) update.photoUrl = photoUrl;
      if (interests !== undefined) update.interests = interests;
      if (selectedSizes !== undefined) update.selectedSizes = selectedSizes;
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async setOnboardingStep({ userId, step }) {
      await User.findByIdAndUpdate(toObjectId(userId), { onboardingStep: step, updatedAt: nowIso() });
      return { success: true };
    },
    async savePhoneAndAddress({ userId, phoneNumber, secondaryPhoneNumber, state, city, pinCode, fullAddress }) {
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.phoneNumberLocked || user.permanentAddressLocked) throw new Error('Phone number and address are already locked');
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) throw new Error('Please enter a valid 10-digit Indian mobile number');
      const cleanPin = pinCode.replace(/\D/g, '');
      if (cleanPin.length !== 6 || cleanPin.startsWith('0')) throw new Error('Please enter a valid 6-digit PIN code');
      const update = {
        phoneNumber: cleanPhone,
        phoneNumberLocked: true,
        address: { state, city, pinCode: cleanPin, fullAddress },
        permanentAddress: { state, city, pinCode: cleanPin, fullAddress },
        permanentAddressLocked: true,
        onboardingStep: 4,
        updatedAt: nowIso(),
      };
      if (secondaryPhoneNumber) {
        const cleanSecondary = secondaryPhoneNumber.replace(/\D/g, '');
        if (cleanSecondary.length === 10 && /^[6-9]/.test(cleanSecondary)) update.secondaryPhoneNumber = cleanSecondary;
      }
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async updateOnboarding({ userId, onboardingStep, onboardingCompleted, referralSource }) {
      const update = { updatedAt: nowIso() };
      if (onboardingStep !== undefined) update.onboardingStep = onboardingStep;
      if (onboardingCompleted !== undefined) update.onboardingCompleted = onboardingCompleted;
      if (referralSource !== undefined) update.referralSource = referralSource;
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async completeOnboarding({ userId, referralSource }) {
      const update = { onboardingCompleted: true, onboardingStep: 4, updatedAt: nowIso() };
      if (referralSource) update.referralSource = referralSource;
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async saveUserInterests({ userId, interests }) {
      await User.findByIdAndUpdate(toObjectId(userId), { interests, onboardingStep: 4, updatedAt: nowIso() });
      return { success: true };
    },
    async deleteUser({ userId, deletedBy, reason }) {
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.role === 'super_admin') throw new Error('Cannot delete super admin accounts');
      await Trash.create({ originalId: user._id, tableName: 'users', originalData: user.toObject(), deletedAt: nowIso(), deletedBy: toObjectId(deletedBy), deletionReason: reason || 'Deleted by administrator', canRestore: true });
      await User.findByIdAndUpdate(toObjectId(userId), { isDeleted: true, deletedAt: nowIso(), deletedBy: toObjectId(deletedBy), updatedAt: nowIso() });
      await Session.deleteMany({ userId: toObjectId(userId) });
      return { success: true };
    },
    async updateUser({ userId, name, role, isActive, updatedBy }) {
      const requestor = await User.findById(toObjectId(updatedBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.role === 'super_admin' && role && role !== 'super_admin') throw new Error('Cannot demote super admin accounts');
      const update = { updatedAt: nowIso() };
      if (name !== undefined) update.name = name;
      if (role !== undefined) update.role = role;
      if (isActive !== undefined) update.isActive = isActive;
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async toggleUserStatus({ userId, toggledBy }) {
      const requestor = await User.findById(toObjectId(toggledBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.role === 'super_admin') throw new Error('Cannot deactivate super admin accounts');
      await User.findByIdAndUpdate(toObjectId(userId), { isActive: !user.isActive, updatedAt: nowIso() });
      return { success: true, newStatus: !user.isActive };
    },
    async clearTempPassword({ userId, clearedBy }) {
      const requestor = await User.findById(toObjectId(clearedBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      await User.findByIdAndUpdate(toObjectId(userId), { $unset: { tempPassword: '', tempPasswordSetAt: '' }, updatedAt: nowIso() });
      return { success: true };
    },
    async moveUserToTrash({ userId, reason }) {
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.role === 'super_admin') throw new Error('Cannot move super admin accounts to trash');
      await Trash.create({ originalId: user._id, tableName: 'users', originalData: user.toObject(), deletedAt: nowIso(), deletedBy: toObjectId(userId), deletionReason: reason || 'User requested deletion', canRestore: true });
      await User.findByIdAndUpdate(toObjectId(userId), { isDeleted: true, deletedAt: nowIso(), deletedBy: toObjectId(userId), updatedAt: nowIso() });
      await Session.deleteMany({ userId: toObjectId(userId) });
      return { success: true };
    },
    async deactivateUser({ userId, reason }) {
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      if (user.role === 'super_admin') throw new Error('Cannot deactivate super admin accounts');
      await User.findByIdAndUpdate(toObjectId(userId), { isActive: false, updatedAt: nowIso() });
      await Session.deleteMany({ userId: toObjectId(userId) });
      return { success: true };
    },
    async reactivateUser({ userId }) {
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      await User.findByIdAndUpdate(toObjectId(userId), { isActive: true, updatedAt: nowIso() });
      return { success: true };
    },
    async reactivateAdminAccount({ userId, reactivatedBy }) {
      const requestor = await User.findById(toObjectId(reactivatedBy));
      if (!requestor || requestor.role !== 'super_admin') throw new Error('Access denied');
      const user = await User.findById(toObjectId(userId));
      if (!user) throw new Error('User not found');
      await User.findByIdAndUpdate(toObjectId(userId), { isActive: true, updatedAt: nowIso() });
      return { success: true };
    },
    async updateUserProfile({ userId, name, address, photoUrl, phoneNumber, secondaryPhoneNumber, interests }) {
      const user = await User.findById(toObjectId(userId));
      if (!user || user.isDeleted) throw new Error('User not found');
      const update = { updatedAt: nowIso() };
      if (name !== undefined) update.name = name;
      if (address !== undefined) update.address = address;
      if (photoUrl !== undefined) update.photoUrl = photoUrl;
      if (phoneNumber !== undefined) update.phoneNumber = phoneNumber;
      if (secondaryPhoneNumber !== undefined) update.secondaryPhoneNumber = secondaryPhoneNumber;
      if (interests !== undefined) update.interests = interests;
      await User.findByIdAndUpdate(toObjectId(userId), update);
      return { success: true };
    },
    async signOut({ sessionToken }) {
      await Session.findOneAndDelete({ sessionToken });
    },
    async promoteUserToAdmin({ email, role }) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) throw new Error('User not found');
      if (user.isDeleted) throw new Error('Cannot promote deleted user');
      await User.findByIdAndUpdate(user._id, { role, isActive: true, updatedAt: nowIso() });
      return { success: true };
    },
    async restoreFromTrash({ trashId, restoredBy }) {
      const trashItem = await Trash.findById(toObjectId(trashId));
      if (!trashItem) throw new Error('Trash item not found');
      if (!trashItem.canRestore) throw new Error('This item cannot be restored');
      if (trashItem.tableName === 'users') {
        const emailConflict = await User.findOne({ email: trashItem.originalData.email, isDeleted: { $ne: true } });
        if (emailConflict) throw new Error('Cannot restore: Email is already in use by another active user');
      }
      const originalData = trashItem.originalData;
      delete originalData._id;
      delete originalData.__v;
      await User.findByIdAndUpdate(trashItem.originalId, { ...originalData, isDeleted: false, deletedAt: undefined, deletedBy: undefined, updatedAt: nowIso() });
      await Trash.findByIdAndDelete(toObjectId(trashId));
      return { success: true };
    },
    async permanentDelete({ trashId, deletedBy }) {
      const trashItem = await Trash.findById(toObjectId(trashId));
      if (!trashItem) throw new Error('Trash item not found');
      await User.findByIdAndDelete(trashItem.originalId).catch(() => {});
      await Trash.findByIdAndDelete(toObjectId(trashId));
      return { success: true };
    },
    async emptyTrash({ emptiedBy }) {
      const items = await Trash.find({});
      for (const item of items) {
        await User.findByIdAndDelete(item.originalId).catch(() => {});
        await Trash.findByIdAndDelete(item._id);
      }
      return { success: true };
    },
    async cleanupDuplicates() {
      const allUsers = await User.find({});
      const emailGroups = {};
      allUsers.forEach(user => {
        const email = user.email.toLowerCase().trim();
        if (!emailGroups[email]) emailGroups[email] = [];
        emailGroups[email].push(user);
      });
      let cleanedCount = 0;
      for (const [email, users] of Object.entries(emailGroups)) {
        if (users.length > 1) {
          users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const [keepUser, ...duplicateUsers] = users;
          for (const dup of duplicateUsers) {
            await User.findByIdAndUpdate(dup._id, { isDeleted: true, deletedAt: nowIso(), deletedBy: keepUser._id });
            cleanedCount++;
          }
        }
      }
      return { cleanedCount };
    },
  },

  // ===== PRODUCTS =====
  products: {
    async getAll() {
      return Product.find({ isDeleted: { $ne: true } }).lean();
    },
    async getAllProducts({ limit }) {
      let query = Product.find({ isDeleted: { $ne: true }, isHidden: { $ne: true } }).sort({ createdAt: -1 });
      if (limit) query = query.limit(limit);
      return query.lean();
    },
    async getById({ itemId }) {
      return Product.findOne({ itemId }).lean();
    },
    async getProductById({ itemId }) {
      const product = await Product.findOne({ itemId }).lean();
      if (product) {
        await Product.findOneAndUpdate({ itemId }, { $inc: { inCart: 0 } });
      }
      return product;
    },
    async getProductsByIds({ itemIds }) {
      return Product.find({ itemId: { $in: itemIds || [] }, isDeleted: { $ne: true } }).lean();
    },
    async getRecentlyViewed({ productIds }) {
      if (!productIds || productIds.length === 0) return [];
      return Product.find({ itemId: { $in: productIds }, isDeleted: { $ne: true } }).limit(8).lean();
    },
    async getPersonalizedProducts({ productIds, excludeItemId, limit = 8 }) {
      const filter = { isDeleted: { $ne: true }, isHidden: { $ne: true } };
      if (productIds && productIds.length > 0) filter.itemId = { $in: productIds };
      if (excludeItemId) filter.itemId = { ...filter.itemId, $ne: excludeItemId };
      return Product.find(filter).limit(limit).lean();
    },
    async getRelatedProducts({ categories, excludeItemId, limit = 8 }) {
      const filter = { isDeleted: { $ne: true }, isHidden: { $ne: true } };
      if (categories && categories.length > 0) filter.category = { $in: categories };
      if (excludeItemId) filter.itemId = { $ne: excludeItemId };
      return Product.find(filter).limit(limit).lean();
    },
    async getProductStats() {
      const total = await Product.countDocuments({ isDeleted: { $ne: true } });
      const active = await Product.countDocuments({ isDeleted: { $ne: true }, isHidden: { $ne: true } });
      const outOfStock = await Product.countDocuments({ isDeleted: { $ne: true }, $or: [{ inStock: false }, { currentStock: { $lte: 0 } }] });
      const categories = await Product.distinct('category', { isDeleted: { $ne: true } });
      return { total, active, outOfStock, categories: categories.length };
    },
    async getDashboardStats({ startDate, endDate }) {
      const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
      return { totalProducts };
    },
    async getSalesPerformanceFixed({ startDate, endDate }) {
      const products = await Product.find({ isDeleted: { $ne: true } }).sort({ buys: -1 }).limit(10).lean();
      return products.map(p => ({ name: p.name, sales: p.buys || 0, revenue: (p.buys || 0) * p.price }));
    },
    async getAdvancedAnalyticsFixed({ startDate, endDate }) {
      const products = await Product.find({ isDeleted: { $ne: true } }).lean();
      return products.map(p => ({ name: p.name, sales: p.buys || 0, category: p.category || 'Uncategorized', views: p.inCart || 0 }));
    },
    async getDetailedReportsFixed({ startDate, endDate }) {
      const products = await Product.find({ isDeleted: { $ne: true } }).lean();
      return products.map(p => ({ name: p.name, category: p.category || 'Uncategorized', price: p.price, sales: p.buys || 0, stock: p.currentStock || 0, type: (p.type || []).join(', ') }));
    },
    async searchProducts({ query, category, minPrice, maxPrice, sizes, colors, garmentType, sortBy, page = 1, limit = 20 }) {
      const filter = { isDeleted: { $ne: true }, isHidden: { $ne: true } };
      if (query) filter.name = { $regex: query, $options: 'i' };
      if (category) filter.category = category;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }
      if (sizes && sizes.length > 0) filter.availableSizes = { $in: sizes };
      if (colors && colors.length > 0) filter.availableColors = { $in: colors };
      if (garmentType) filter.garmentType = garmentType;
      let sort = {};
      if (sortBy === 'price_asc') sort.price = 1;
      else if (sortBy === 'price_desc') sort.price = -1;
      else if (sortBy === 'newest') sort.createdAt = -1;
      else if (sortBy === 'popular') sort.buys = -1;
      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean();
      return { products, total, page, totalPages: Math.ceil(total / limit) };
    },
    async searchProductsForNavbar({ query, limit = 5 }) {
      if (!query) return [];
      return Product.find({ name: { $regex: query, $options: 'i' }, isDeleted: { $ne: true }, isHidden: { $ne: true } }).limit(limit).lean();
    },
    async insert({ name, description, mainImage, otherImages, price, category, subcategories, itemId, type, color, garmentType, availableSizes, sizeStock, availableColors, colorStock, inStock, totalAvailable, currentStock, isHidden }) {
      const product = await Product.create({ name, description, mainImage, otherImages, price, category, subcategories, itemId, type, color, garmentType, availableSizes, sizeStock, availableColors, colorStock, inStock, totalAvailable, currentStock, isHidden });
      return { success: true, id: product._id };
    },
    async update({ itemId, ...updates }) {
      const product = await Product.findOneAndUpdate({ itemId }, { ...updates, updatedAt: nowIso() }, { new: true });
      if (!product) throw new Error('Product not found');
      return { success: true };
    },
    async toggleHidden({ itemId }) {
      const product = await Product.findOne({ itemId });
      if (!product) throw new Error('Product not found');
      await Product.findOneAndUpdate({ itemId }, { isHidden: !product.isHidden, updatedAt: nowIso() });
      return { success: true };
    },
    async deleteProduct({ itemId, deletedBy }) {
      const product = await Product.findOne({ itemId });
      if (!product) throw new Error('Product not found');
      await Product.findOneAndUpdate({ itemId }, { isDeleted: true, deletedAt: nowIso(), deletedBy: toObjectId(deletedBy), updatedAt: nowIso() });
      return { success: true };
    },
    async updateProductStock({ itemId, size, quantity, operation }) {
      const product = await Product.findOne({ itemId });
      if (!product) throw new Error('Product not found');
      if (size && product.sizeStock) {
        const currentQty = product.sizeStock[size] || 0;
        product.sizeStock[size] = operation === 'decrement' ? Math.max(0, currentQty - quantity) : currentQty + quantity;
        product.markModified('sizeStock');
      }
      const totalStock = Object.values(product.sizeStock || {}).reduce((a, b) => a + (b || 0), 0);
      product.currentStock = totalStock;
      product.inStock = totalStock > 0;
      await product.save();
      return { success: true };
    },
    async moveToTrash({ itemId, deletedBy, reason }) {
      const product = await Product.findOne({ itemId });
      if (!product) throw new Error('Product not found');
      await Trash.create({ originalId: product._id, tableName: 'products', originalData: product.toObject(), deletedAt: nowIso(), deletedBy: toObjectId(deletedBy), deletionReason: reason || 'Moved to trash', canRestore: true });
      await Product.findOneAndUpdate({ itemId }, { isDeleted: true, deletedAt: nowIso(), deletedBy: toObjectId(deletedBy), updatedAt: nowIso() });
      return { success: true };
    },
    async restoreFromTrash({ trashId }) {
      const trashItem = await Trash.findById(toObjectId(trashId));
      if (!trashItem) throw new Error('Trash item not found');
      const data = trashItem.originalData;
      await Product.findByIdAndUpdate(trashItem.originalId, { ...data, isDeleted: false, deletedAt: undefined, deletedBy: undefined, updatedAt: nowIso() });
      await Trash.findByIdAndDelete(toObjectId(trashId));
      return { success: true };
    },
    async addRecentlyViewed({ userId, productId, productName, productImage, productPrice, productCategory }) {
      await RecentlyViewed.findOneAndUpdate(
        { userId: toObjectId(userId), productId },
        { userId: toObjectId(userId), productId, productName, productImage, productPrice, productCategory, viewedAt: nowIso() },
        { upsert: true }
      );
      const count = await RecentlyViewed.countDocuments({ userId: toObjectId(userId) });
      if (count > 20) {
        const oldest = await RecentlyViewed.find({ userId: toObjectId(userId) }).sort({ viewedAt: 1 }).limit(count - 20);
        for (const o of oldest) await RecentlyViewed.findByIdAndDelete(o._id);
      }
      return { success: true };
    },
  },

  // ===== CART =====
  cart: {
    async getUserCart({ userId }) {
      return Cart.find({ userId: toObjectId(userId), isActive: true }).lean();
    },
    async getCartSummary({ userId }) {
      if (!userId) return { totalItems: 0, totalAmount: 0, items: [] };
      const items = await Cart.find({ userId: toObjectId(userId), isActive: true }).lean();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { totalItems, totalAmount, items };
    },
    async addToCart({ userId, productId, productName, productImage, price, size, quantity = 1 }) {
      const existing = await Cart.findOne({ userId: toObjectId(userId), productId, size, isActive: true });
      if (existing) {
        existing.quantity += quantity;
        await existing.save();
      } else {
        await Cart.create({ userId: toObjectId(userId), productId, productName, productImage, price, size, quantity, isActive: true });
      }
      return { success: true };
    },
    async updateCartQuantity({ userId, productId, size, quantity }) {
      if (quantity <= 0) {
        await Cart.findOneAndDelete({ userId: toObjectId(userId), productId, size });
      } else {
        await Cart.findOneAndUpdate({ userId: toObjectId(userId), productId, size, isActive: true }, { quantity });
      }
      return { success: true };
    },
    async removeFromCart({ userId, productId, size }) {
      await Cart.findOneAndDelete({ userId: toObjectId(userId), productId, size });
      return { success: true };
    },
    async clearCart({ userId }) {
      await Cart.deleteMany({ userId: toObjectId(userId), isActive: true });
      return { success: true };
    },
  },

  // ===== WISHLIST =====
  wishlist: {
    async getUserWishlist({ userId }) {
      return Wishlist.find({ userId: toObjectId(userId), isActive: true }).lean();
    },
    async getWishlistSummary({ userId }) {
      if (!userId) return { totalItems: 0, items: [] };
      const items = await Wishlist.find({ userId: toObjectId(userId), isActive: true }).lean();
      return { totalItems: items.length, items };
    },
    async isProductWishlisted({ userId, productId }) {
      const item = await Wishlist.findOne({ userId: toObjectId(userId), productId, isActive: true });
      return !!item;
    },
    async addToWishlist({ userId, productId, productName, productImage, price, category }) {
      const existing = await Wishlist.findOne({ userId: toObjectId(userId), productId });
      if (existing) {
        if (!existing.isActive) {
          existing.isActive = true;
          await existing.save();
        }
      } else {
        await Wishlist.create({ userId: toObjectId(userId), productId, productName, productImage, price, category, isActive: true });
      }
      return { success: true };
    },
    async removeFromWishlist({ userId, productId }) {
      await Wishlist.findOneAndUpdate({ userId: toObjectId(userId), productId }, { isActive: false });
      return { success: true };
    },
    async toggleWishlist({ userId, productId, productName, productImage, price, category }) {
      const existing = await Wishlist.findOne({ userId: toObjectId(userId), productId });
      if (existing) {
        existing.isActive = !existing.isActive;
        await existing.save();
        return { success: true, isWishlisted: existing.isActive };
      }
      await Wishlist.create({ userId: toObjectId(userId), productId, productName, productImage, price, category, isActive: true });
      return { success: true, isWishlisted: true };
    },
    async clearWishlist({ userId }) {
      await Wishlist.updateMany({ userId: toObjectId(userId), isActive: true }, { isActive: false });
      return { success: true };
    },
  },

  // ===== ORDERS =====
  orders: {
    async getOrderStats() {
      const total = await Order.countDocuments({});
      const pending = await Order.countDocuments({ status: 'pending' });
      const confirmed = await Order.countDocuments({ status: 'confirmed' });
      const shipped = await Order.countDocuments({ status: 'shipped' });
      const delivered = await Order.countDocuments({ status: 'delivered' });
      const cancelled = await Order.countDocuments({ status: 'cancelled' });
      const totalRevenue = await Order.aggregate([{ $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } }, { $group: { _id: null, total: { $sum: '$orderTotal' } } }]);
      return { total, pending, confirmed, shipped, delivered, cancelled, totalRevenue: totalRevenue[0]?.total || 0 };
    },
    async getOrdersWithFilters({ status, search, page = 1, limit = 20 }) {
      const filter = {};
      if (status) filter.status = status;
      if (search) filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { 'shippingDetails.fullName': { $regex: search, $options: 'i' } }, { 'shippingDetails.email': { $regex: search, $options: 'i' } }];
      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
      return { orders, total, page, totalPages: Math.ceil(total / limit) };
    },
    async getUserOrders({ userId }) {
      const uid = toObjectId(userId);
      if (!uid) return [];
      return Order.find({ userId: uid }).sort({ createdAt: -1 }).lean();
    },
    async getOrderByNumber({ orderNumber }) {
      return Order.findOne({ orderNumber }).lean();
    },
    async getAllOrders({ startDate, endDate, status }) {
      const filter = {};
      if (status) filter.status = status;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate).getTime();
        if (endDate) filter.createdAt.$lte = new Date(endDate).getTime();
      }
      return Order.find(filter).sort({ createdAt: -1 }).lean();
    },
    async createOrder({ userId, items, shippingDetails, paymentDetails, orderTotal, orderNumber }) {
      const order = await Order.create({
        userId: toObjectId(userId) || userId,
        orderNumber,
        items,
        shippingDetails,
        paymentDetails,
        orderTotal,
        status: 'pending',
        deliveryDetails: [{ status: 'order_placed', message: 'Order placed successfully', timestamp: Date.now() }],
      });
      return { success: true, orderId: order._id, orderNumber: order.orderNumber };
    },
    async updateOrderStatus({ orderNumber, status, updatedBy }) {
      const now = new Date();
      const update = { status };
      if (status === 'shipped') update.shippedAt = now.getTime();
      if (status === 'delivered') update.deliveredAt = now.getTime();
      await Order.findOneAndUpdate({ orderNumber }, { $set: update, $currentDate: { updatedAt: true } });
      return { success: true };
    },
    async bulkUpdateOrderStatus({ orderNumbers, status }) {
      await Order.updateMany({ orderNumber: { $in: orderNumbers } }, { $set: { status }, $currentDate: { updatedAt: true } });
      return { success: true };
    },
    async cancelOrder({ orderNumber, reason }) {
      await Order.findOneAndUpdate({ orderNumber }, { $set: { status: 'cancelled' }, $currentDate: { updatedAt: true } });
      return { success: true };
    },
    async addDeliveryUpdate({ orderNumber, status, message, location, updatedBy }) {
      const order = await Order.findOne({ orderNumber });
      if (!order) throw new Error('Order not found');
      if (!order.deliveryDetails) order.deliveryDetails = [];
      order.deliveryDetails.push({ status, message, location, timestamp: Date.now(), updatedBy });
      order.markModified('deliveryDetails');
      if (status === 'delivered') order.deliveredAt = Date.now();
      if (status === 'shipped') order.shippedAt = Date.now();
      order.status = status;
      await order.save();
      return { success: true };
    },
  },

  // ===== REVIEWS =====
  reviews: {
    async getProductReviews({ productId }) {
      return Review.find({ productId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
    },
    async getProductReviewStats({ productId }) {
      const reviews = await Review.find({ productId, isDeleted: { $ne: true } }).lean();
      const total = reviews.length;
      if (total === 0) return { total: 0, average: 0, averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      const sum = reviews.reduce((s, r) => s + r.rating, 0);
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
      const average = Math.round((sum / total) * 10) / 10;
      return { total, totalReviews: total, average, averageRating: average, distribution, ratingDistribution: distribution };
    },
    async addReview({ productId, userId, userName, rating, title, comment, size, recommend }) {
      const review = await Review.create({ productId, userId: toObjectId(userId), userName, rating, title, comment, size, recommend: recommend !== false, verified: false, helpful: 0 });
      return { success: true, reviewId: review._id };
    },
    async markHelpful({ reviewId }) {
      await Review.findByIdAndUpdate(toObjectId(reviewId), { $inc: { helpful: 1 } });
      return { success: true };
    },
    async deleteReview({ reviewId }) {
      await Review.findByIdAndUpdate(toObjectId(reviewId), { isDeleted: true });
      return { success: true };
    },
  },

  // ===== VIEWS =====
  views: {
    async addView({ productId, userId, ipAddress, userAgent, referrer, viewType, searchQuery, category, sessionId }) {
      await View.create({ productId, userId: userId ? toObjectId(userId) : undefined, ipAddress, userAgent, referrer, viewedAt: nowIso(), viewType, searchQuery, category, sessionId });
      await Product.findOneAndUpdate({ itemId: productId }, { $inc: { inCart: 0.5 } });
      return { success: true };
    },
    async getMostViewedProducts({ limit = 8, days = 30 }) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const topViews = await View.aggregate([
        { $match: { viewedAt: { $gte: since }, isDeleted: { $ne: true } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);
      const itemIds = topViews.map(v => v._id);
      if (itemIds.length === 0) return [];
      const products = await Product.find({ itemId: { $in: itemIds }, isDeleted: { $ne: true }, isHidden: { $ne: true } }).lean();
      return itemIds.map(id => products.find(p => p.itemId === id)).filter(Boolean);
    },
    async getProductViewStats({ productId }) {
      const total = await View.countDocuments({ productId });
      const unique = await View.distinct('sessionId', { productId });
      return { total, uniqueSessions: unique.length };
    },
  },

  // ===== CATEGORY =====
  category: {
    async getAllProducts() {
      return Product.find({ isDeleted: { $ne: true }, isHidden: { $ne: true } }).lean();
    },
    async getAllSubcategories() {
      const subcategories = await Product.distinct('subcategories', { isDeleted: { $ne: true } });
      return subcategories.filter(Boolean);
    },
    async getProductsByCategory({ category }) {
      return Product.find({ category, isDeleted: { $ne: true }, isHidden: { $ne: true } }).lean();
    },
  },

  // ===== COLLECTIONS =====
  collections: {
    async getCollectionBySlug({ slug }) {
      return Collection.findOne({ slug, isActive: true }).lean();
    },
    async getCollectionProducts({ slug }) {
      const collection = await Collection.findOne({ slug, isActive: true }).lean();
      if (!collection) return [];
      if (collection.type === 'manual' && collection.productIds?.length > 0) {
        return Product.find({ itemId: { $in: collection.productIds }, isDeleted: { $ne: true } }).lean();
      }
      return [];
    },
    async getActiveCollections() {
      return Collection.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    },
  },

  // ===== ANALYTICS =====
  analytics: {
    async trackActivity(args) {
      const { userId, sessionId, activityType, actionType, page, previousPage, actionData, deviceType, browser, os, screenResolution, country, city, ipAddress, referrer, referrerDomain, utmSource, utmMedium, utmCampaign, duration, deviceInfo } = args;
      const dt = deviceType || deviceInfo?.deviceType || 'desktop';
      const br = browser || deviceInfo?.browser || 'unknown';
      const osVal = os || deviceInfo?.os || 'unknown';
      const sr = screenResolution || deviceInfo?.screenResolution;
      await UserActivity.create({
        userId: userId ? toObjectId(userId) : undefined,
        sessionId,
        activityType,
        actionType,
        page,
        previousPage,
        actionData,
        deviceType: dt,
        browser: br,
        os: osVal,
        screenResolution: sr,
        country,
        city,
        ipAddress,
        referrer,
        referrerDomain,
        utmSource,
        utmMedium,
        utmCampaign,
        timestamp: nowIso(),
        duration,
        isAnonymized: !userId,
      });
      await ActiveSession.findOneAndUpdate(
        { sessionId },
        { $set: { sessionId, userId: userId ? toObjectId(userId) : undefined, currentPage: page, lastActivity: nowIso(), deviceType, browser, os, country, city }, $inc: { pageViews: 1, actionsCount: 1 }, $setOnInsert: { sessionStart: nowIso() } },
        { upsert: true }
      );
      return { success: true };
    },
    async getActiveUsers() {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return ActiveSession.find({ isActive: true, lastActivity: { $gte: fiveMinAgo } }).lean();
    },
    async getActivityStats({ startDate, endDate }) {
      const filter = {};
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = startDate;
        if (endDate) filter.timestamp.$lte = endDate;
      }
      const totalViews = await UserActivity.countDocuments({ ...filter, activityType: 'page_view' });
      const totalActions = await UserActivity.countDocuments({ ...filter, activityType: 'action' });
      const uniqueSessions = await UserActivity.distinct('sessionId', filter);
      return { totalViews, totalActions, uniqueSessions: uniqueSessions.length };
    },
    async getRecentActivities({ limit = 50 }) {
      return UserActivity.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    },
    async getSessionDetails({ sessionId }) {
      const activities = await UserActivity.find({ sessionId }).sort({ timestamp: 1 }).lean();
      const session = await ActiveSession.findOne({ sessionId }).lean();
      return { session, activities };
    },
    async getAnalyticsForDay({ date }) {
      const [year, month, day] = date.split('-').map(Number);
      if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) throw new Error(`Invalid date: ${date}`);
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)).toISOString();
      const activities = await UserActivity.find({ timestamp: { $gte: startOfDay, $lte: endOfDay } }).sort({ timestamp: -1 }).lean();
      const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({ hour, views: 0, uniqueVisitors: new Set() }));
      const pageCount = {};
      const deviceCount = {};
      const browserCount = {};
      activities.forEach(a => {
        const h = new Date(a.timestamp).getUTCHours();
        hourlyBuckets[h].views++;
        hourlyBuckets[h].uniqueVisitors.add(a.sessionId);
        pageCount[a.page] = (pageCount[a.page] || 0) + 1;
        deviceCount[a.deviceType] = (deviceCount[a.deviceType] || 0) + 1;
        browserCount[a.browser] = (browserCount[a.browser] || 0) + 1;
      });
      return {
        date,
        totalPageViews: activities.filter(a => a.activityType === 'page_view').length,
        totalActions: activities.filter(a => a.activityType === 'action').length,
        uniqueSessions: [...new Set(activities.map(a => a.sessionId))].length,
        hourlyBuckets: hourlyBuckets.map(b => ({ hour: b.hour, views: b.views, uniqueVisitors: b.uniqueVisitors.size })),
        topPages: Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count })),
        deviceBreakdown: Object.entries(deviceCount).map(([device, count]) => ({ device, count })),
        browserBreakdown: Object.entries(browserCount).map(([browser, count]) => ({ browser, count })),
      };
    },
    async getPaymentMethodsAnalytics({ startDate, endDate }) {
      const filter = {};
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate).getTime();
        if (endDate) { const e = new Date(endDate); e.setHours(23, 59, 59, 999); filter.createdAt.$lte = e.getTime(); }
      }
      const orders = await Order.find(filter).lean();
      const activeOrders = orders.filter(o => o.status !== 'cancelled');
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');
      const paymentMethods = {};
      const paymentMethodRevenue = {};
      const orderStatusBreakdown = {};
      const cancelledByMethod = {};
      const cancelledRevenue = {};
      const dailyPaymentData = {};
      orders.forEach(order => {
        const status = order.status || 'unknown';
        orderStatusBreakdown[status] = (orderStatusBreakdown[status] || 0) + 1;
      });
      cancelledOrders.forEach(order => {
        const method = order.paymentDetails?.paymentMethod || 'razorpay';
        const amount = order.orderTotal || 0;
        cancelledByMethod[method] = (cancelledByMethod[method] || 0) + 1;
        cancelledRevenue[method] = (cancelledRevenue[method] || 0) + amount;
      });
      activeOrders.forEach(order => {
        const method = order.paymentDetails?.paymentMethod || 'razorpay';
        const amount = order.orderTotal || 0;
        const d = new Date(order.createdAt);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        paymentMethodRevenue[method] = (paymentMethodRevenue[method] || 0) + amount;
        if (!dailyPaymentData[dateKey]) dailyPaymentData[dateKey] = { date: dateKey, razorpay: 0, cancelled: 0, razorpayRevenue: 0, total: 0, totalRevenue: 0 };
        dailyPaymentData[dateKey].razorpay++;
        dailyPaymentData[dateKey].razorpayRevenue += amount;
        dailyPaymentData[dateKey].total++;
        dailyPaymentData[dateKey].totalRevenue += amount;
      });
      return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + (o.status !== 'cancelled' ? (o.orderTotal || 0) : 0), 0),
        cancelledOrders: cancelledOrders.length,
        paymentMethods,
        paymentMethodRevenue,
        orderStatusBreakdown,
        cancelledByMethod,
        cancelledRevenue,
        dailyData: Object.values(dailyPaymentData).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, displayDate: d.date.slice(5) })),
      };
    },
  },

  // ===== DAILY ACCESS =====
  dailyAccess: {
    async requestAccess({ userIdV, date }) {
      const existing = await DailyAccess.findOne({ userIdV, date });
      if (existing) return { success: true, message: 'Access already recorded' };
      await DailyAccess.create({ userIdV, date });
      return { success: true };
    },
    async getDailyCount({ date }) {
      const count = await DailyAccess.countDocuments({ date });
      return count;
    },
  },

  // ===== CHAT SESSIONS =====
  chatSessions: {
    async getActiveChatSessions() {
      return ChatSession.find({ isActive: true, status: { $in: ['active', 'waiting'] } }).sort({ lastMessageAt: -1 }).lean();
    },
    async getAssignedChatSessions({ userId }) {
      return ChatSession.find({ assignedTo: toObjectId(userId), isActive: true }).sort({ lastMessageAt: -1 }).lean();
    },
    async getChatSession({ sessionId }) {
      return ChatSession.findOne({ sessionId }).lean();
    },
    async createChatSession(args) {
      const { sessionId: providedSessionId, guestInfo, category, userId, initialMessage } = args;
      const sessionId = providedSessionId || `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      const existing = await ChatSession.findOne({ sessionId });
      if (existing) return existing;
      const session = await ChatSession.create({
        sessionId,
        userId: userId ? toObjectId(userId) : undefined,
        status: 'active',
        priority: 'low',
        category: category || 'general',
        lastMessageAt: nowIso(),
        isActive: true,
        guestInfo,
      });
      if (initialMessage) {
        await ChatMessage.create({
          sessionId,
          senderId: userId ? toObjectId(userId) : undefined,
          senderType: 'user',
          senderName: guestInfo?.name || 'User',
          message: initialMessage,
          messageType: 'text',
          isRead: false,
          createdAt: nowIso(),
        });
      }
      return { ...session.toObject(), sessionId };
    },
    async updateChatSessionStatus({ sessionId, status, assignedTo }) {
      const update = { status, updatedAt: nowIso() };
      if (assignedTo) update.assignedTo = toObjectId(assignedTo);
      await ChatSession.findOneAndUpdate({ sessionId }, update);
      return { success: true };
    },
  },

  // ===== CHAT MESSAGES =====
  chatMessages: {
    async getSessionMessages({ sessionId }) {
      return ChatMessage.find({ sessionId, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
    },
    async getLatestMessages({ sessionId, limit = 50 }) {
      return ChatMessage.find({ sessionId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(limit).lean();
    },
    async getAdminUnreadMessages({ adminId }) {
      const assignedSessions = await ChatSession.find({ assignedTo: toObjectId(adminId) }).distinct('sessionId');
      return ChatMessage.find({ sessionId: { $in: assignedSessions }, isRead: false, senderType: 'user' }).sort({ createdAt: -1 }).lean();
    },
    async sendMessage({ sessionId, senderId, senderType, senderName, message, messageType = 'text' }) {
      const msg = await ChatMessage.create({ sessionId, senderId: senderId ? toObjectId(senderId) : undefined, senderType, senderName, message, messageType, isRead: false, createdAt: nowIso() });
      await ChatSession.findOneAndUpdate({ sessionId }, { lastMessageAt: nowIso(), updatedAt: nowIso(), status: senderType === 'admin' ? 'active' : 'waiting' });
      return { success: true, messageId: msg._id };
    },
    async markMessagesAsRead({ sessionId, userId }) {
      await ChatMessage.updateMany({ sessionId, senderType: { $ne: 'admin' }, isRead: false }, { isRead: true, readAt: nowIso() });
      return { success: true };
    },
  },

  // ===== SUPPORT TICKETS =====
  supportTickets: {
    async getSupportTickets({ status, sessionId }) {
      const filter = {};
      if (status) filter.status = status;
      if (sessionId) filter.sessionId = sessionId;
      return SupportTicket.find(filter).sort({ createdAt: -1 }).lean();
    },
    async getTicketStats() {
      const open = await SupportTicket.countDocuments({ status: 'open' });
      const inProgress = await SupportTicket.countDocuments({ status: 'in_progress' });
      const resolved = await SupportTicket.countDocuments({ status: 'resolved' });
      const closed = await SupportTicket.countDocuments({ status: 'closed' });
      return { open, inProgress, resolved, closed, total: open + inProgress + resolved + closed };
    },
    async updateTicket({ ticketId, status, priority }) {
      const update = { updatedAt: nowIso() };
      if (status) update.status = status;
      if (priority) update.priority = priority;
      if (status === 'resolved') update.resolvedAt = nowIso();
      if (status === 'closed') update.closedAt = nowIso();
      await SupportTicket.findByIdAndUpdate(toObjectId(ticketId), update);
      return { success: true };
    },
    async assignTicket({ ticketId, assignedTo }) {
      await SupportTicket.findByIdAndUpdate(toObjectId(ticketId), { assignedTo: toObjectId(assignedTo), updatedAt: nowIso() });
      return { success: true };
    },
  },

  // ===== REPORT TEMPLATES =====
  reportTemplates: {
    async getReportTemplates() {
      return ReportTemplate.find({ isActive: true }).lean();
    },
    async getReportCategories() {
      return ReportTemplate.distinct('category', { isActive: true });
    },
    async deleteReportTemplate({ templateId }) {
      await ReportTemplate.findByIdAndUpdate(toObjectId(templateId), { isActive: false });
      return { success: true };
    },
  },

  // ===== REPORT GENERATOR =====
  reportGenerator: {
    async getUserReportInstances({ userId, limit = 10 }) {
      return ReportInstance.find({ generatedBy: toObjectId(userId) }).sort({ generatedAt: -1 }).limit(limit).lean();
    },
    async generateReport({ templateId, parameters, userId }) {
      const instance = await ReportInstance.create({
        templateId: toObjectId(templateId),
        name: 'Generated Report',
        parameters,
        status: 'completed',
        metadata: { recordCount: 0, generationTime: 0, dataSize: 0 },
        generatedBy: toObjectId(userId),
        generatedAt: nowIso(),
      });
      return { success: true, instanceId: instance._id };
    },
  },

  // ===== EMAIL NOTIFICATIONS =====
  emailNotifications: {
    async getEmailNotifications({ limit = 50 }) {
      return EmailNotification.find({}).sort({ sentAt: -1 }).limit(limit).lean();
    },
    async getEmailNotificationStats() {
      const total = await EmailNotification.countDocuments({});
      const sent = await EmailNotification.countDocuments({ status: 'sent' });
      const failed = await EmailNotification.countDocuments({ status: 'failed' });
      return { total, sent, failed };
    },
  },

  // ===== SEED COLLECTIONS =====
  seedCollections: {
    async seedDefaultCollections() {
      const collections = [
        { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest additions to our collection', type: 'automatic', isActive: true, displayOrder: 1 },
        { name: 'Best Sellers', slug: 'best-sellers', description: 'Our most popular products', type: 'automatic', isActive: true, displayOrder: 2 },
        { name: 'Trending Now', slug: 'trending-now', description: 'What everyone is talking about', type: 'automatic', isActive: true, displayOrder: 3 },
        { name: 'Limited Edition', slug: 'limited-edition', description: 'Exclusive pieces', type: 'automatic', isActive: true, displayOrder: 4 },
      ];
      for (const col of collections) {
        await Collection.findOneAndUpdate({ slug: col.slug }, col, { upsert: true });
      }
      return { success: true };
    },
  },

  // ===== SAMPLE TEMPLATES =====
  sampleTemplates: {
    async createSampleTemplates() {
      const count = await ReportTemplate.countDocuments({});
      if (count > 0) return { success: true, message: 'Templates already exist' };
      const templates = [
        { name: 'Sales Summary', description: 'Overview of sales performance', category: 'sales', type: 'summary', dataSource: 'orders', fields: [{ name: 'totalOrders', label: 'Total Orders', type: 'number', aggregation: 'count' }, { name: 'totalRevenue', label: 'Total Revenue', type: 'currency', aggregation: 'sum' }], filters: [{ name: 'dateRange', label: 'Date Range', type: 'date', required: true }], permissions: ['admin', 'super_admin'], isActive: true, createdBy: null, chartConfig: { type: 'bar', xAxis: 'date', yAxis: 'totalRevenue' } },
      ];
      for (const t of templates) {
        await ReportTemplate.create(t);
      }
      return { success: true };
    },
  },
};

export async function executeDataOperation({ table, operation, args = {}, authUser }) {
  await connectDB();
  const tableOps = operations[table];
  if (!tableOps) throw new Error(`Unknown table: ${table}`);
  const fn = tableOps[operation];
  if (!fn) throw new Error(`Unknown operation: ${table}.${operation}`);
  return fn(args);
}
