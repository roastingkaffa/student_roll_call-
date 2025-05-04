import { useEffect, useState } from 'react'
import axios from 'axios'

function CourseListPage() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    axios.get('/courses?_withTeacher=true')
      .then(res => setCourses(res.data))
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📚 課程清單總覽</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">課程名稱</th>
            <th className="border px-3 py-2">日期</th>
            <th className="border px-3 py-2">時間</th>
            <th className="border px-3 py-2">授課老師</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id}>
              <td className="border px-3 py-2">{c.name}</td>
              <td className="border px-3 py-2">{new Date(c.date).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{c.time}</td>
              <td className="border px-3 py-2">{c.teacher?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CourseListPage

