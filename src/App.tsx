import { useState, useEffect, useMemo } from "react";
import "./App.css";

type Status = "Enrolled" | "Pending" | "Graduated";
type Student = { id: string; name: string; email: string; program: string; year: number; status: Status; };

const initialStudents: Student[] = [
  { id: "901020395", name: "Mankholi Katleho", email: "mankholi.katleho@gmail.com", program: "BSc (Hons) Software Engineering with Multimedia", year: 3, status: "Enrolled" },
  { id: "901020396", name: "Thabo Molefe", email: "thabo.molefe@gmail.com", program: "BSc (Hons) Information Technology", year: 2, status: "Enrolled" },
  { id: "901020397", name: "Nthabiseng Nkune", email: "nthabiseng.nkune@gmail.com", program: "BSc (Hons) Business Information Technology", year: 3, status: "Graduated" },
  { id: "901020398", name: "Lerato Mokoena", email: "lerato.mokoena@gmail.com", program: "BSc (Hons) Cyber Security & Digital Forensics", year: 3, status: "Enrolled" },
  { id: "901020399", name: "Teboho Letsie", email: "teboho.letsie@gmail.com", program: "BSc (Hons) Data Science & AI", year: 2, status: "Pending" },
  { id: "901020400", name: "Palesa Khali", email: "palesa.khali@gmail.com", program: "BSc (Hons) Cloud Computing & Networking", year: 3, status: "Graduated" },
];

const courses = [
  "BSc (Hons) Software Engineering with Multimedia",
  "BSc (Hons) Information Technology",
  "BSc (Hons) Business Information Technology",
  "BSc (Hons) Cyber Security & Digital Forensics",
  "BSc (Hons) Data Science & AI",
  "BSc (Hons) Cloud Computing & Networking",
];

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    const s = localStorage.getItem("luct_v3");
    return s ? JSON.parse(s) : initialStudents;
  });
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Student>({ id: "", name: "", email: "", program: courses[0], year: 1, status: "Enrolled" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  useEffect(() => { localStorage.setItem("luct_v3", JSON.stringify(students)); }, [students]);
  useEffect(() => { if (toast) setTimeout(() => setToast(""), 2500); }, [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => `${s.name} ${s.email} ${s.id} ${s.program}`.toLowerCase().includes(q));
  }, [students, search]);

  const st = {
    total: students.length,
    enrolled: students.filter(s => s.status === "Enrolled").length,
    grad: students.filter(s => s.status === "Graduated").length,
    pending: students.filter(s => s.status === "Pending").length,
  };

  const valid = () => {
    const e: Record<string, string> = {};
    if (!form.id.trim()) e.id = "ID required";
    if (!editing && students.some(x => x.id === form.id)) e.id = "Duplicate ID";
    if (form.name.trim().length < 3) e.name = "Min 3 chars";
    if (!/^[^\s@]+@gmail\.com$/.test(form.email)) e.email = "Must be @gmail.com";
    setErr(e);
    return !Object.keys(e).length;
  };

  const save = () => {
    if (!valid()) return;
    if (editing) setStudents(p => p.map(x => x.id === editing.id ? form : x));
    else setStudents(p => [...p, form]);
    setToast(editing ? "Updated ✓" : "Added ✓");
    setShow(false); setEditing(null);
  };

  const del = (id: string) => {
    if (confirm("Delete?")) { setStudents(p => p.filter(s => s.id !== id)); setToast("Deleted ✓"); }
  };

  const csv = () => {
    const h = "ID,Name,Email,Program,Year,Status\n";
    const r = students.map(s => `${s.id},"${s.name}",${s.email},"${s.program}",${s.year},${s.status}`).join("\n");
    const blob = new Blob([h + r], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "LUCT_901020395.csv"; a.click();
  };

  return (
    <>
      <header className="header"><h1>LIMKOKWING UNIVERSITY</h1><p>Student  Management System</p></header>
      <nav className="nav-menu">
        <button className={tab === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setTab("dashboard")}>Dashboard</button>
        <button className={tab === "students" ? "nav-item active" : "nav-item"} onClick={() => setTab("students")}>Students <span className="nav-badge">{students.length}</span></button>
        <button className={tab === "courses" ? "nav-item active" : "nav-item"} onClick={() => setTab("courses")}>Courses <span className="nav-badge-small">{courses.length}</span></button>
        <button className={tab === "reports" ? "nav-item active" : "nav-item"} onClick={() => setTab("reports")}>Reports</button>
      </nav>
      <div className="container">
        {tab === "dashboard" && (
          <div className="dashboard-cards">
            <div className="dash-card"><h3>{st.total}</h3><p>Total</p></div>
            <div className="dash-card"><h3>{st.enrolled}</h3><p>Enrolled</p></div>
            <div className="dash-card"><h3>{st.grad}</h3><p>Graduated</p></div>
            <div className="dash-card"><h3>{courses.length}</h3><p>Programs</p></div>
          </div>
        )}
        {tab === "students" && (
          <>
            <div className="toolbar">
              <input className="search" placeholder="Search name, email, ID, program..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-secondary" onClick={csv}>Export CSV</button>
              <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ id: "", name: "", email: "", program: courses[0], year: 1, status: "Enrolled" }); setErr({}); setShow(true); }}>+ Add Student</button>
            </div>
            <div className="table-wrap">
              <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Program</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filtered.map(s => (
                  <tr key={s.id}><td><b>{s.id}</b></td><td>{s.name}</td><td>{s.email}</td><td>{s.program}</td><td>{s.year}</td><td><span className={`status status-${s.status}`}>{s.status}</span></td>
                    <td><button className="btn-small" onClick={() => { setEditing(s); setForm(s); setShow(true); }}>Edit</button><button className="btn-small btn-danger" onClick={() => del(s.id)}>Delete</button></td></tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
        {tab === "courses" && (
          <div className="table-wrap"><table><thead><tr><th>Course</th><th>Total</th></tr></thead><tbody>{courses.map(c => <tr key={c}><td><b>{c}</b></td><td>{students.filter(s => s.program === c).length}</td></tr>)}</tbody></table></div>
        )}
        {tab === "reports" && (
          <div className="table-wrap" style={{ padding: 24 }}><h3>Final Report 2026</h3><p style={{ marginTop: 12, lineHeight: 2 }}>Total Students: <b>{st.total}</b><br />Enrolled: {st.enrolled} | Graduated: {st.grad} | Pending: {st.pending}<br />Owner: <b>901020395 - Mankholi Katleho</b><br />Campus: Maseru</p><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={csv}>Download CSV</button></div>
        )}
      </div>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Edit" : "Add"} Student</h3>
            <div style={{ marginTop: 16 }}>
              <div className="form-group"><label>ID *</label><input value={form.id} disabled={!!editing} onChange={e => setForm({ ...form, id: e.target.value })} />{err.id && <div className="error">{err.id}</div>}</div>
              <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />{err.name && <div className="error">{err.name}</div>}</div>
              <div className="form-group"><label>Email @gmail.com *</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />{err.email && <div className="error">{err.email}</div>}</div>
              <div className="form-group"><label>Course</label><select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}>{courses.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Year</label><select value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}><option>Enrolled</option><option>Pending</option><option>Graduated</option></select></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
            <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>LIMKOKWING UNIVERSITY</h4>
            <p>Creative Technology</p>
            <span>Maseru Campus, Lesotho</span>
          </div>
          <div className="footer-col center">
            <h4>STUDENT PROJECT</h4>
            <p><b>ID: 901020395</b></p>
            <span>Mankholi Katleho</span>
          </div>
          <div className="footer-col right">
            <h4>SYSTEM INFO</h4>
            <p>Total: <b>{students.length} Students</b></p>
            <span>www.limkokwing.net</span>
          </div>
        </div>
        <div className="footer-bottom">
          @2026 LUCT - Limkokwing University of Creative Technology. All Rights Reserved | Advanced SMS v3.0
        </div>
      </footer>
    </>
  );
}