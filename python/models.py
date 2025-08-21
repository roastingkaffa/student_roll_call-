from sqlalchemy import (
    create_engine, Column, Integer, String, Date, Time,
    ForeignKey, Boolean, Table
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Student <-> Course 多對多關聯表
student_course_association = Table(
    'student_course_association', Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id'), primary_key=True),
    Column('course_id', Integer, ForeignKey('courses.id'), primary_key=True),
)

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    phone = Column(String)
    address = Column(String)
    registered_classes = Column(Integer, default=0)   # 報名堂數
    remaining_classes = Column(Integer, default=0)    # 剩餘堂數

    # 出勤記錄（刪學生時連動刪除）
    attendance_records = relationship(
        "AttendanceRecord",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    # 報名課程（多對多）
    courses = relationship(
        "Course",
        secondary=student_course_association,
        back_populates="students"
    )

class Teacher(Base):
    __tablename__ = 'teachers'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    phone = Column(String)
    address = Column(String)

    courses = relationship("Course", back_populates="teacher")

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    teacher_id = Column(Integer, ForeignKey('teachers.id'), nullable=False)

    # 一堂課多久、午休判斷用
    duration_minutes = Column(Integer, default=60)
    break_minutes = Column(Integer, default=10)

    teacher = relationship("Teacher", back_populates="courses")
    # 刪課程時，連動刪掉該課的所有排程
    schedules = relationship(
        "CourseSchedule",
        back_populates="course",
        cascade="all, delete-orphan"
    )
    # 報名學生（多對多）
    students = relationship(
        "Student",
        secondary=student_course_association,
        back_populates="courses"
    )

class CourseSchedule(Base):
    __tablename__ = 'course_schedules'
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    day_of_week = Column(String, nullable=False)  # 'MON'...'SUN'
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    course = relationship("Course", back_populates="schedules")
    # 刪掉這筆排程時，同日的出勤記錄也一併刪除
    attendance_records = relationship(
        "AttendanceRecord",
        back_populates="course_schedule",
        cascade="all, delete-orphan"
    )

class AttendanceRecord(Base):
    __tablename__ = 'attendance_records'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    course_schedule_id = Column(Integer, ForeignKey('course_schedules.id'), nullable=False)
    date = Column(Date, nullable=False)    # 點名日期
    status = Column(String, nullable=False)  # 有到/遲到/曠課
    class_deducted = Column(Boolean, default=False)

    student = relationship("Student", back_populates="attendance_records")
    course_schedule = relationship("CourseSchedule", back_populates="attendance_records")
