import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import { Membership } from "../models/membership.js";
import { Discussion } from "../models/discussion.js";

const SAMPLE_COURSES = [
  { code: "COSC360", name: "Database Systems", description: "Learn about relational and NoSQL databases." },
  { code: "COSC221", name: "Data Structures", description: "Comprehensive study of data structures and algorithms." },
  { code: "COSC111", name: "Introduction to Programming", description: "Fundamentals of programming with Python." },
  { code: "MATH201", name: "Discrete Mathematics", description: "Sets, logic, proofs, and combinatorics." },
];

const SAMPLE_USERS = [
  {
    username: "alice_wang",
    email: "alice.wang@example.com",
    password: "SecurePass123",
    faculty: "Engineering",
    posts: 3,
    comments: 8,
  },
  {
    username: "bob_smith",
    email: "bob.smith@example.com",
    password: "BobPass456",
    faculty: "Science",
    posts: 2,
    comments: 5,
  },
  {
    username: "charlie_lee",
    email: "charlie.lee@example.com",
    password: "CharliePass789",
    faculty: "Engineering",
    posts: 5,
    comments: 12,
  },
  {
    username: "diana_jones",
    email: "diana.jones@example.com",
    password: "DianaPass101",
    faculty: "Science",
    posts: 1,
    comments: 3,
  },
];

const SAMPLE_DISCUSSIONS = [
  {
    courseCode: "COSC360",
    username: "alice_wang",
    title: "Best practices for database indexing",
    content: "What are your favorite strategies for optimizing database queries with proper indexing?",
  },
  {
    courseCode: "COSC360",
    username: "bob_smith",
    title: "Question about normalization",
    content: "Can someone explain the difference between 3NF and BCNF? I'm confused.",
  },
  {
    courseCode: "COSC221",
    username: "charlie_lee",
    title: "Red-Black Trees vs AVL Trees",
    content: "When should we use Red-Black trees over AVL trees in production systems?",
  },
  {
    courseCode: "COSC221",
    username: "alice_wang",
    title: "Help with Big O complexity",
    content: "I need clarification on calculating time complexity for nested loops.",
  },
  {
    courseCode: "COSC111",
    username: "diana_jones",
    title: "Python list comprehensions",
    content: "Can someone provide examples of list comprehensions with conditionals?",
  },
  {
    courseCode: "MATH201",
    username: "charlie_lee",
    title: "Combinatorics problem set discussion",
    content: "Anyone want to discuss the homework problems for this week?",
  },
];

export async function bootstrapSampleData() {
  if (mongoose.connection.readyState !== 1) {
    console.warn("Skipping sample data bootstrap: database is not connected.");
    return;
  }

  try {
    // Create sample courses
    const createdCourses = {};
    for (const course of SAMPLE_COURSES) {
      const existing = await Course.findOne({ code: course.code });
      if (!existing) {
        const newCourse = await Course.create(course);
        createdCourses[course.code] = newCourse._id;
      } else {
        createdCourses[course.code] = existing._id;
      }
    }

    // Create sample users
    const createdUsers = {};
    for (const user of SAMPLE_USERS) {
      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        const password = await bcrypt.hash(user.password, 10);
        const newUser = await User.create({
          username: user.username,
          email: user.email,
          password,
          faculty: user.faculty,
          posts: user.posts,
          comments: user.comments,
          isAdmin: false,
          enabled: true,
        });
        createdUsers[user.username] = newUser._id;
      } else {
        createdUsers[user.username] = existing._id;
      }
    }

    // Enroll users in courses (sample assignments)
    const enrollments = [
      { username: "alice_wang", courseCode: "COSC360" },
      { username: "alice_wang", courseCode: "COSC221" },
      { username: "bob_smith", courseCode: "COSC360" },
      { username: "charlie_lee", courseCode: "COSC360" },
      { username: "charlie_lee", courseCode: "COSC221" },
      { username: "charlie_lee", courseCode: "MATH201" },
      { username: "diana_jones", courseCode: "COSC111" },
      { username: "diana_jones", courseCode: "MATH201" },
    ];

    for (const enrollment of enrollments) {
      const userId = createdUsers[enrollment.username];
      const courseId = createdCourses[enrollment.courseCode];
      if (userId && courseId) {
        const existing = await Membership.findOne({ userId, courseId });
        if (!existing) {
          await Membership.create({
            userId,
            courseId,
            role: "student",
          });
        }
      }
    }

    // Create sample discussions
    for (const discussion of SAMPLE_DISCUSSIONS) {
      const authorId = createdUsers[discussion.username];
      const courseId = createdCourses[discussion.courseCode];
      if (authorId && courseId) {
        const existing = await Discussion.findOne({
          courseId,
          authorId,
          title: discussion.title,
        });
        if (!existing) {
          await Discussion.create({
            courseId,
            authorId,
            title: discussion.title,
            content: discussion.content,
            edited: false,
            upvotes: 0,
            downvotes: 0,
            replies: 0,
          });
        }
      }
    }

    console.log("Sample data bootstrap complete.");
  } catch (error) {
    console.error("Error bootstrapping sample data:", error.message);
  }
}
