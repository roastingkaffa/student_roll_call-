// App.jsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import AttendancePage from './AttendancePage'
import AddStudentPage from './AddStudentPage'
import AddCoursePage from './AddCoursePage'
import AttendanceReportPage from './AttendanceReportPage'
import StudentListPage from './StudentListPage'
import CourseListPage from './CourseListPage'
import CourseSummaryPage from './CourseSummaryPage'
import AddTeacherPage from './AddTeacherPage'
import TeacherListPage from './TeacherListPage'
import LoginPage from './LoginPage'
import LogoutButton from './LogoutButton'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const teacher = localStorage.getItem('teacher')
    setLoggedIn(!!teacher)
  }, [])

  return (
    <Router>
      {loggedIn ? (
        <div className="flex min-h-screen">
          {/* 側邊選單 */}
          <aside className="w-64 bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold mb-6">學生點名系統</h2>
            <nav className="flex flex-col gap-4">
              <Link to="/students" className="hover:text-yellow-300">➕ 新增學生</Link>
              <Link to="/courses" className="hover:text-yellow-300">➕ 新增課程</Link>
              <Link to="/teachers/add" className="hover:text-yellow-300">➕ 新增老師</Link>
              <Link to="/attendance" className="hover:text-yellow-300">✅ 學生點名</Link>
              <Link to="/report" className="hover:text-yellow-300">📊 點名紀錄查詢</Link>
              <Link to="/students/list" className="hover:text-yellow-300">📋 學生總覽</Link>
              <Link to="/teachers/list" className="hover:text-yellow-300">📋 老師總覽</Link>
              <Link to="/courses/summary" className="hover:text-yellow-300">📚 課程總覽</Link>
              <Link to="/courses/list" className="hover:text-yellow-300">📈 課程統計</Link>
              <LogoutButton />
            </nav>
          </aside>

          <main className="flex-1 bg-white p-8">
            <Routes>
              <Route path="/students" element={<AddStudentPage />} />
              <Route path="/courses" element={<AddCoursePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/report" element={<AttendanceReportPage />} />
              <Route path="/students/list" element={<StudentListPage />} />
              <Route path="/courses/list" element={<CourseListPage />} />
              <Route path="/courses/summary" element={<CourseSummaryPage />} />
              <Route path="/teachers/add" element={<AddTeacherPage />} />
              <Route path="/teachers/list" element={<TeacherListPage />} />
              <Route path="*" element={<Navigate to="/courses/summary" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/*" element={<LoginPage />} />
        </Routes>
      )}
    </Router>
  )
}

export default App

