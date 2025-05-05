import { useEffect, useState } from 'react'
import axios from 'axios'

function TeacherListPage() {
  const [teachers, setTeachers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', password: '' })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = () => {
    axios.get('/teachers')
      .then(res => setTeachers(res.data))
  }

  const startEdit = (teacher) => {
    setEditingId(teacher.id)
    setEditForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      password: teacher.password
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', email: '', phone: '', password: '' })
  }

  const saveEdit = () => {
    axios.put(`/teachers/${editingId}`, editForm)
      .then(() => {
        fetchTeachers()
        cancelEdit()
      })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

const handleDelete = async (id) => {
  if (!window.confirm('確定要刪除這位老師？')) return
  await axios.delete(`/teachers/${id}`)
  fetchTeachers() // 重新抓資料
}

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👨‍🏫 老師總覽</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">姓名</th>
            <th className="border px-3 py-2">帳號</th>
            <th className="border px-3 py-2">電話</th>
            <th className="border px-3 py-2">密碼</th>
            <th className="border px-3 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr key={t.id}>
              <td className="border px-3 py-2">
                {editingId === t.id ? (
                  <input name="name" value={editForm.name} onChange={handleChange} className="border px-1" />
                ) : t.name}
              </td>
              <td className="border px-3 py-2">
                {editingId === t.id ? (
                  <input name="email" value={editForm.email} onChange={handleChange} className="border px-1" />
                ) : t.email}
              </td>
              <td className="border px-3 py-2">
                {editingId === t.id ? (
                  <input name="phone" value={editForm.phone} onChange={handleChange} className="border px-1" />
                ) : t.phone}
              </td>
              <td className="border px-3 py-2">
                {editingId === t.id ? (
                  <input name="password" value={editForm.password} onChange={handleChange} className="border px-1" />
                ) : '••••••••'}
              </td>
              <td className="border px-3 py-2">
                {editingId === t.id ? (
                  <>
                    <button onClick={saveEdit} className="text-green-600 mr-2">💾 儲存</button>
                    <button onClick={cancelEdit} className="text-gray-500">取消</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(t)} className="text-blue-600 mr-2">✏️ 編輯</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600">🗑️ 刪除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TeacherListPage

