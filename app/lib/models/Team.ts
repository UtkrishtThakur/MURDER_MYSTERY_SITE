import mongoose from "mongoose";

export interface ITeam extends mongoose.Document {
    username: string;
    progress: number;
    isDisqualified: boolean;
    lastAttempt?: Date;
}

const TeamSchema = new mongoose.Schema<ITeam>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    progress: {
        type: Number,
        default: 0, // 0 = task1 ready, 1 = task1 done/task2 ready, etc.
    },
    isDisqualified: {
        type: Boolean,
        default: false,
    },
    lastAttempt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

export const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
