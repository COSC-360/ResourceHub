import * as membershipService from "../services/membershipService.js";

export async function getMyStatus(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const result = await membershipService.getMyMembershipStatus(userId, courseId);
    return res.status(200).json({
      isMember: result.isMember,
      role: result.membership?.role ?? null,
    });
  } catch (error) {
    if (error.message.startsWith("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function join(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const result = await membershipService.joinCourse(userId, courseId);

    return res.status(result.alreadyMember ? 200 : 201).json({
      isMember: true,
      memberCount: result.memberCount,
      message: result.alreadyMember ? "Already joined" : "Joined course",
    });
  } catch (error) {
    if (error.message.startsWith("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function leave(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const result = await membershipService.leaveCourse(userId, courseId);

    return res.status(200).json({
      isMember: false,
      memberCount: result.memberCount,
      message: result.removed ? "Left course" : "Not enrolled",
    });
  } catch (error) {
    if (error.message.startsWith("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

export async function getMyCourseIds(req, res) {
  try {
    const userId = req.user.id;
    const ids = await membershipService.getMyCourseIds(userId);
    return res.status(200).json({ data: ids });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMyCourses(req, res) {
  try {
    const userId = req.user.id;
    const courses = await membershipService.getMyCourses(userId);
    return res.status(200).json({ data: courses });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}