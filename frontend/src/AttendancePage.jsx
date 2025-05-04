import { useEffect, useState } from 'react'
import axios from 'axios'

function AttendancePage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [students, setStudents] = useState([])
  const [checked, setChecked] = useState({})
  const [message, setMessage] = useState('')

  // 載入課程清單
  useEffect(() => {
    axios.get('/courses')
      .then(res => setCourses(res.data))
  }, [])

  // 當選擇課程時，自動載入出席紀錄
  useEffect(() => {
    if (selectedCourseId) {
      axios.get(`/courses/${selectedCourseId}/attendance`)
        .then(res => {
          const initialChecked = {}
          res.data.forEach(student => {
            initialChecked[student.studentId] = student.status === 'present'
          })
          setStudents(res.data)
          setChecked(initialChecked)
        })
    }
  }, [selectedCourseId])

  const toggleCheckbox = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = () => {
    const presentStudentIds = Object.keys(checked)
      .filter(id => checked[id])
      .map(id => parseInt(id))

    axios.post(`/courses/${selectedCourseId}/attendance`, {
      presentStudentIds
    })
      .then(() => setMessage('✅ 點名成功！'))
      .catch(() => setMessage('❌ 點名失敗！'))
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📋 學生點名</h1>

      {/* 課程下拉選單 */}
      <div className="mb-6">
        <label className="block mb-1 font-semibold">選擇課程</label>
        <select
          value={selectedCourseId || ''}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="" disabled>請選擇課程</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.name} - {new Date(course.date).toLocaleDateString()} {course.time}
            </option>
          ))}
        </select>
      </div>

      {/* 學生清單 */}
      {students.length > 0 && students.map(s => (
        <div key={s.studentId} className="flex items-center justify-between border p-2 mb-2 rounded">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checked[s.studentId] || false}
              onChange={() => toggleCheckbox(s.studentId)}
              className="w-5 h-5"
            />
            <span>{s.name}（{s.studentNumber}）</span>
          </label>
          <span className="text-sm text-gray-500">剩餘堂數：{s.remainingHours}</span>
        </div>
      ))}

      {students.length > 0 && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
        >
          送出點名
        </button>
      )}

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
}

export default AttendancePage

