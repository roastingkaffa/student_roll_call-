import { useState } from 'react'
import axios from 'axios'

function AddTeacherPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/teachers', form)
      setMessage('✅ 老師新增成功')
      setForm({ name: '', email: '', phone: '', password: '' })
    } catch (err) {
      setMessage('❌ 新增失敗')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👨‍🏫 新增老師</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="姓名" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="email" placeholder="帳號（登入用）" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="phone" placeholder="聯絡電話" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="預設密碼" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">新增老師</button>
      </form>
      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  )
}

export default AddTeacherPage

