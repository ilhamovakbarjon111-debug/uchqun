import React, { useEffect, useRef, useState } from "react";
import api from "../src/shared/services/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialSchedule = [
  {
    start: "09:00",
    end: "10:00",
    lessons: {
      Monday: { title: "Math", status: "attended", participation: "great" },
      Tuesday: { title: "Drawing", status: "absent", participation: "average" },
      Wednesday: { title: "English", status: "attended", participation: "great" },
      Thursday: { title: "Music", status: "late", participation: "needs_help" },
      Friday: { title: "Math", status: "attended", participation: "great" },
      Saturday: { title: "Story Time", status: "excused", participation: "average" },
      Sunday: { title: "Free Play", status: "attended", participation: "average" },
    },
  },
  {
    start: "10:30",
    end: "11:30",
    lessons: {
      Monday: { title: "English", status: "attended", participation: "great" },
      Tuesday: { title: "Math", status: "attended", participation: "average" },
      Wednesday: { title: "Sport", status: "excused", participation: "needs_help" },
      Thursday: { title: "Drawing", status: "attended", participation: "great" },
      Friday: { title: "Music", status: "absent", participation: "needs_help" },
      Saturday: { title: "Crafts", status: "attended", participation: "great" },
      Sunday: { title: "Nap / Calm", status: "excused", participation: "average" },
    },
  },
];

const statusStyles = {
  attended:
    "bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200 text-emerald-800",
  absent:
    "bg-gradient-to-br from-rose-50 via-white to-rose-100 border border-rose-200 text-rose-800",
  late:
    "bg-gradient-to-br from-amber-50 via-white to-amber-100 border border-amber-200 text-amber-800",
  excused:
    "bg-gradient-to-br from-sky-50 via-white to-sky-100 border border-sky-200 text-sky-800",
};

const statusLabel = {
  attended: "✓ Attended",
  absent: "✕ Absent",
  late: "⏰ Late",
  excused: "ℹ️ Excused",
};

const statusIcons = {
  attended: "✓",
  absent: "✕",
  late: "⏰",
  excused: "ℹ️",
};

const participationStyles = {
  great: {
    label: "Great",
    chip: "bg-emerald-500/15 text-emerald-700 border border-emerald-200",
  },
  average: {
    label: "Average",
    chip: "bg-amber-400/15 text-amber-700 border border-amber-200",
  },
  needs_help: {
    label: "Needs support",
    chip: "bg-rose-400/15 text-rose-700 border border-rose-200",
  },
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, daysToAdd) => {
  const d = new Date(date);
  d.setDate(d.getDate() + daysToAdd);
  return d;
};

const statusOptions = ["attended", "late", "excused", "absent"];
const participationOptions = ["great", "average", "needs_help"];

export default function Activities() {
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [form, setForm] = useState({
    day: "Monday",
    start: "09:00",
    end: "10:00",
    title: "",
    status: "attended",
    participation: "great",
    saveToChild: false,
  });
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [activities, setActivities] = useState([]);
  const isTeacher = true; // in real app: derive from auth/role

  useEffect(() => {
    // Simulate fetch for selected week; replace with API call
    setLoading(true);
    const timer = setTimeout(() => {
      setScheduleData(initialSchedule);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [weekStart]);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadActivities(selectedChildId);
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    try {
      const parentsRes = await api.get("/teacher/parents");
      const allChildren = [];
      parentsRes.data.parents?.forEach((p) => {
        if (Array.isArray(p.children)) {
          allChildren.push(...p.children);
        }
      });
      setChildren(allChildren);
      if (allChildren.length > 0) {
        setSelectedChildId(allChildren[0].id);
      }
    } catch (err) {
      console.error("Failed to load children", err);
      setChildren([]);
    }
  };

  const loadActivities = async (childId) => {
    try {
      setLoadingActivities(true);
      const res = await api.get(`/activities?childId=${childId}`);
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load activities", err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const weekDays = days.map((day, idx) => {
    const date = addDays(weekStart, idx);
    return {
      name: day,
      date,
      short: date.toLocaleDateString(undefined, { weekday: "short" }),
      full: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
  });

  const weekRangeLabel = `${weekDays[0].full} — ${weekDays[weekDays.length - 1].full}`;


  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.end <= form.start) return;

    const startMinutes = parseInt(form.start.split(":")[0], 10) * 60 + parseInt(form.start.split(":")[1], 10);
    const endMinutes = parseInt(form.end.split(":")[0], 10) * 60 + parseInt(form.end.split(":")[1], 10);
    const durationMinutes = Math.max(1, endMinutes - startMinutes);

    setScheduleData((prev) => {
      const existing = [...prev];
      const slotIndex = existing.findIndex(
        (r) => r.start === form.start && r.end === form.end
      );

      const lesson = {
        title: form.title.trim(),
        status: form.status,
        participation: form.participation,
      };

      if (slotIndex === -1) {
        existing.push({
          start: form.start,
          end: form.end,
          lessons: { [form.day]: lesson },
        });
      } else {
        const updated = { ...existing[slotIndex] };
        updated.lessons = { ...updated.lessons, [form.day]: lesson };
        existing[slotIndex] = updated;
      }

      // keep rows sorted by start time
      return existing.sort((a, b) => a.start.localeCompare(b.start));
    });

    // Optionally push to child activity feed as a record
    if (form.saveToChild && selectedChildId) {
      const dayIdx = days.findIndex((d) => d === form.day);
      const dateIso =
        dayIdx >= 0
          ? addDays(weekStart, dayIdx).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

      api
        .post("/activities", {
          childId: selectedChildId,
          title: form.title.trim(),
          description: `${form.day} • ${form.start}–${form.end}`,
          type: "Learning",
          duration: durationMinutes,
          date: dateIso,
          studentEngagement: "Medium",
          notes: "",
        })
        .then(() => loadActivities(selectedChildId))
        .catch((err) => console.error("Failed to save activity", err));
    }

    setForm((f) => ({ ...f, title: "", saveToChild: false }));
  };

  const handleAddButtonClick = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => titleRef.current?.focus(), 150);
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-[#f7f4ff] via-[#f6f9ff] to-[#fff7ed] text-gray-900">
      <div className="relative max-w-6xl mx-auto mb-8 p-6 rounded-3xl border border-indigo-100 shadow-lg bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-80 pointer-events-none bg-[radial-gradient(circle_at_12%_20%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.14),transparent_26%),radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.16),transparent_32%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">
              Weekly plan
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Activities Schedule
            </h1>
            <p className="text-sm text-gray-600">
              Friendly, bright timetable for the whole week (Mon–Sun).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-800 bg-white border border-indigo-100 px-3 py-2 rounded-2xl shadow-sm">
            <span className="px-2 py-1 rounded-xl bg-indigo-50 border border-indigo-100 font-semibold text-indigo-700">
              Mon–Sun
            </span>
            <span className="px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-100 font-semibold text-emerald-700">
              09:00–11:30
            </span>
            <span className="px-2 py-1 rounded-xl bg-amber-50 border border-amber-100 font-semibold text-amber-700">
              {weekRangeLabel}
            </span>
            {children.length > 0 && (
              <div className="flex items-center gap-2 ml-2 text-sm">
                <span className="text-gray-600 font-semibold">Child:</span>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-800"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isTeacher && (
              <button
                onClick={handleAddButtonClick}
                className="ml-2 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-semibold shadow hover:shadow-md transition"
              >
                + Add activity
              </button>
            )}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 transition text-gray-700"
                aria-label="Previous week"
              >
                ‹
              </button>
              <button
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 transition text-gray-700"
                aria-label="Next week"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>


      {isTeacher && (
        <form
          ref={formRef}
          onSubmit={handleAdd}
          className="max-w-6xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Day</label>
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              value={form.day}
              onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
            >
              {weekDays.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Start</label>
            <input
              type="time"
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              value={form.start}
              onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">End</label>
            <input
              type="time"
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Title</label>
            <input
              type="text"
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              ref={titleRef}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Lesson name"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Participation</label>
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
              value={form.participation}
              onChange={(e) => setForm((f) => ({ ...f, participation: e.target.value }))}
            >
              {participationOptions.map((p) => (
                <option key={p} value={p}>
                  {participationStyles[p].label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.saveToChild}
                onChange={(e) => setForm((f) => ({ ...f, saveToChild: e.target.checked }))}
              />
              <span>Save to child activities</span>
            </label>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-semibold shadow hover:shadow-md transition"
            >
              Add activity
            </button>
          </div>
        </form>
      )}

      {/* Child activity feed (real data) */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Child activities</h3>
            {loadingActivities && (
              <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
            )}
          </div>
          {activities.length === 0 && !loadingActivities && (
            <div className="text-sm text-gray-500">No activities yet for this child.</div>
          )}
          <div className="grid gap-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {act.type || "Activity"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {act.date ? new Date(act.date).toLocaleDateString() : ""}
                  </div>
                </div>
                <h4 className="mt-1 text-base font-bold text-gray-900">{act.title}</h4>
                {act.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{act.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                  {act.studentEngagement && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                      Engagement: {act.studentEngagement}
                    </span>
                  )}
                  {act.duration && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                      {act.duration} min
                    </span>
                  )}
                  {act.teacher && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                      Teacher: {act.teacher}
                    </span>
                  )}
                </div>
                {act.notes && (
                  <div className="mt-3 text-xs text-gray-600 italic border-l-4 border-orange-400 pl-3">
                    “{act.notes}”
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
        )}
        <div className="min-w-[1080px] max-w-6xl mx-auto grid grid-cols-[160px_repeat(7,1fr)] gap-3">
          {/* Header */}
          <div className="rounded-2xl bg-white border border-gray-200 p-4 text-center font-semibold text-gray-700 shadow-sm">
            Time
          </div>

          {weekDays.map((day) => (
            <div
              key={day.name}
              className="relative rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border border-gray-200 p-4 text-center font-bold text-gray-800 shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_28%)]" />
              <div className="relative">
                <div>{day.name}</div>
                <div className="text-xs font-medium text-gray-500 mt-1">{day.full}</div>
              </div>
            </div>
          ))}

          {/* Rows */}
          {scheduleData.length === 0 && !loading && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
              No activities yet. {isTeacher ? "Add one to start the week." : "Check back soon."}
            </div>
          )}

          {scheduleData.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Time cell */}
              <div className="rounded-2xl bg-white border border-gray-200 p-4 text-center text-sm text-gray-600 shadow-sm">
                <div className="font-semibold text-gray-900">
                  {row.start}
                </div>
                <div className="text-xs text-gray-400">to</div>
                <div className="font-semibold text-gray-900">
                  {row.end}
                </div>
              </div>

              {/* Lessons */}
                  {weekDays.map((day) => {
                    const lesson = row.lessons[day.name];
                return (
                  <div
                    key={day.name}
                    className={`rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow ${
                      lesson ? statusStyles[lesson.status] : "bg-white border border-dashed border-gray-200 text-gray-400"
                    }`}
                  >
                    {lesson ? (
                      <>
                        <div className="text-sm font-semibold leading-tight">
                          {lesson.title}
                        </div>

                        <div className="mt-1 text-xs flex items-center gap-2 font-semibold">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/70 text-gray-700 border border-white/80 shadow">
                            {statusIcons[lesson.status]}
                          </span>
                          <span className="opacity-80">{statusLabel[lesson.status]}</span>
                        </div>


                        {lesson.participation && (
                          <span
                            className={`inline-flex w-fit px-2.5 py-1 rounded-xl text-[11px] font-semibold uppercase tracking-tight ${
                              participationStyles[lesson.participation]?.chip || "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {participationStyles[lesson.participation]?.label || "Participation"}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-xs gap-1">
                        <span className="text-base">—</span>
                        <span>Empty</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {Object.keys(statusLabel).map((key) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-3 py-2 shadow-sm"
          >
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold ${statusStyles[key]}`}>
              {statusIcons[key]}
            </span>
            <div>
              <div className="text-gray-900 font-semibold capitalize">{key}</div>
              <div className="text-xs text-gray-500">{statusLabel[key]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-4 text-xs text-gray-500">
        Tip: Use the “Add activity” button to append a new slot for any day. You can
        extend participation tags to track “great / average / needs support” per lesson.
      </div>
    </div>
  );
}