import { useState, useEffect } from 'react'
import axios from 'axios'

function AddCoursePage() {
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    teacherId: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('/teachers') // 你需要後端有這個 API
      .then(res => setTeachers(res.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    axios.post('/courses', {
      ...form,
      teacherId: parseInt(form.teacherId, 10),
    })
      .then(() => setMessage('✅ 課程新增成功'))
      .catch(() => setMessage('❌ 發生錯誤'))
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">➕ 新增課程</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="課程名稱" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="time" type="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded" />

        <select name="teacherId" value={form.teacherId} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">請選擇老師</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">新增</button>
      </form>

      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  )
}

export default AddCoursePage
