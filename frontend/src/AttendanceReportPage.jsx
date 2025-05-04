import { useEffect, useState } from 'react'
import axios from 'axios'

function AttendanceReportPage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [records, setRecords] = useState([])

  useEffect(() => {
    axios.get('/courses')
      .then(res => setCourses(res.data))
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      axios.get(`/courses/${selectedCourseId}/attendance`)
        .then(res => setRecords(res.data))
    }
  }, [selectedCourseId])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📊 點名紀錄查詢</h1>

      {/* 下拉選擇課程 */}
      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="border p-2 rounded mb-6 w-full"
      >
        <option value="">請選擇課程</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>
            {c.name} - {new Date(c.date).toLocaleDateString()} {c.time}
          </option>
        ))}
      </select>

      {/* 顯示出席紀錄 */}
      {records.length > 0 && (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">姓名</th>
              <th className="border px-4 py-2">學號</th>
              <th className="border px-4 py-2">出席狀態</th>
              <th className="border px-4 py-2">剩餘堂數</th>
              <th className="border px-4 py-2">更新時間</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.studentId}>
                <td className="border px-4 py-2">{r.name}</td>
                <td className="border px-4 py-2">{r.studentNumber}</td>
                <td className="border px-4 py-2">
                  {r.status === 'present' ? '✅ 到' : '❌ 缺席'}
                </td>
                <td className="border px-4 py-2">{r.remainingHours}</td>
                <td className="border px-4 py-2">
                  {new Date(r.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AttendanceReportPage

