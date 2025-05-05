import { useEffect, useState } from 'react'
import axios from 'axios'

function CourseSummaryPage() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = () => {
    axios.get('/courses?_withTeacher=true')
      .then(res => setCourses(res.data))
  }

const handleDelete = async (id) => {
  if (!window.confirm('確定要刪除這門課程？')) return
  try {
    await axios.delete(`/courses/${id}`)
    fetchCourses()
  } catch (error) {
    alert('刪除失敗')
    console.error(error)
  }
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 課程總覽</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">課程名稱</th>
            <th className="border p-2">上課日期</th>
            <th className="border p-2">時間</th>
            <th className="border p-2">老師</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td className="border p-2">{course.name}</td>
              <td className="border p-2">{course.date}</td>
              <td className="border p-2">{course.time}</td>
              <td className="border p-2">{course.teacher?.name || '—'}</td>
              <td className="border p-2 text-center">
                <button onClick={() => handleDelete(course.id)} className="text-red-500 hover:underline">
                  🗑️ 刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CourseSummaryPage

