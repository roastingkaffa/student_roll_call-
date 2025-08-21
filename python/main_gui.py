# main_gui.py
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime, date
from services import AttendanceService

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("學生點名系統")
        self.geometry("1000x700")

        self.service = AttendanceService()

        style = ttk.Style(self)
        style.configure("Danger.TButton", foreground="red")

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(pady=10, padx=10, fill="both", expand=True)

        self.create_tab("學生管理", self.setup_student_tab)
        self.create_tab("老師管理", self.setup_teacher_tab)
        self.create_tab("課程管理", self.setup_course_tab)
        self.create_tab("今日點名", self.setup_attendance_tab)
        self.create_tab("查詢與報表", self.setup_report_tab)

        self.notebook.bind("<<NotebookTabChanged>>", self.on_tab_change)

    def create_tab(self, text, setup_function):
        frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(frame, text=text)
        setup_function(frame)

    def on_tab_change(self, _):
        tab = self.notebook.tab(self.notebook.select(), "text")
        if tab == "課程管理":
            self.refresh_teacher_combobox()
            self.refresh_course_list()
        elif tab == "今日點名":
            self.refresh_today_class_list()
        elif tab == "查詢與報表":
            self.refresh_report_student_list()

    # ===== 學生管理 =====
    def setup_student_tab(self, parent):
        # 新增學生區塊
        add_frame = ttk.LabelFrame(parent, text="新增學生")
        add_frame.pack(fill="x", padx=5, pady=5)

        # 讓中間欄位可撐開，右邊才貼齊
        for c in (1, 3):
            add_frame.columnconfigure(c, weight=1)

        ttk.Label(add_frame, text="姓名:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.student_name_entry = ttk.Entry(add_frame, width=30)
        self.student_name_entry.grid(row=0, column=1, padx=5, pady=5, sticky="ew")

        ttk.Label(add_frame, text="電話:").grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.student_phone_entry = ttk.Entry(add_frame, width=30)
        self.student_phone_entry.grid(row=0, column=3, padx=5, pady=5, sticky="ew")

        ttk.Label(add_frame, text="地址:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.student_address_entry = ttk.Entry(add_frame, width=30)
        self.student_address_entry.grid(row=1, column=1, padx=5, pady=5, sticky="ew")

        ttk.Label(add_frame, text="報名堂數:").grid(row=1, column=2, padx=5, pady=5, sticky="w")
        self.student_classes_entry = ttk.Entry(add_frame, width=10)
        self.student_classes_entry.grid(row=1, column=3, padx=5, pady=5, sticky="w")

        # 原本「新增」按鈕
        ttk.Button(add_frame, text="新增", command=self.add_student).grid(
            row=0, column=4, padx=10, pady=5, sticky="e"
        )

        # ✅ 新增：把兩顆操作按鈕放到 add_frame 的最右側
        # 建一個右側容器，跨兩列(rowspan=2)，貼齊右上角
        right_ops = ttk.Frame(add_frame)
        right_ops.grid(row=0, column=5, rowspan=2, padx=10, pady=5, sticky="ne")

        ttk.Button(
            right_ops, text="為選定學生增加堂數", command=self.add_classes_to_student
        ).pack(fill="x", pady=(0, 6))

        ttk.Button(
            right_ops, text="刪除選定學生", command=self.delete_student, style="Danger.TButton"
        ).pack(fill="x")

        # 學生列表區塊（這裡不再放按鈕）
        list_frame = ttk.LabelFrame(parent, text="學生列表與操作")
        list_frame.pack(fill="both", expand=True, padx=5, pady=5)

        table_container = ttk.Frame(list_frame)
        table_container.pack(side="left", fill="both", expand=True)

        self.student_tree = ttk.Treeview(
            table_container,
            columns=("id", "name", "phone", "address", "registered", "remaining"),
            show="headings",
        )
        self.student_tree.heading("id", text="ID")
        self.student_tree.heading("name", text="姓名")
        self.student_tree.heading("phone", text="電話")
        self.student_tree.heading("address", text="地址")
        self.student_tree.heading("registered", text="總堂數")
        self.student_tree.heading("remaining", text="剩餘堂數")
        self.student_tree.column("id", width=50)
        self.student_tree.pack(side="left", fill="both", expand=True)

        scrollbar = ttk.Scrollbar(table_container, orient="vertical", command=self.student_tree.yview)
        scrollbar.pack(side="right", fill="y")
        self.student_tree.configure(yscrollcommand=scrollbar.set)

        self.student_tree.tag_configure("zero_classes", foreground="red")

        self.refresh_student_list()


    def add_student(self):
        name = self.student_name_entry.get().strip()
        phone = self.student_phone_entry.get().strip()
        addr = self.student_address_entry.get().strip()
        cls = self.student_classes_entry.get().strip()
        if not name:
            messagebox.showerror("錯誤", "學生姓名不能為空！"); return
        try:
            n = int(cls) if cls else 0
        except ValueError:
            messagebox.showerror("錯誤", "報名堂數必須是數字！"); return
        if self.service.add_student(name, phone, addr, n):
            self.refresh_student_list()
            for e in (self.student_name_entry, self.student_phone_entry,
                      self.student_address_entry, self.student_classes_entry):
                e.delete(0, tk.END)

    def refresh_student_list(self):
        for i in self.student_tree.get_children():
            self.student_tree.delete(i)
        for s in self.service.get_all_students():
            tags = ("zero_classes",) if s.remaining_classes <= 0 else ()
            self.student_tree.insert("", "end",
                values=(s.id, s.name, s.phone, s.address, s.registered_classes, s.remaining_classes),
                tags=tags)

    def add_classes_to_student(self):
        it = self.student_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一位學生。"); return
        sid, name = self.student_tree.item(it)["values"][0:2]
        n = simpledialog.askinteger("增加堂數", f"要為學生 {name} 增加幾堂課？", minvalue=1, parent=self)
        if n and self.service.add_classes_to_student(sid, n):
            self.refresh_student_list()

    def delete_student(self):
        it = self.student_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一位學生。"); return
        sid, name = self.student_tree.item(it)["values"][0:2]
        if messagebox.askyesno("確認刪除", f"確定刪除學生【{name}】？此操作無法復原！", icon="warning"):
            if self.service.delete_student(sid):
                self.refresh_student_list()
                self.refresh_report_student_list()

    # ===== 老師管理 =====
    def setup_teacher_tab(self, parent):
        add = ttk.LabelFrame(parent, text="新增老師"); add.pack(fill="x", padx=5, pady=5)
        ttk.Label(add, text="姓名:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.teacher_name_entry = ttk.Entry(add, width=30); self.teacher_name_entry.grid(row=0, column=1, padx=5, pady=5)
        ttk.Label(add, text="電話:").grid(row=0, column=2, padx=5, pady=5, sticky="w")
        self.teacher_phone_entry = ttk.Entry(add, width=30); self.teacher_phone_entry.grid(row=0, column=3, padx=5, pady=5)
        ttk.Label(add, text="地址:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.teacher_address_entry = ttk.Entry(add, width=30); self.teacher_address_entry.grid(row=1, column=1, padx=5, pady=5)
        ttk.Button(add, text="新增", command=self.add_teacher).grid(row=1, column=3, padx=10, pady=5)

        lf = ttk.LabelFrame(parent, text="老師列表"); lf.pack(fill="both", expand=True, padx=5, pady=5)
        self.teacher_tree = ttk.Treeview(lf, columns=("id","name","phone","address"), show="headings")
        for k, t in [("id","ID"),("name","姓名"),("phone","電話"),("address","地址")]:
            self.teacher_tree.heading(k, text=t)
        self.teacher_tree.column("id", width=50); self.teacher_tree.pack(fill="both", expand=True)
        ttk.Button(lf, text="刪除選定老師", style="Danger.TButton", command=self.delete_teacher).pack(pady=10)

        self.refresh_teacher_list()

    def add_teacher(self):
        name = self.teacher_name_entry.get().strip()
        phone = self.teacher_phone_entry.get().strip()
        addr = self.teacher_address_entry.get().strip()
        if not name:
            messagebox.showerror("錯誤", "老師姓名不能為空！"); return
        if self.service.add_teacher(name, phone, addr):
            self.refresh_teacher_list()
            for e in (self.teacher_name_entry, self.teacher_phone_entry, self.teacher_address_entry):
                e.delete(0, tk.END)

    def refresh_teacher_list(self):
        for i in self.teacher_tree.get_children():
            self.teacher_tree.delete(i)
        for t in self.service.get_all_teachers():
            self.teacher_tree.insert("", "end", values=(t.id, t.name, t.phone, t.address))

    def delete_teacher(self):
        it = self.teacher_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一位老師。"); return
        tid, name = self.teacher_tree.item(it)["values"][0:2]
        ok, msg = self.service.delete_teacher(tid)
        if ok:
            self.refresh_teacher_list()
        else:
            messagebox.showerror("刪除失敗", msg)

    # ===== 課程管理 =====
    def setup_course_tab(self, parent):
        cf = ttk.LabelFrame(parent, text="新增課程"); cf.pack(fill="x", padx=5, pady=5)
        ttk.Label(cf, text="課程名稱:").grid(row=0, column=0, padx=5, pady=5)
        self.course_name_entry = ttk.Entry(cf, width=30); self.course_name_entry.grid(row=0, column=1, padx=5, pady=5)
        ttk.Label(cf, text="授課老師:").grid(row=0, column=2, padx=5, pady=5)
        self.course_teacher_combo = ttk.Combobox(cf, state="readonly"); self.course_teacher_combo.grid(row=0, column=3, padx=5, pady=5)
        ttk.Button(cf, text="新增課程", command=self.add_course).grid(row=0, column=4, padx=10)

        sf = ttk.LabelFrame(parent, text="新增課程時間"); sf.pack(fill="x", padx=5, pady=(10,5))
        ttk.Label(sf, text="選擇課程:").grid(row=0, column=0, padx=5, pady=5)
        self.schedule_course_combo = ttk.Combobox(sf, state="readonly"); self.schedule_course_combo.grid(row=0, column=1, padx=5, pady=5)
        ttk.Label(sf, text="星期:").grid(row=0, column=2, padx=5, pady=5)
        self.schedule_day_combo = ttk.Combobox(sf, values=["MON","TUE","WED","THU","FRI","SAT","SUN"], state="readonly")
        self.schedule_day_combo.grid(row=0, column=3, padx=5, pady=5)
        ttk.Label(sf, text="開始時間 (HH:MM):").grid(row=0, column=4, padx=5, pady=5)
        self.schedule_time_entry = ttk.Entry(sf, width=10); self.schedule_time_entry.grid(row=0, column=5, padx=5, pady=5)
        ttk.Button(sf, text="新增時間", command=self.add_schedule).grid(row=0, column=6, padx=10)

        lf = ttk.LabelFrame(parent, text="課程與時間總覽"); lf.pack(fill="both", expand=True, padx=5, pady=(10,5))
        self.course_tree = ttk.Treeview(lf, columns=("id","name","teacher","schedules"), show="headings")
        for k, t in [("id","ID"),("name","課程名稱"),("teacher","授課老師"),("schedules","上課時間")]:
            self.course_tree.heading(k, text=t)
        self.course_tree.column("id", width=50); self.course_tree.pack(fill="both", expand=True)

        ttk.Button(lf, text="刪除選定課程", style="Danger.TButton", command=self.delete_course).pack(pady=10)
        ttk.Button(lf, text="管理課程學生", command=self.open_enrollment_window).pack(pady=5)

        self.refresh_teacher_combobox()
        self.refresh_course_list()

    def refresh_teacher_combobox(self):
        t = self.service.get_all_teachers()
        self.teacher_map = {x.name: x.id for x in t}
        self.course_teacher_combo["values"] = list(self.teacher_map.keys())

    def refresh_course_list(self):
        for i in self.course_tree.get_children():
            self.course_tree.delete(i)
        names = []
        self.course_map = {}
        for c in self.service.get_all_courses_with_schedules():
            names.append(f"{c.id}: {c.name}")
            self.course_map[f"{c.id}: {c.name}"] = c.id
            sched = ", ".join([f"{s.day_of_week} {s.start_time.strftime('%H:%M')}" for s in c.schedules])
            self.course_tree.insert("", "end", values=(c.id, c.name, c.teacher.name, sched))
        self.schedule_course_combo["values"] = names

    def add_course(self):
        name = self.course_name_entry.get().strip()
        tname = self.course_teacher_combo.get().strip()
        if not name or not tname:
            messagebox.showerror("錯誤", "課程名稱和授課老師皆須選擇。"); return
        tid = self.teacher_map[tname]
        if self.service.add_course(name, tid):
            self.refresh_course_list()
            self.course_name_entry.delete(0, tk.END)

    def add_schedule(self):
        course_str = self.schedule_course_combo.get().strip()
        day = self.schedule_day_combo.get().strip()
        tstr = self.schedule_time_entry.get().strip()
        if not all([course_str, day, tstr]):
            messagebox.showerror("錯誤", "所有欄位皆須填寫。"); return
        try:
            datetime.strptime(tstr, "%H:%M")
        except ValueError:
            messagebox.showerror("錯誤", "時間格式錯誤，請使用 HH:MM。"); return
        cid = self.course_map[course_str]
        if self.service.add_course_schedule(cid, day, tstr):
            self.refresh_course_list()
            self.schedule_time_entry.delete(0, tk.END)
        else:
            messagebox.showerror("錯誤", "新增課程時間失敗，請檢查是否與午休衝突。")

    def delete_course(self):
        it = self.course_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一門課程。"); return
        cid, name = self.course_tree.item(it)["values"][0:2]
        if messagebox.askyesno("確認刪除", f"確定刪除課程【{name}】？此操作會刪除其時間表與點名記錄！", icon="warning"):
            if self.service.delete_course(cid):
                self.refresh_course_list()

    def open_enrollment_window(self):
        it = self.course_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一門課程。"); return
        cid, cname = self.course_tree.item(it)["values"][0:2]
        EnrollmentWindow(self, self.service, int(cid), str(cname))

    # ===== 今日點名 =====
    def setup_attendance_tab(self, parent):
        cf = ttk.LabelFrame(parent, text="今日課程"); cf.pack(fill="x", padx=5, pady=5)
        self.today_class_tree = ttk.Treeview(cf, columns=("time","course","teacher"), show="headings")
        for k, t in [("time","時間"),("course","課程"),("teacher","老師")]:
            self.today_class_tree.heading(k, text=t)
        self.today_class_tree.pack(fill="x", expand=True)
        self.today_class_tree.bind("<<TreeviewSelect>>", self.on_class_select)

        self.attendance_frame = ttk.LabelFrame(parent, text="學生點名 (請先選擇上方課程)")
        self.attendance_frame.pack(fill="both", expand=True, padx=5, pady=10)
        self.student_attendance_widgets = []

    def refresh_today_class_list(self):
        for i in self.today_class_tree.get_children():
            self.today_class_tree.delete(i)
        today = date.today()
        occ = self.service.get_courses_for_period(today, today)
        if not occ:
            messagebox.showinfo("資訊", "今天沒有排定的課程。"); return
        self.today_courses_map = {}
        for o in occ:
            tstr = f"{o['start_time'].strftime('%H:%M')}-{o['end_time'].strftime('%H:%M')}"
            iid = self.today_class_tree.insert("", "end", values=(tstr, o["course_name"],o['course_id'], o["teacher_name"]))
            self.today_courses_map[iid] = o

    def on_class_select(self, _):
        for w in self.attendance_frame.winfo_children():
            w.destroy()
        self.student_attendance_widgets = []

        it = self.today_class_tree.focus()
        if not it: return
        sel = self.today_courses_map.get(it)
        if not sel: return

        self.attendance_frame.config(text=f"學生點名 - {sel['course_name']} ({sel['start_time'].strftime('%H:%M')})")

        students = self.service.get_students_for_course(sel["course_id"])
        if not students:
            ttk.Label(self.attendance_frame, text="沒有已報名的學生。請先在『課程管理→管理課程學生』加入學生。").pack(pady=20)
            return

        header = ttk.Frame(self.attendance_frame); header.pack(fill="x", padx=10, pady=5)
        ttk.Label(header, text="學生姓名", width=20, font=("Arial",10,"bold")).pack(side="left")
        ttk.Label(header, text="剩餘堂數", width=10, font=("Arial",10,"bold")).pack(side="left", padx=10)
        ttk.Label(header, text="出勤狀態", font=("Arial",10,"bold")).pack(side="left", padx=20)

        canvas = tk.Canvas(self.attendance_frame)
        sb = ttk.Scrollbar(self.attendance_frame, orient="vertical", command=canvas.yview)
        inner = ttk.Frame(canvas)
        inner.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0,0), window=inner, anchor="nw")
        canvas.configure(yscrollcommand=sb.set)
        canvas.pack(side="left", fill="both", expand=True); sb.pack(side="right", fill="y")

        for s in students:
            row = ttk.Frame(inner); row.pack(fill="x", padx=10, pady=2)
            ttk.Label(row, text=s.name, width=20).pack(side="left")
            ttk.Label(row, text=f"{s.remaining_classes} 堂", width=10).pack(side="left", padx=10)
            var = tk.StringVar(value="有到")
            for txt in ("有到","遲到","曠課"):
                ttk.Radiobutton(row, text=txt, variable=var, value=txt).pack(side="left", padx=5)
            self.student_attendance_widgets.append({"student_id": s.id, "status_var": var})

        ttk.Button(self.attendance_frame, text="完成點名", command=self.submit_attendance).pack(pady=20)

    def submit_attendance(self):
        it = self.today_class_tree.focus()
        if not it:
            messagebox.showwarning("警告", "請先選擇一門課程。"); return
        sel = self.today_courses_map.get(it)
        stat = {w["student_id"]: w["status_var"].get() for w in self.student_attendance_widgets}
        if self.service.take_attendance(sel["schedule_id"], date.today(), stat):
            messagebox.showinfo("成功", "點名完成！已更新剩餘堂數。")
            for w in self.attendance_frame.winfo_children(): w.destroy()
            self.refresh_student_list()
        else:
            messagebox.showerror("錯誤", "點名失敗，請查看主控台輸出。")

    # ===== 查詢與報表 =====
    def setup_report_tab(self, parent):
        qf = ttk.LabelFrame(parent, text="學生出勤查詢"); qf.pack(fill="x", padx=5, pady=5)
        ttk.Label(qf, text="選擇學生:").pack(side="left", padx=5, pady=5)
        self.report_student_combo = ttk.Combobox(qf, state="readonly", width=30)
        self.report_student_combo.pack(side="left", padx=5, pady=5)
        ttk.Button(qf, text="查詢", command=self.query_student_attendance).pack(side="left", padx=10)

        self.student_attendance_tree = ttk.Treeview(
            qf, columns=("date","course","status","deducted"), show="headings"
        )
        for k, t in [("date","日期"),("course","課程名稱"),("status","出勤狀態"),("deducted","是否扣堂")]:
            self.student_attendance_tree.heading(k, text=t)
        self.student_attendance_tree.pack(fill="both", expand=True, pady=10)

        mf = ttk.LabelFrame(parent, text="每月點名狀況報表"); mf.pack(fill="x", padx=5, pady=10)
        from datetime import datetime as _dt
        cy = _dt.now().year
        self.report_year_combo = ttk.Combobox(mf, values=[str(y) for y in range(cy-5, cy+1)], state="readonly")
        self.report_year_combo.set(str(cy)); self.report_year_combo.pack(side="left", padx=5, pady=5)
        ttk.Label(mf, text="選擇月份:").pack(side="left", padx=5, pady=5)
        self.report_month_combo = ttk.Combobox(mf, values=[f"{m:02d}" for m in range(1,13)], state="readonly")
        self.report_month_combo.set(f"{_dt.now().month:02d}"); self.report_month_combo.pack(side="left", padx=5, pady=5)
        ttk.Button(mf, text="匯出 Excel 報表", command=self.export_monthly_report).pack(side="left", padx=10)

    def refresh_report_student_list(self):
        students = self.service.get_all_students()
        self.report_student_map = {s.name: s.id for s in students}
        self.report_student_combo["values"] = list(self.report_student_map.keys())

    def query_student_attendance(self):
        for i in self.student_attendance_tree.get_children():
            self.student_attendance_tree.delete(i)
        name = self.report_student_combo.get().strip()
        if not name:
            messagebox.showwarning("警告", "請先選擇一位學生。"); return
        sid = self.report_student_map[name]
        stu, recs = self.service.get_student_attendance(sid)
        if stu:
            self.student_attendance_tree.heading("date", text=f"日期 ( {stu.name} - 剩餘 {stu.remaining_classes} 堂 )")
        for r in recs:
            cname = r.course_schedule.course.name if r.course_schedule and r.course_schedule.course else "N/A"
            self.student_attendance_tree.insert("", "end",
                values=(r.date, cname, r.status, "是" if r.class_deducted else "否"))

    def export_monthly_report(self):
        y = self.report_year_combo.get().strip()
        m = self.report_month_combo.get().strip()
        if not y or not m:
            messagebox.showerror("錯誤", "請選擇年份和月份。"); return
        rows = self.service.get_monthly_attendance_report(int(y), int(m))
        if not rows:
            messagebox.showinfo("資訊", f"{y}年{m}月沒有任何點名記錄。"); return
        path = self.service.export_report_to_excel(rows, int(y), int(m))
        if path:
            messagebox.showinfo("成功", f"報表已匯出至：\n{path}")
        else:
            messagebox.showerror("錯誤", "匯出失敗。")

class EnrollmentWindow(tk.Toplevel):
    def __init__(self, parent, service, course_id, course_name):
        super().__init__(parent)
        self.transient(parent); self.grab_set()
        self.title(f"管理課程學生 - {course_name}")
        self.geometry("600x500")

        self.service = service
        self.course_id = int(course_id)

        main = ttk.Frame(self, padding=10); main.pack(fill="both", expand=True)
        left = ttk.LabelFrame(main, text="未報名學生"); left.pack(side="left", fill="both", expand=True, padx=5)
        self.unrolled_listbox = tk.Listbox(left, selectmode=tk.EXTENDED); self.unrolled_listbox.pack(fill="both", expand=True)
        mid = ttk.Frame(main); mid.pack(side="left", fill="y", padx=10)
        ttk.Button(mid, text=">>\n報名", command=self.enroll).pack(pady=10)
        ttk.Button(mid, text="<<\n取消", command=self.unenroll).pack(pady=10)
        right = ttk.LabelFrame(main, text="已報名學生"); right.pack(side="left", fill="both", expand=True, padx=5)
        self.enrolled_listbox = tk.Listbox(right, selectmode=tk.EXTENDED); self.enrolled_listbox.pack(fill="both", expand=True)
        ttk.Button(self, text="儲存變更", command=self.save_changes).pack(pady=10)

        self.populate_lists()

    def populate_lists(self):
        self.unrolled_listbox.delete(0, tk.END)
        self.enrolled_listbox.delete(0, tk.END)
        unrolled = {s.id: s.name for s in self.service.get_students_not_in_course(self.course_id)}
        enrolled = {s.id: s.name for s in self.service.get_students_for_course(self.course_id)}
        for sid, name in unrolled.items():
            self.unrolled_listbox.insert(tk.END, f"{name} (ID: {sid})")
        for sid, name in enrolled.items():
            self.enrolled_listbox.insert(tk.END, f"{name} (ID: {sid})")

    def enroll(self):
        for i in reversed(self.unrolled_listbox.curselection()):
            self.enrolled_listbox.insert(tk.END, self.unrolled_listbox.get(i))
            self.unrolled_listbox.delete(i)

    def unenroll(self):
        for i in reversed(self.enrolled_listbox.curselection()):
            self.unrolled_listbox.insert(tk.END, self.enrolled_listbox.get(i))
            self.enrolled_listbox.delete(i)

    def save_changes(self):
        ids = []
        for i in range(self.enrolled_listbox.size()):
            txt = self.enrolled_listbox.get(i)  # "王小明 (ID: 3)"
            try:
                sid = int(txt.rsplit("ID:", 1)[1].strip().rstrip(")"))
                ids.append(sid)
            except Exception:
                pass
        if self.service.update_course_enrollments(self.course_id, ids):
            messagebox.showinfo("成功", "學生報名名單已更新！", parent=self)
            self.destroy()
        else:
            messagebox.showerror("錯誤", "儲存失敗！", parent=self)

if __name__ == "__main__":
    # 先確保資料庫就緒
    _ = AttendanceService()
    app = App()
    app.mainloop()
