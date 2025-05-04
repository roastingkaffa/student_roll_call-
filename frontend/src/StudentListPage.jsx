import { useEffect, useState } from 'react'
import axios from 'axios'

function StudentListPage() {
  const [students, setStudents] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', remainingHours: 0 })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = () => {
    axios.get('/students')
      .then(res => setStudents(res.data))
  }

  const startEdit = (student) => {
    setEditingId(student.id)
    setEditForm({ name: student.name, phone: student.phone, remainingHours: student.remainingHours })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', phone: '', remainingHours: 0 })
  }

  const saveEdit = () => {
    axios.put(`/students/${editingId}`, editForm)
      .then(() => {
        fetchStudents()
        cancelEdit()
      })
  }

  const handleDelete = (id) => {
   if (!window.confirm('確定要刪除這位學生嗎？')) return
   axios.delete(`/students/${id}`)
     .then(() => fetchStudents())
 }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: name === 'remainingHours' ? parseInt(value, 10) : value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📋 學生總覽</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">姓名</th>
            <th className="border px-3 py-2">學號</th>
            <th className="border px-3 py-2">電話</th>
            <th className="border px-3 py-2">剩餘堂數</th>
            <th className="border px-3 py-2">地址</th>
            <th className="border px-3 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td className="border px-3 py-2">
                {editingId === s.id ? (
                  <input name="name" value={editForm.name} onChange={handleChange} className="border px-1" />
                ) : s.name}
              </td>
              <td className="border px-3 py-2">{s.studentId}</td>
              <td className="border px-3 py-2">
                {editingId === s.id ? (
                  <input name="phone" value={editForm.phone} onChange={handleChange} className="border px-1" />
                ) : s.phone}
              </td>
              <td className="border px-3 py-2">
                {editingId === s.id ? (
                  <input name="remainingHours" type="number" value={editForm.remainingHours} onChange={handleChange} className="border px-1 w-16" />
                ) : s.remainingHours}
              </td>
              <td className="border px-3 py-2">{s.address || '-'}</td>
              <td className="border px-3 py-2">
                {editingId === s.id ? (
                  <>
                    <button onClick={saveEdit} className="text-green-600 mr-2">💾 儲存</button>
                    <button onClick={cancelEdit} className="text-gray-500">取消</button>
		    <button onClick={() => handleDelete(s.id)} className="text-red-600">🗑️ 刪除</button>
                  </>
                ) : (
		<>
	  	   <button onClick={() => startEdit(s)} className="text-blue-600 mr-2">✏️ 編輯</button>
  		   <button onClick={() => handleDelete(s.id)} className="text-red-600">🗑️ 刪除</button>
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

export default StudentListPage

