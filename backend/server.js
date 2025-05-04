import express from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

// 測試用根目錄
app.get('/', (req, res) => {
  res.send('API is working ✅')
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
    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        phone,
        password,
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

// ✅ 學生點名：紀錄出席並自動扣堂數
app.post('/courses/:id/attendance', async (req, res) => {
  const courseId = parseInt(req.params.id, 10)
  const { presentStudentIds } = req.body  // 傳入出席學生的 ID 陣列

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // 取得所有學生（包含沒來的）
    const allStudents = await prisma.student.findMany()

    // 一一建立出席紀錄
    const attendancePromises = allStudents.map(async (student) => {
      const isPresent = presentStudentIds.includes(student.id)

      // 如果有到，先扣堂數
      if (isPresent && student.remainingHours > 0) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            remainingHours: { decrement: 1 },
          },
        })
      }

      return prisma.attendanceRecord.create({
        data: {
          courseId: courseId,
          studentId: student.id,
          status: isPresent ? 'present' : 'absent',
          updatedBy: 'teacher',
        },
      })
    })

    await Promise.all(attendancePromises)

    res.status(201).json({ message: 'Attendance recorded successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to record attendance' })
  }
})

// 📊 查詢某堂課的所有出席紀錄
app.get('/courses/:id/attendance', async (req, res) => {
  const courseId = parseInt(req.params.id, 10)

  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { courseId },
      include: {
        student: true,
      },
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

// ⬇️ 取得所有課程清單
app.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { date: 'desc' },
    })
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// ➕ 老師清單 GET
app.get('/teachers', async (req, res) => {
  const teachers = await prisma.teacher.findMany()
  res.json(teachers)
})

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

app.get('/students', async (req, res) => {
  const students = await prisma.student.findMany()
  res.json(students)
})

app.get('/courses/:id/summary', async (req, res) => {
  const courseId = parseInt(req.params.id)
  try {
    const records = await prisma.attendance.findMany({
      where: { courseId },
      include: {
        student: true
      }
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

app.delete('/students/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.attendance.deleteMany({ where: { studentId: id } }) // 刪掉該學生出席紀錄
    await prisma.student.delete({ where: { id } }) // 刪掉學生
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '刪除失敗' })
  }
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

