import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
    userId: number;
    name: string;
    role: string;
    action: string;
    module: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userId: {
            type: Number,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'staff', 'admin', 'super_admin'],
        },
        action: {
            type: String,
            required: true,
            enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'OTHER'],
        },
        module: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Index for efficient querying
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ module: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
