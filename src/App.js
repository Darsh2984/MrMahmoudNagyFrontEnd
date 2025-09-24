import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AccessDenied from "./pages/Accessdenied";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
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
import CompleteParentDetails from "./pages/CompleteParentDetails";
import TeacherAddAssistant from "./pages/Teacher/TeacherAddAssistant";
import AllStudentsData from "./pages/AllStudentsData";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* =================== General Routes =================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/AccessDenied" element={<AccessDenied />} />
        <Route path="/teacher/add-assistant" element={<TeacherAddAssistant />} />
        <Route path="/all-students" element={<AllStudentsData />} />



{/* =================== Student Only Routes =================== */}
        <Route path="/complete-parent/:studentId" element={<CompleteParentDetails />}/>
        <Route path="/student-quizzes" element={<StudentQuizList />}/>
        <Route
          path="/student/take-quiz/:quizId"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <TakeQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/quiz-result/:quizId"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <QuizResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/StudentVideoViewer"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentVideoViewer />
            </PrivateRoute>
          }
        />
        <Route
          path="/MaterialViewer"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentMaterialViewer />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-performance"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentPerformance />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-tasks"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentTasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
              <StudentDashboard />
          }
        />
        <Route
          path="/student-attendance"
          element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentAttendance />
            </PrivateRoute>
          }
        />



        {/* =================== Teacher Only Routes =================== */}
        <Route
          path="/manage-units"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <UnitChapterManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload-question"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <QuestionUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <QuestionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/createquiz"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <CreateQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/quizlist"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherQuizList />
            </PrivateRoute>
          }
        />
        <Route
          path="/studentsperformance"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherStudentPerformance />
            </PrivateRoute>
          }
        />
        <Route
          path="/videomanager"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherVideoManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/PDFManager"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherPDFManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-tasks"
          element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeacherTasks />
            </PrivateRoute>
          }
        />

        
        {/* =================== Parent Only Routes =================== */}
        <Route
          path="/parent-dashboard"
          element={
            <PrivateRoute allowedRoles={["parent"]}>
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
