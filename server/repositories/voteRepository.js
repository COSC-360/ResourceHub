import { Vote } from "../models/vote";

export const VoteRepository = {
  async save(vote) {
    return await vote.save();
  },

  async findById(id) {
    return await Vote.findById(id);
  },

  async findAll() {
    return await Vote.find().sort({ timestamp: -1 });
  },

  async findByUserId(userid) {
    return await Vote.find({ userId: userid }).sort({ timestamp: -1 });
  },

  async findByType(type) {
    return await Vote.find({ targetType: type }).sort({
      timestamp: -1,
    });
  },

  async findByTargetId(id) {
    return await Vote.find({ targetId: id }).sort({ timestamp: -1 });
  },

  async update(id, fields) {
    return await Vote.findByIdAndUpdate(id, fields, { new: true });
  },

  async delete(id) {
    return await Vote.findByIdAndDelete(id);
  },

  async deleteByFields(fields) {
    return await Vote.deleteOne(fields);
  },

  async deleteManyByTargetId(targetid) {
    return await Vote.deleteMany({ targetId: targetid });
  },

  async getLatest({ limit = 10, page = 1 } = {}) {
    const offset = (page - 1) * limit;

    return Vote.find().sort({ timestamp: -1 }).skip(offset).limit(limit).lean();
  },
};

export default VoteRepository;
