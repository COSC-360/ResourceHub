import mongoose from "mongoose";

/*
Represents a vote on a discussion, linking a user to a discussion and indicating whether it's an upvote or downvote. 
It includes properties like:
    userId: The ID of the user who cast the vote
    targetType: The type of the target being voted on (e.g., 'resource', 'discussion')
    targetId: The ID of the target being voted on
    value: The value of the vote (1 for upvote, -1 for downvote)
*/

const VoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Resource", "Discussion"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    value: { type: Number, enum: [1, -1], required: true }, // 1 for upvote, -1 for downvote
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

// Ensure a user can only vote once per target
VoteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", VoteSchema);
