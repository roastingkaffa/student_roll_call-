from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, joinedload
from datetime import date, time, timedelta, datetime
from sqlalchemy.orm.exc import NoResultFound
import pandas as pd
import pathlib, os

from models import (
    Base, Student, Teacher, Course, CourseSchedule, AttendanceRecord,
    student_course_association
)

# 以檔案所在資料夾為基準，避免不同工作目錄造成多顆 DB
BASE_DIR = pathlib.Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "attendance.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

class AttendanceService:
    def __init__(self, db_url: str = DATABASE_URL):
        self.engine = create_engine(db_url, future=True)
        Base.metadata.create_all(self.engine)  # 首次自動建表
        self.Session = sessionmaker(bind=self.engine, future=True)

    def _get_session(self):
        return self.Session()

    # ---------- 1) 學生 ----------
    def add_student(self, name, phone, address, registered_classes=0):
        session = self._get_session()
        try:
            obj = Student(
                name=name, phone=phone, address=address,
                registered_classes=registered_classes,
                remaining_classes=registered_classes
            )
            session.add(obj)
            session.commit()
            return obj
        except Exception:
            session.rollback()
            return None
        finally:
            session.close()

    def get_all_students(self):
        session = self._get_session()
        try:
            return session.query(Student).order_by(Student.id).all()
        finally:
            session.close()

    def get_student_by_id(self, student_id: int):
        session = self._get_session()
        try:
            return session.query(Student).get(student_id)
        finally:
            session.close()

    def add_classes_to_student(self, student_id: int, num_classes: int):
        session = self._get_session()
        try:
            s = session.query(Student).get(student_id)
            if not s:
                return False
            s.registered_classes += num_classes
            s.remaining_classes += num_classes
            session.commit()
            return True
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    def delete_student(self, student_id: int):
        session = self._get_session()
        try:
            s = session.query(Student).get(student_id)
            if not s:
                return False
            session.delete(s)
            session.commit()
            return True
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    # ---------- 2) 老師 ----------
    def add_teacher(self, name, phone, address):
        session = self._get_session()
        try:
            obj = Teacher(name=name, phone=phone, address=address)
            session.add(obj)
            session.commit()
            return obj
        except Exception:
            session.rollback()
            return None
        finally:
            session.close()

    def get_all_teachers(self):
        session = self._get_session()
        try:
            return session.query(Teacher).order_by(Teacher.id).all()
        finally:
            session.close()

    def delete_teacher(self, teacher_id: int):
        session = self._get_session()
        try:
            t = session.query(Teacher).options(joinedload(Teacher.courses)).get(teacher_id)
            if not t:
                return False, "找不到指定的老師。"
            if t.courses:
                return False, f"無法刪除，該老師仍有 {len(t.courses)} 門課程。"
            session.delete(t)
            session.commit()
            return True, ""
        except Exception as e:
            session.rollback()
            return False, str(e)
        finally:
            session.close()

    # ---------- 3) 課程與排程 ----------
    def add_course(self, name, teacher_id, duration_minutes=60, break_minutes=10):
        session = self._get_session()
        try:
            if not session.query(Teacher).get(teacher_id):
                return None
            obj = Course(
                name=name, teacher_id=teacher_id,
                duration_minutes=duration_minutes, break_minutes=break_minutes
            )
            session.add(obj)
            session.commit()
            return obj
        except Exception:
            session.rollback()
            return None
        finally:
            session.close()

    def get_all_courses_with_schedules(self):
        session = self._get_session()
        try:
            return (session.query(Course)
                    .options(joinedload(Course.teacher), joinedload(Course.schedules))
                    .all())
        finally:
            session.close()

    def add_course_schedule(self, course_id: int, day_of_week: str, start_time_str: str):
        session = self._get_session()
        try:
            course = session.query(Course).get(course_id)
            if not course:
                return None
            start_time = datetime.strptime(start_time_str, "%H:%M").time()
            end_time = (datetime.combine(date.min, start_time)
                        + timedelta(minutes=course.duration_minutes)).time()

            # 午休 12:10~13:00 不可上課
            lunch_start, lunch_end = time(12, 10), time(13, 0)
            if not (end_time <= lunch_start or start_time >= lunch_end):
                return None

            obj = CourseSchedule(
                course_id=course_id,
                day_of_week=day_of_week.upper(),
                start_time=start_time,
                end_time=end_time
            )
            session.add(obj)
            session.commit()
            return obj
        except Exception:
            session.rollback()
            return None
        finally:
            session.close()

    def delete_course(self, course_id: int):
        session = self._get_session()
        try:
            c = session.query(Course).get(course_id)
            if not c:
                return False
            session.delete(c)
            session.commit()
            return True
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    def get_course_schedule_by_id(self, schedule_id: int):
        session = self._get_session()
        try:
            return (session.query(CourseSchedule)
                    .options(joinedload(CourseSchedule.course).joinedload(Course.teacher))
                    .get(schedule_id))
        finally:
            session.close()

    # ---------- 4) 依日期範圍列出「實際上課 Occurrence」 ----------
    def get_courses_for_period(self, start_date: date, end_date: date):
        session = self._get_session()
        try:
            schedules = (session.query(CourseSchedule)
                         .options(joinedload(CourseSchedule.course).joinedload(Course.teacher))

                         .all())
            day_map = {0: 'MON', 1: 'TUE', 2: 'WED', 3: 'THU', 4: 'FRI', 5: 'SAT', 6: 'SUN'}

            occ = []
            d = start_date
            while d <= end_date:
                day_name = day_map[d.weekday()]
                for s in schedules:
                    if s.day_of_week == day_name:
                        occ.append({
                            "date": d,
                            "course_id": s.course.id,
                            "schedule_id": s.id,
                            "course_name": s.course.name,
                            "teacher_name": s.course.teacher.name,
                            "start_time": s.start_time,
                            "end_time": s.end_time

                        })
                d += timedelta(days=1)
            return sorted(occ, key=lambda x: (x["date"], x["start_time"]))
        finally:
            session.close()

    # ---------- 5) 報名名單 ----------
    def get_students_for_course(self, course_id: int):
        session = self._get_session()
        try:
            cid = int(course_id)
            q = (session.query(Student)
                 .join(student_course_association, Student.id == student_course_association.c.student_id)
                 .filter(student_course_association.c.course_id == cid)
                 .order_by(Student.name))
            return q.all()
        finally:
            session.close()

    def get_students_not_in_course(self, course_id: int):
        session = self._get_session()
        try:
            cid = int(course_id)
            rows = (session.query(student_course_association.c.student_id)
                    .filter(student_course_association.c.course_id == cid).all())
            enrolled_ids = [r[0] for r in rows]
            q = session.query(Student).order_by(Student.name)
            if enrolled_ids:
                q = q.filter(~Student.id.in_(enrolled_ids))
            return q.all()     # 沒人報名 => 全體學生皆屬「未報名」
        finally:
            session.close()

    def update_course_enrollments(self, course_id: int, student_ids: list[int]) -> bool:
        session = self._get_session()
        try:
            cid = int(course_id)
            if not session.query(Course).get(cid):
                return False
            # 先清空
            session.execute(
                student_course_association.delete()
                .where(student_course_association.c.course_id == cid)
            )
            # 再新增
            to_add = list({int(sid) for sid in (student_ids or [])})
            if to_add:
                session.execute(
                    student_course_association.insert(),
                    [{"student_id": sid, "course_id": cid} for sid in to_add]
                )
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print("更新報名名單失敗：", e)
            return False
        finally:
            session.close()

    # ---------- 6) 點名 ----------
    def take_attendance(self, course_schedule_id: int, attendance_date: date, student_statuses: dict[int, str]):
        session = self._get_session()
        try:
            schedule = session.query(CourseSchedule).get(course_schedule_id)
            if not schedule:
                return False

            for sid, status in (student_statuses or {}).items():
                stu = session.query(Student).get(sid)
                if not stu:
                    continue

                exists = (session.query(AttendanceRecord)
                          .filter_by(student_id=sid,
                                     course_schedule_id=course_schedule_id,
                                     date=attendance_date)
                          .first())
                if exists:
                    continue

                deducted = False
                if status in ("有到", "遲到"):
                    if stu.remaining_classes > 0:
                        stu.remaining_classes -= 1
                        deducted = True

                rec = AttendanceRecord(
                    student_id=sid, course_schedule_id=course_schedule_id,
                    date=attendance_date, status=status, class_deducted=deducted
                )
                session.add(rec)

            session.commit()
            return True
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    # ---------- 7) 查詢 / 報表 ----------
    def get_student_attendance(self, student_identifier):
        session = self._get_session()
        try:
            if isinstance(student_identifier, int):
                stu = session.query(Student).get(student_identifier)
            else:
                stu = (session.query(Student)
                       .filter(func.lower(Student.name) == func.lower(student_identifier))
                       .first())
            if not stu:
                return None, []

            records = (session.query(AttendanceRecord)
                       .options(joinedload(AttendanceRecord.course_schedule)
                                .joinedload(CourseSchedule.course))
                       .filter(AttendanceRecord.student_id == stu.id)
                       .order_by(AttendanceRecord.date.desc())
                       .all())
            return stu, records
        finally:
            session.close()

    def get_monthly_attendance_report(self, year: int, month: int):
        session = self._get_session()
        try:
            start_date = date(year, month, 1)
            end_date = (start_date + timedelta(days=31)).replace(day=1) - timedelta(days=1)
            rows = (session.query(
                        AttendanceRecord.date,
                        Student.name.label('student_name'),
                        Course.name.label('course_name'),
                        CourseSchedule.start_time.label('start_time'),
                        CourseSchedule.end_time.label('end_time'),
                        Teacher.name.label('teacher_name'),
                        AttendanceRecord.status
                    )
                    .join(Student, AttendanceRecord.student_id == Student.id)
                    .join(CourseSchedule, AttendanceRecord.course_schedule_id == CourseSchedule.id)
                    .join(Course, CourseSchedule.course_id == Course.id)
                    .join(Teacher, Course.teacher_id == Teacher.id)

                    .filter(AttendanceRecord.date.between(start_date, end_date))
                    .order_by(AttendanceRecord.date, Student.name)
                    .all())
            return rows
        finally:
            session.close()

    def export_report_to_excel(self, records, year: int, month: int):
        if not records:
            return None

        # Convert records to list of dict including remaining classes and time
        data = [{"日期": r.date, "學生姓名": r.student_name, "課程名稱": r.course_name,
                 "上課時間": f"{r.start_time.strftime('%H:%M')}-{r.end_time.strftime('%H:%M')}", "授課老師": r.teacher_name, "出勤狀態": r.status, "剩餘堂數": self.get_student_remaining_classes(r.student_name)} for r in records]
        df = pd.DataFrame(data)

        reports_dir = BASE_DIR / "reports"
        reports_dir.mkdir(exist_ok=True)
        out = reports_dir / f"attendance_report_{year}_{month:02d}.xlsx" 
        try:
            df.to_excel(out, index=False, engine="openpyxl")
            return str(out.resolve())
        except Exception:
            return None

    def get_student_remaining_classes(self, student_name: str) -> int:
        """
        Helper function to get the remaining classes for a student.
        """
        session = self._get_session()
        try:
            student = session.query(Student).filter(Student.name == student_name).first()
            return student.remaining_classes if student else 0
        finally:
            session.close()
