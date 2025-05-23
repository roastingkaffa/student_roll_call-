import express from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

// 測試用根目錄
app.get('/', (req, res) => {
  res.send('API is working ✅')
})

// ✅ 登入 API：用 email + password 驗證
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    })

    if (!teacher || teacher.password !== hashedPassword) {
      return res.status(401).json({ error: '帳號或密碼錯誤' })
    }

    res.json({ id: teacher.id, name: teacher.name, email: teacher.email })
  } catch (error) {
    console.error('登入失敗:', error)
    res.status(500).json({ error: '登入失敗' })
  }
})

// ✅ 新增學生 API
app.post('/students', async (req, res) => {
  const { name, studentId, phone, address, remainingHours } = req.body

  try {
    const newStudent = await prisma.student.create({
      data: {
        name,
        studentId,
        phone,
        address,
        remainingHours: parseInt(remainingHours, 10),
      },
    })
    res.status(201).json(newStudent)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create student' })
  }
})

// ✅ 新增老師 API
app.post('/teachers', async (req, res) => {
  const { name, email, phone, password } = req.body

  try {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    })
    res.status(201).json(newTeacher)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create teacher' })
  }
})

// ✅ 新增課程 API
app.post('/courses', async (req, res) => {
  const { name, date, time, teacherId } = req.body

  try {
    const newCourse = await prisma.course.create({
      data: {
        name,
        date: new Date(date),
        time,
        teacher: {
          connect: { id: parseInt(teacherId, 10) },
        },
      },
    })
    res.status(201).json(newCourse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// ✅ 學生點名功能（無 date 欄位）
// 學生點名：建立紀錄並扣課
app.post('/courses/:id/attendance', async (req, res) => {
  const courseId = parseInt(req.params.id, 10)
  const { records, date } = req.body  // 👈 要有 date 傳進來

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const promises = records.map(async ({ studentId, status }) => {
      if (status === 'present') {
        await prisma.student.update({
          where: { id: studentId },
          data: { remainingHours: { decrement: 1 } },
        })
      }

      return prisma.attendanceRecord.create({
        data: {
          courseId,
          studentId,
          status,
          updatedBy: 'teacher',
          date: new Date(date),  // 👈 如果這一行沒傳到正確 date，就會錯
        },
      })
    })

    await Promise.all(promises)
    res.status(201).json({ message: '出席紀錄已更新' })
  } catch (error) {
    console.error('點名失敗:', error)
    res.status(500).json({ error: 'Failed to record attendance' })
  }
})

// 📊 查詢某堂課的所有出席紀錄
app.get('/courses/:id/attendance', async (req, res) => {
  const courseId = parseInt(req.params.id, 10)

  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { courseId },
      include: { student: true },
    })

    const result = records.map((record) => ({
      studentId: record.student.id,
      name: record.student.name,
      studentNumber: record.student.studentId,
      phone: record.student.phone,
      remainingHours: record.student.remainingHours,
      status: record.status,
      updatedAt: record.updatedAt,
    }))

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch attendance records' })
  }
})

// ➕ 老師清單 GET
app.get('/teachers', async (req, res) => {
  const teachers = await prisma.teacher.findMany()
  res.json(teachers)
})

// ⬇️ 所有課程清單
app.get('/courses', async (req, res) => {
  try {
    const withTeacher = req.query._withTeacher === 'true'
    const courses = await prisma.course.findMany({
      orderBy: { date: 'desc' },
      include: withTeacher ? { teacher: true } : undefined,
    })
    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// ✅ 更新學生資訊
app.put('/students/:id', async (req, res) => {
  const { id } = req.params
  const { name, phone, remainingHours } = req.body
  try {
    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { name, phone, remainingHours }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: '更新失敗' })
  }
})

// ✅ 學生總覽
app.get('/students', async (req, res) => {
  const students = await prisma.student.findMany()
  res.json(students)
})

// ✅ 課程統計（查詢某課程點名狀態）
app.get('/courses/:id/summary', async (req, res) => {
  const courseId = parseInt(req.params.id)
  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { courseId },
      include: { student: true }
    })

    const summary = records.map(r => ({
      name: r.student.name,
      studentNumber: r.student.studentId,
      status: r.status,
      remainingHours: r.student.remainingHours
    }))

    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: '無法取得統計資料' })
  }
})

// ❌ 刪除學生
app.delete('/students/:id', async (req, res) => {
  try {
    await prisma.student.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('刪除學生失敗:', error)
    res.status(500).json({ error: '刪除失敗' })
  }
})

// ❌ 刪除老師
app.delete('/teachers/:id', async (req, res) => {
  try {
    await prisma.teacher.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('刪除老師失敗:', error)
    res.status(500).json({ error: '刪除失敗' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

