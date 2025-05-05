// LoginPage.jsx
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/login', form)
      localStorage.setItem('teacher', JSON.stringify(res.data))
      navigate('/dashboard') // or redirect to attendance/check-in
    } catch (err) {
      setError('登入失敗，請確認帳號密碼')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 老師登入</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="text"
          placeholder="帳號"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="密碼"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">登入</button>
      </form>
    </div>
  )
}

export default LoginPage

// server.js 後端登入 API 加入這段
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const teacher = await prisma.teacher.findUnique({ where: { email } })
    if (!teacher || teacher.password !== password) {
      return res.status(401).json({ error: '帳號或密碼錯誤' })
    }
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email })
  } catch (err) {
    console.error('登入失敗:', err)
    res.status(500).json({ error: '登入錯誤' })
  }
})

