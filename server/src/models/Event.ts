import mongoose, { Schema, Document } from 'mongoose';


export interface IEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  time: string;
  location?: string;
  image?: string;
  createdBy: mongoose.Types.ObjectId;
  attendees?: mongoose.Types.ObjectId[];
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: String,
    image: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
