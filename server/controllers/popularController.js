import * as popularService from "../services/popularService.js";

export function getPopularCourses(req, res) {
 
    const courses = popularService.getPopularCourses(req.userId);
    res.json({ data: courses });

  }


export function savePopularCourses(req, res) {
    const { courses } = req.body;

    const result = popularService.savePopularCourses(req.userId, courses);
    res.json({ data: result });
}   

export function updatePopularCourses(req, res) {
     const { courses } = req.body;

    const result = popularService.updatePopularCourses(req.userId, courses);
    res.json({ data: result });
  }

export function hidePopularCourses(req, res) {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(400).json({ error: "Course ID is required" });
      return;
    }

    const result = popularService.hidePopularCourses(req.userId, courseId);
    res.json({ data: result });
}