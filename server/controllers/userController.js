import * as userService from "../services/userService.js"

export function getUserById(req, res) {
    const id = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
        res.status(400).json({ error: "Id is required" });
        return;
    }

    const user = userService.getUserById(id.trim());
    res.json({ data: user });
}

export function updateProfile(req, res) {
    const id = req.body.id;
    const body = req.body.data;

    if(id || typeof id !== "string" || !id.trim()){
        res.status(400).json({ error: "Id is required" });
        return;
    }

    const user = userService.updateProfile(id, body);
    res.json({ data: user });
}

export function getUserCourses(userId) {
  const savedCourses = userService.getUserCourses(userId);

  if (savedCourses.length > 0) {
    return savedCourses;
  }

  return userService.findMostPopularCourses();
}

export function saveUserCourses(req, res) {
    const { courses } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    } 
    const result = userService.saveUserCourses(req.userId, courses);
    res.json({ data: result });
}   


export function updateUserCourses(req, res) {
    const { courses } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    } 
    const result = userService.updateUserCourses(req.userId, courses);
    res.json({ data: result });
  }

export function hideUserCourses(req, res) {
    const { courseId } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    }
    if (!courseId) {
      res.status(400).json({ error: "Course ID is required" });
      return;
    }

    const result = userService.hideUserCourses(req.userId, courseId);
    res.json({ data: result });
}