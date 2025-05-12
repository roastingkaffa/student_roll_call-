// AttendancePage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

function AttendancePage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('/courses?_withTeacher=true').then(res => setCourses(res.data))
    axios.get('/students').then(res => setStudents(res.data))
  }, [])

  const handleChangeStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSubmit = async () => {
    if (!selectedCourseId) return alert('請先選擇課程')

    const today = new Date().toISOString().split('T')[0] // e.g. "2025-05-04"

    const records = students.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || 'absent'
    }))

    try {
    const tody = new Date().toISOString()
      await axios.post(`/courses/${selectedCourseId}/attendance`, {
        date: today,
        records
      })
      setMessage('✅ 點名成功')
    } catch (err) {
      setMessage('❌ 發生錯誤')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">✅ 學生點名</h1>

      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">請選擇課程</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.name}（{course.date}）
          </option>
        ))}
      </select>

      <table className="w-full table-auto text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">姓名</th>
            <th className="border px-2 py-1">學號</th>
            <th className="border px-2 py-1">點名</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td className="border px-2 py-1">{s.name}</td>
              <td className="border px-2 py-1">{s.studentId}</td>
              <td className="border px-2 py-1">
                <label className="mr-4">
                  <input
                    type="radio"
                    name={`attendance-${s.id}`}
                    value="present"
                    checked={attendance[s.id] === 'present'}
                    onChange={() => handleChangeStatus(s.id, 'present')}
                  />{' '}到
                </label>
                <label>
                  <input
                    type="radio"
                    name={`attendance-${s.id}`}
                    value="absent"
                    checked={attendance[s.id] === 'absent' || !attendance[s.id]}
                    onChange={() => handleChangeStatus(s.id, 'absent')}
                  />{' '}缺
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded mt-4"
      >
        提交點名結果
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
}

export default AttendancePage

