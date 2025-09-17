import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AccessDenied from "./pages/Accessdenied";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";import PrivateRoute from "./components/PrivateRoute";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import TeacherTasks from "./pages/Teacher/TeacherTasks";
import StudentTasks from "./pages/Student/StudentTasks";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentAttendance from "./pages/Student/StudentAttendance";
import ParentDashboard from "./pages/Parent/ParentDashboard";
import UnitChapterManager from "./components/UnitChapterManager";
import SetPassword from "./pages/SetPassword";
import QuestionUpload from "./components/QuestionUpload";
import QuestionList from "./components/QuestionList";
import CreateQuiz from "./components/CreateQuiz";
import TeacherQuizList from "./components/TeacherQuizList";
import StudentQuizList from "./pages/Student/StudentQuizList";
import TakeQuiz from "./pages/Student/TakeQuiz";
import QuizResult from "./pages/Student/QuizResult";
import TeacherStudentPerformance from "./components/TeacherStudentPerformance";
import TeacherVideoManager from "./pages/Teacher/TeacherVideoManager";
import StudentVideoViewer from "./pages/Student/StudentVideoViewer";
import TeacherPDFManager from "./pages/Teacher/TeacherPDFManager";
import StudentMaterialViewer from "./pages/Student/StudentMaterialViewer";
import StudentPerformance from "./pages/Student/StudentPerformance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/manage-units" element={<UnitChapterManager />} />
        <Route path="/upload-question" element={<QuestionUpload />} />
        <Route path="/questions" element={<QuestionList />} />
        <Route path="/createquiz" element={<CreateQuiz />} />
        <Route path="/quizlist" element={<TeacherQuizList />} />
        <Route path="/student-quizzes" element={<StudentQuizList />} />
        <Route path="/student/take-quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/student/quiz-result/:quizId" element={<QuizResult />} />
        <Route path="/studentsperformance" element={<TeacherStudentPerformance />} />
        <Route path="/videomanager" element={<TeacherVideoManager />} />
        <Route path="/StudentVideoViewer" element={<StudentVideoViewer />} />
        <Route path="/PDFManager" element={<TeacherPDFManager />} />
        <Route path="/MaterialViewer" element={<StudentMaterialViewer />} />
        <Route path="/student-performance" element={<StudentPerformance />} />
        <Route path="/Accessdenied" element={<AccessDenied />} />



        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-tasks"
          element={
            <PrivateRoute>
              <TeacherTasks /> 
            </PrivateRoute>
          }
        />
        <Route
          path="/student-tasks"
          element={
            <PrivateRoute>
              <StudentTasks />   
            </PrivateRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-attendance"
          element={
            <PrivateRoute>
              <StudentAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/parent-dashboard"
          element={
            <PrivateRoute>
              <ParentDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
