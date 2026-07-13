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

      .guide-screen { max-width: 560px; padding-top: 12px; }
      .guide-icon { width: 46px; height: 46px; border-radius: 12px; background: #E4EEE3; color: #2A4A40; display:flex; align-items:center; justify-content:center; margin-bottom: 16px; }
      .guide-screen h1 { font-family: 'Noto Serif KR', serif; font-size: 24px; color: #17332C; margin: 0 0 10px; }
      .guide-lead { font-size: 13.5px; color: #55685F; line-height: 1.6; margin-bottom: 18px; }
      .guide-steps { display:flex; flex-direction:column; gap: 12px; padding-left: 20px; margin: 0; }
      .guide-steps li { font-size: 13.5px; color: #3D4F47; line-height: 1.6; }
      .guide-steps strong { color: #17332C; }
      .guide-hint { margin-top: 22px; font-size: 13px; color: #8A6A3B; background: #FBF0DC; padding: 10px 14px; border-radius: 8px; display:inline-block; }

      .autocomplete-wrap { position: relative; }
      .suggestion-list {
        position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 10;
        background: #FFFFFF; border: 1px solid #D6CDBA; border-radius: 8px;
        max-height: 200px; overflow-y: auto; box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      }
      .suggestion-item { display:flex; justify-content:space-between; gap:8px; padding: 8px 12px; font-size: 13px; cursor:pointer; }
      .suggestion-item:hover { background: #F3EEDF; }
      .suggestion-code { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #8A6A3B; }

      .med-diagnosis-row { display:flex; gap:6px; flex-wrap:wrap; margin-top: 8px; }
      .diagnosis-chip { font-size: 11px; background: #EAE2F5; color:#5B3F8C; padding: 2px 8px; border-radius: 20px; }
      .hospital-chip { font-size: 11px; background: #DDEBF3; color:#2C5E7A; padding: 2px 8px; border-radius: 20px; }

      .med-actions { display:flex; flex-direction:column; gap: 6px; flex-shrink:0; }
      .med-edit { background: transparent; border:none; color:#B7C4BC; cursor:pointer; padding: 2px; border-radius: 6px; }
      .med-edit:hover { background:#E4EEE3; color:#2A4A40; }

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
      
      /* 모달 창 가로 길이 고정 및 넘침 현상 원천 차단 */
      .modal { 
        background: #FDFBF6; border-radius: 14px; width: 420px; max-width: 100%; max-height: 90vh; 
        overflow-y: auto; overflow-x: hidden; /* 가로 스크롤 방지 추가 */
        box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 1px solid #E4DCC8; 
      }
      
      .modal-head { display:flex; justify-content:space-between; align-items:center; padding: 18px 20px 0; }
      .modal-head h3 { font-family:'Noto Serif KR', serif; font-size: 17px; color:#17332C; }
      .icon-btn { background:transparent; border:none; cursor:pointer; color:#8A9990; padding:4px; }
      .modal-form { display:flex; flex-direction:column; gap:14px; padding: 16px 20px 22px; }

      /* Grid 찌그러짐 방지용 minmax(0, 1fr) 적용 */
      .two-col { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .three-col { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }

      /* min-width: 0 추가 (그리드 내부에서 강제로 줄어들 수 있게 허용) */
      input, select, textarea {
        width: 100%; min-width: 0; box-sizing: border-box;
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
