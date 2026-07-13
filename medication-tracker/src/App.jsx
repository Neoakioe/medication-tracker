import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Pill, RefreshCw, X, Search, Clock } from "lucide-react";
import { supabase } from "./supabaseClient";

const TIMING_OPTS = ["아침", "점심", "저녁", "취침전", "PRN(필요시)"];

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function App() {
  const [patients, setPatients] = useState([]); // array of {id,name,birth,gender,memo,medications:[...]}
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [query, setQuery] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showNewMed, setShowNewMed] = useState(false);
  const [error, setError] = useState("");
  const channelRef = useRef(null);

  const fetchAll = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    else setSyncing(true);
    try {
      const { data, error: err } = await supabase
        .from("patients")
        .select("*, medications(*)")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setPatients(data || []);
      setError("");
    } catch (e) {
      setError("데이터를 불러오지 못했어요: " + e.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(false);

    const channel = supabase
      .channel("db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () =>
        fetchAll(true)
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "medications" }, () =>
        fetchAll(true)
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (!activeId && patients.length > 0) setActiveId(patients[0].id);
    if (activeId && !patients.find((p) => p.id === activeId) && patients.length > 0) {
      setActiveId(patients[0].id);
    }
    if (patients.length === 0) setActiveId(null);
  }, [patients, activeId]);

  const addPatient = async ({ name, birth, gender, memo }) => {
    const { error: err } = await supabase
      .from("patients")
      .insert({ name, birth, gender, memo })
      .select()
      .single();
    if (err) {
      setError("등록에 실패했어요: " + err.message);
      return;
    }
    setShowNewPatient(false);
    fetchAll(true);
  };

  const removePatient = async (id) => {
    const { error: err } = await supabase.from("patients").delete().eq("id", id);
    if (err) setError("삭제에 실패했어요: " + err.message);
    fetchAll(true);
  };

  const addMed = async (patientId, med) => {
    const { error: err } = await supabase.from("medications").insert({
      patient_id: patientId,
      ...med,
    });
    if (err) {
      setError("약 추가에 실패했어요: " + err.message);
      return;
    }
    setShowNewMed(false);
    fetchAll(true);
  };

  const removeMed = async (medId) => {
    const { error: err } = await supabase.from("medications").delete().eq("id", medId);
    if (err) setError("삭제에 실패했어요: " + err.message);
    fetchAll(true);
  };

  const active = patients.find((p) => p.id === activeId) || null;
  const filtered = patients.filter((p) =>
    query.trim() ? p.name.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Rx</div>
          <div>
            <div className="brand-title">복약 대장</div>
            <div className="brand-sub">사람별 복용약 기록</div>
          </div>
        </div>

        <div className="search-row">
          <Search size={14} strokeWidth={2.5} />
          <input placeholder="이름으로 찾기" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <button className="add-patient-btn" onClick={() => setShowNewPatient(true)}>
          <Plus size={16} /> 새 인원 등록
        </button>

        <div className="patient-list">
          {loading && <div className="empty-note">불러오는 중…</div>}
          {!loading && filtered.length === 0 && (
            <div className="empty-note">
              {patients.length === 0 ? "아직 등록된 인원이 없어요." : "일치하는 이름이 없어요."}
            </div>
          )}
          {filtered.map((p) => (
            <div
              key={p.id}
              className={"patient-row" + (p.id === activeId ? " active" : "")}
              onClick={() => setActiveId(p.id)}
            >
              <div className="patient-avatar">{p.name?.[0] || "?"}</div>
              <div className="patient-meta">
                <div className="patient-name">{p.name}</div>
                <div className="patient-sub">
                  {p.gender ? p.gender + " · " : ""}
                  {p.birth || "생년월일 미입력"}
                </div>
              </div>
              <div className="patient-count">{p.medications?.length || 0}</div>
            </div>
          ))}
        </div>

        <div className="sync-status">
          <RefreshCw size={12} className={syncing ? "spin" : ""} />
          <span>{syncing ? "동기화 중" : "실시간 연결됨"}</span>
        </div>
      </aside>

      <main className="main">
        {error && <div className="error-banner">{error}</div>}
        {!active && !loading && (
          <div className="placeholder">
            <Pill size={28} strokeWidth={1.5} />
            <p>왼쪽에서 인원을 선택하거나 새로 등록해주세요.</p>
          </div>
        )}

        {active && (
          <>
            <header className="detail-header">
              <div>
                <div className="detail-eyebrow">환자 정보</div>
                <h1>{active.name}</h1>
                <div className="detail-tags">
                  {active.gender && <span className="tag">{active.gender}</span>}
                  {active.birth && <span className="tag">{active.birth}</span>}
                  <span className="tag muted">복용약 {active.medications?.length || 0}건</span>
                </div>
                {active.memo && <p className="memo">{active.memo}</p>}
              </div>
              <button className="danger-btn" onClick={() => removePatient(active.id)}>
                <Trash2 size={14} /> 인원 삭제
              </button>
            </header>

            <div className="med-section-head">
              <h2>복용 중인 약</h2>
              <button className="add-med-btn" onClick={() => setShowNewMed(true)}>
                <Plus size={15} /> 약 추가
              </button>
            </div>

            {(!active.medications || active.medications.length === 0) && (
              <div className="empty-meds">등록된 약이 없어요. "약 추가"로 시작해보세요.</div>
            )}

            <div className="med-grid">
              {(active.medications || [])
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map((m, i) => (
                  <div className="med-card" key={m.id}>
                    <div className="med-index">{String(i + 1).padStart(2, "0")}</div>
                    <div className="med-body">
                      <div className="med-name-row">
                        <span className="med-name">{m.name}</span>
                        {m.code && <span className="med-code">{m.code}</span>}
                      </div>
                      <div className="med-dose-row">
                        {m.dose && <span>1회 {m.dose}</span>}
                        {m.freq && <span>· 1일 {m.freq}회</span>}
                        {m.days && <span>· {m.days}일분</span>}
                      </div>
                      {m.timing?.length > 0 && (
                        <div className="timing-row">
                          <Clock size={12} />
                          {m.timing.map((t) => (
                            <span className="timing-chip" key={t}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.note && <div className="med-note">{m.note}</div>}
                    </div>
                    <button className="med-remove" onClick={() => removeMed(m.id)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}
      </main>

      {showNewPatient && (
        <NewPatientModal onClose={() => setShowNewPatient(false)} onSubmit={addPatient} />
      )}
      {showNewMed && active && (
        <NewMedModal onClose={() => setShowNewMed(false)} onSubmit={(m) => addMed(active.id, m)} />
      )}

      <GlobalStyles />
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NewPatientModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit({ name: name.trim(), birth: birth.trim(), gender, memo: memo.trim() });
    setSaving(false);
  };

  return (
    <ModalShell title="새 인원 등록" onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <Field label="이름 / 별칭">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 최수원" required />
        </Field>
        <div className="two-col">
          <Field label="생년월일">
            <input value={birth} onChange={(e) => setBirth(e.target.value)} placeholder="예: 1984.10 (연-월만 권장)" />
          </Field>
          <Field label="성별">
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">선택 안 함</option>
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </Field>
        </div>
        <Field label="메모 (선택)">
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} placeholder="알레르기, 특이사항 등" />
        </Field>
        <div className="hint-note">주민등록번호 전체 등 민감정보는 입력하지 않는 걸 권장해요.</div>
        <button className="submit-btn" type="submit" disabled={saving}>
          {saving ? "저장 중…" : "등록"}
        </button>
      </form>
    </ModalShell>
  );
}

function NewMedModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState("");
  const [days, setDays] = useState("");
  const [timing, setTiming] = useState([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTiming = (t) => {
    setTiming((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      code: code.trim(),
      dose: dose.trim(),
      freq: freq.trim(),
      days: days.trim(),
      timing,
      note: note.trim(),
    });
    setSaving(false);
  };

  return (
    <ModalShell title="약 추가" onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <Field label="약품명">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 쿠에타핀정 300밀리그람"
            required
          />
        </Field>
        <Field label="코드 (선택)">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="예: QTP300" />
        </Field>
        <div className="three-col">
          <Field label="1회 투여량">
            <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="예: 2정" />
          </Field>
          <Field label="1일 횟수">
            <input value={freq} onChange={(e) => setFreq(e.target.value)} placeholder="예: 1" />
          </Field>
          <Field label="처방 일수">
            <input value={days} onChange={(e) => setDays(e.target.value)} placeholder="예: 30" />
          </Field>
        </div>
        <Field label="복용 시점">
          <div className="chip-row">
            {TIMING_OPTS.map((t) => (
              <button
                type="button"
                key={t}
                className={"chip" + (timing.includes(t) ? " chip-on" : "")}
                onClick={() => toggleTiming(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="메모 (선택)">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 식후 30분" />
        </Field>
        <button className="submit-btn" type="submit" disabled={saving}>
          {saving ? "저장 중…" : "추가"}
        </button>
      </form>
    </ModalShell>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@600;700&display=swap');

      * { box-sizing: border-box; }
      body, .app { font-family: 'Noto Sans KR', sans-serif; margin: 0; }

      .field { display:flex; flex-direction:column; gap:6px; }
      .field-label { font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:#5b7069; font-family:'IBM Plex Mono', monospace; }

      .app { display: flex; min-height: 100vh; background: #F1F4F0; color: #1E2B26; }

      .sidebar {
        width: 300px; flex-shrink: 0; background: #17332C; color: #E9F1EC;
        display: flex; flex-direction: column; padding: 22px 18px; gap: 16px;
      }
      .brand { display:flex; align-items:center; gap:12px; }
      .brand-mark {
        width: 40px; height: 40px; border-radius: 10px; background: #C98A3F; color: #17332C;
        display:flex; align-items:center; justify-content:center;
        font-family: 'Noto Serif KR', serif; font-weight: 700; font-size: 17px;
      }
      .brand-title { font-family: 'Noto Serif KR', serif; font-size: 18px; font-weight: 700; }
      .brand-sub { font-size: 11px; color: #9FBDAF; letter-spacing: .03em; margin-top: 2px; }

      .search-row {
        display:flex; align-items:center; gap:8px; background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 8px 10px; color: #C7DBD1;
      }
      .search-row input { background: transparent; border: none; outline: none; color: #E9F1EC; font-size: 13px; width: 100%; }
      .search-row input::placeholder { color: #7C9C8D; }

      .add-patient-btn {
        display:flex; align-items:center; justify-content:center; gap:6px;
        background: #C98A3F; color: #17332C; border: none;
        padding: 10px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;
      }
      .add-patient-btn:hover { background: #DA9A4C; }

      .patient-list { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:4px; margin: -4px -6px; padding: 4px 6px; }
      .empty-note { color: #7C9C8D; font-size: 12.5px; padding: 14px 4px; line-height:1.5; }

      .patient-row { display:flex; align-items:center; gap:10px; padding: 9px 8px; border-radius: 8px; cursor:pointer; }
      .patient-row:hover { background: rgba(255,255,255,0.06); }
      .patient-row.active { background: rgba(201,138,63,0.22); }
      .patient-avatar {
        width: 30px; height: 30px; border-radius: 50%; background: #2A4A40; color: #E9F1EC;
        display:flex; align-items:center; justify-content:center; font-size: 13px; font-weight: 600; flex-shrink:0;
      }
      .patient-name { font-size: 13.5px; font-weight: 600; }
      .patient-sub { font-size: 11px; color: #8FB0A0; margin-top:1px; }
      .patient-count {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #C98A3F;
        background: rgba(201,138,63,0.14); padding: 2px 7px; border-radius: 20px;
      }

      .sync-status { display:flex; align-items:center; gap:6px; font-size: 10.5px; color: #6F9483;
        border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .main { flex:1; padding: 34px 44px; overflow-y:auto; }
      .error-banner { background: #FBE7E4; color: #9B3B2E; border: 1px solid #F0BDB4; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 18px; }
      .placeholder { height: 60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 12px; color: #6E8378; }

      .detail-header { display:flex; justify-content:space-between; align-items:flex-start; gap: 20px; margin-bottom: 30px; }
      .detail-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8A6A3B; }
      .detail-header h1 { font-family: 'Noto Serif KR', serif; font-size: 32px; margin: 4px 0 10px; color: #17332C; }
      .detail-tags { display:flex; gap:8px; flex-wrap:wrap; }
      .tag { font-size: 12px; padding: 4px 10px; border-radius: 20px; background: #E4EEE3; color: #2A4A40; font-weight: 500; }
      .tag.muted { background: #EFE6D8; color: #8A6A3B; }
      .memo { margin-top: 10px; font-size: 13px; color: #55685F; max-width: 480px; }

      .danger-btn {
        display:flex; align-items:center; gap:6px; background: transparent; border: 1px solid #E0B8AF; color: #9B3B2E;
        padding: 8px 12px; border-radius: 8px; font-size: 12.5px; cursor:pointer; white-space: nowrap;
      }
      .danger-btn:hover { background: #FBE7E4; }

      .med-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; }
      .med-section-head h2 { font-family: 'Noto Serif KR', serif; font-size: 18px; color: #17332C; }
      .add-med-btn {
        display:flex; align-items:center; gap:6px; background: #17332C; color: #E9F1EC; border:none;
        padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor:pointer;
      }
      .add-med-btn:hover { background: #1F4438; }

      .empty-meds { border: 1px dashed #C7D6CD; border-radius: 10px; padding: 30px; text-align:center; color: #7C9186; font-size: 13.5px; }

      .med-grid { display:flex; flex-direction:column; gap: 10px; }
      .med-card { display:flex; align-items:flex-start; gap: 14px; background: #FFFFFF; border: 1px solid #DDE7DA; border-radius: 10px; padding: 14px 16px; position: relative; }
      .med-index { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #C98A3F; font-weight: 600; padding-top: 2px; width: 22px; flex-shrink:0; }
      .med-body { flex:1; }
      .med-name-row { display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
      .med-name { font-size: 15px; font-weight: 600; color: #17332C; }
      .med-code { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #8A6A3B; background:#F3E9D6; padding:1px 6px; border-radius:4px; }
      .med-dose-row { display:flex; gap:6px; font-size: 12.5px; color: #55685F; margin-top: 4px; flex-wrap: wrap; }
      .timing-row { display:flex; align-items:center; gap:6px; margin-top:8px; color:#7C9186; }
      .timing-chip { font-size: 11px; background: #EEF3EC; color:#3D554B; padding: 2px 8px; border-radius: 20px; }
      .med-note { font-size: 12px; color: #93867A; margin-top: 6px; font-style: italic; }
      .med-remove { background: transparent; border:none; color:#B7C4BC; cursor:pointer; padding: 2px; border-radius: 6px; flex-shrink:0; }
      .med-remove:hover { background:#FBE7E4; color:#9B3B2E; }

      .modal-overlay { position: fixed; inset:0; background: rgba(23,51,44,0.45); display:flex; align-items:center; justify-content:center; z-index: 50; padding: 20px; }
      .modal { background: #FDFBF6; border-radius: 14px; width: 420px; max-width: 100%; max-height: 90vh; overflow-y:auto; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 1px solid #E4DCC8; }
      .modal-head { display:flex; justify-content:space-between; align-items:center; padding: 18px 20px 0; }
      .modal-head h3 { font-family:'Noto Serif KR', serif; font-size: 17px; color:#17332C; }
      .icon-btn { background:transparent; border:none; cursor:pointer; color:#8A9990; padding:4px; }
      .modal-form { display:flex; flex-direction:column; gap:14px; padding: 16px 20px 22px; }

      .two-col { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .three-col { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

      input, select, textarea {
        border: 1px solid #D6CDBA; border-radius: 7px; padding: 8px 10px; font-size: 13.5px;
        font-family: 'Noto Sans KR', sans-serif; color: #1E2B26; background: #FFFFFF; outline: none;
      }
      input:focus, select:focus, textarea:focus { border-color: #C98A3F; }
      textarea { resize: vertical; }

      .chip-row { display:flex; gap:6px; flex-wrap:wrap; }
      .chip { border: 1px solid #D6CDBA; background:#FFFFFF; color:#55685F; border-radius: 20px; padding: 6px 12px; font-size: 12px; cursor:pointer; }
      .chip-on { background: #17332C; border-color:#17332C; color:#E9F1EC; }

      .hint-note { font-size: 11.5px; color: #9B7C4A; background:#FBF0DC; padding:8px 10px; border-radius:7px; }

      .submit-btn { background: #C98A3F; color:#17332C; border:none; font-weight:600; padding: 10px; border-radius: 8px; font-size: 14px; cursor:pointer; margin-top: 4px; }
      .submit-btn:hover { background:#DA9A4C; }
      .submit-btn:disabled { opacity: .6; cursor: default; }

      @media (max-width: 720px) {
        .app { flex-direction: column; }
        .sidebar { width: 100%; }
        .main { padding: 22px; }
        .three-col { grid-template-columns: 1fr; }
        .two-col { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
