const mongoose = require('mongoose');
const path = require('path');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tariffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tariff',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  interviews: {
    type: Number,
    required: true,
    min: 1,
  },
  provider: {
    type: String,
    enum: ['manual', 'payme', 'click'],
    default: 'manual',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },
  receiptPath: {
    type: String,
    default: null,
  },
  receiptFileName: {
    type: String,
    default: null,
  },
  adminNote: {
    type: String,
    default: null,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  // Payme (Paycom) transaction meta
  paymeTransactionId: {
    type: String,
    default: null,
    index: true,
  },
  paymeState: {
    type: Number,
    default: null,
  },
  paymeCreateTime: {
    type: Number,
    default: null,
  },
  paymePerformTime: {
    type: Number,
    default: null,
  },
  paymeCancelTime: {
    type: Number,
    default: null,
  },
  paymeReason: {
    type: Number,
    default: null,
  },
  paymeAccount: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  // Click transaction meta
  clickTransactionId: {
    type: String,
    default: null,
    index: true,
  },
  clickPrepareId: {
    type: Number,
    default: null,
  },
  clickStatus: {
    type: Number,
    default: null,
  },
  clickCreateTime: {
    type: Number,
    default: null,
  },
  clickCompleteTime: {
    type: Number,
    default: null,
  },
  clickAccount: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
