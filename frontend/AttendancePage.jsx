import { useEffect, useState } from 'react'
import axios from 'axios'

function AttendancePage() {
  const courseId = 1 // ⚠️ 暫時寫死課程 ID，你可以未來改為選單
  const [students, setStudents] = useState([])
  const [checked, setChecked] = useState({}) // studentId: true/false
  const [message, setMessage] = useState('')

  // 🚀 載入學生清單（你可以替換成後端 API）
  useEffect(() => {
    // 範例：假資料（之後可以改成從後端抓學生清單）
    axios.get(`/courses/${courseId}/attendance`)
      .then(res => {
        const initialState = {}
        res.data.forEach(student => {
          initialState[student.studentId] = student.status === 'present'
        })
        setStudents(res.data)
        setChecked(initialState)
      })
  }, [])

  const toggleCheckbox = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = () => {
    const presentStudentIds = Object.keys(checked)
      .filter(id => checked[id])
      .map(id => parseInt(id))

    axios.post(`/courses/${courseId}/attendance`, {
      presentStudentIds
    })
      .then(() => setMessage('✅ 點名成功！'))
      .catch(() => setMessage('❌ 點名失敗！'))
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">📋 學生點名</h1>

      {students.map(s => (
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

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
      >
        送出點名
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  )
}

export default AttendancePage

