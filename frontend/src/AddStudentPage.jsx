import { useState } from 'react'
import axios from 'axios'

function AddStudentPage() {
  const [form, setForm] = useState({
    name: '',
    studentId: '',
    phone: '',
    address: '',
    remainingHours: 10
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    axios.post('/students', {
      ...form,
      remainingHours: parseInt(form.remainingHours, 10),
    })
      .then(() => setMessage('✅ 學生新增成功'))
      .catch(() => setMessage('❌ 發生錯誤'))
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">➕ 新增學生</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="姓名" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="studentId" placeholder="學號" value={form.studentId} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="phone" placeholder="電話" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="address" placeholder="地址" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="remainingHours" type="number" placeholder="剩餘堂數" value={form.remainingHours} onChange={handleChange} className="w-full border p-2 rounded" />
        
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">新增</button>
      </form>

      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  )
}

export default AddStudentPage

