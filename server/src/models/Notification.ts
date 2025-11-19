import mongoose, { Schema, Document } from 'mongoose';


export interface INotification extends Document {
  title: string;
  message: string;
  type: 'meeting' | 'message' | 'reminder' | 'update' | 'general';
  userId: mongoose.Types.ObjectId;
  read: boolean;
  data?: any;
  image?: string;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['meeting', 'message', 'reminder', 'update', 'general'],
      default: 'general' 
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    data: Schema.Types.Mixed,
    image: String,
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);