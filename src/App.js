import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRFaTdlypbyccXydx5wAG-vgS0blK7QiycXL3GqWez0OO-Fdm7XbfETAyV29R_hVl1/exec";
const ADMIN_HIDDEN_EMAIL = "munezrie@gmail.com"; 
const COLORS = { 
  forest: '#1E2F23', 
  sage: '#C8D5BB', 
  brandGreen: '#457533', 
  mint: '#E9F0E6', 
  white: '#F9FAF8', 
  gold: '#D4AF37', 
  lightGray: '#F4F7F9' 
};

// --- SHARED COMPONENTS ---

const BantayLogo = ({ width = "150px" }) => (
  <img 
    src="/bantay.logo.png" 
    alt="Bantay" 
    style={{ width, height: 'auto', display: 'block', objectFit: 'contain' }} 
    onError={(e) => { e.target.src = "https://via.placeholder.com/150x50?text=BANTAY+PAGADIAN"; }} 
  />
);

const navStyles = {
  wrapper: { display: 'flex', height: '100vh', backgroundColor: COLORS.lightGray, fontFamily: '"Inter", sans-serif', overflow: 'hidden' },
  sidebar: { width: '240px', backgroundColor: COLORS.forest, color: '#FFF', display: 'flex', flexDirection: 'column', padding: '40px 24px' },
  sidebarLink: { padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s ease', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' },
  activeLink: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF' },
  mainContent: { flex: 1, overflowY: 'auto', padding: '60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #E9ECEF' }
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [shortlist, setShortlist] = useState([]);

 const loadData = async () => {
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      setProfiles(Array.isArray(result.profiles) ? result.profiles : (result.data || []));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  // 3. OTP Function (Now correctly INSIDE App)
  const handleSendOTP = async (email) => {
    if (!email) return alert("Please enter your email!");
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "GENERATE_OTP", email: email })
      });
      const result = await response.json();
      if (result.success) alert("Verification code sent!");
    } catch (error) {
      console.error("OTP Error:", error);
    }
  };
}
  useEffect(() => {
    loadData();
  }, []);

  const getAvg = (s) => {
    const a = s?.toString().split(',').map(Number).filter(n => !isNaN(n)) || [];
    return a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "0.0";
  };

  if (user) {
    if (user.email === ADMIN_HIDDEN_EMAIL) {
      return <AdminDash profiles={profiles} onLogout={() => setUser(null)} refresh={loadData} />;
    }
    
    return user.role === 'Worker' ? 
      <WorkerDash user={user} profiles={profiles || []} onLogout={() => setUser(null)} refresh={loadData} /> : 
      <EmployerDash profiles={profiles || []} shortlist={shortlist} setShortlist={setShortlist} getAvg={getAvg} onLogout={() => setUser(null)} refresh={loadData} />;
  }

  return (
    <div style={{ backgroundColor: COLORS.white, minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <nav style={styles.nav}>
        <BantayLogo width="140px" />
        <button onClick={() => setShowAuth(true)} style={styles.btnSec}>Sign In</button>
      </nav>
      <main style={styles.hero}>
        <div style={{ flex: 1.2 }}>
          <h1 style={styles.heroTitle}> Hire/find a job <span style={{color: COLORS.brandGreen}}>for domestic workers</span>.</h1>
          <p style={styles.heroSubText}>Secure profiling system for Pagadian City's domestic services.</p>
          <button onClick={() => setShowAuth(true)} style={styles.btnPriLarge}>Get Started</button>
        </div>
        <div style={styles.graphicBox}>
            <div style={styles.mockCard}>
                <div style={{...styles.badge, marginBottom: '10px'}}>VERIFIED COMMUNITY</div>
                <h3 style={{margin:0, color: '#FFF', fontWeight: '500'}}>Profiling System</h3>
                <p style={{fontSize: '14px', opacity: 0.8, marginTop: '8px'}}>Ensuring safety and quality in every household.</p>
            </div>
        </div>
      </main>
      {showAuth && (
        <div style={styles.modalOverlay}>
          <div style={styles.authCard}>
            <button onClick={() => setShowAuth(false)} style={styles.closeBtn}>CLOSE</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}><BantayLogo width="120px" /></div>
            <AuthPortal onDone={(u) => setUser(u)} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- AUTH COMPONENT ---

const AuthPortal = ({ onDone }) => {}
  const [isReg, setIsReg] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', name: '', role: 'Worker' });
  const [otp, setOtp] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const triggerOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(code);
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "SEND_CODE", email: form.email, code }) });
    setLoading(false); setStep(2);
  };

 const handleVerify = () => userInput === otp ? onDone(form) : alert("Wrong code.");

  return step === 1 ? (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSendOTP(form.email); 
    }}>
      <div style={styles.tabBox}>
        <button type="button" onClick={() => setIsReg(false)} style={!isReg ? styles.tabA : styles.tabI}>LOGIN</button>
        <button type="button" onClick={() => setIsReg(true)} style={isReg ? styles.tabA : styles.tabI}>REGISTER</button>
      </div>
      <select style={styles.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
        <option value="Worker">I AM A WORKER</option>
        <option value="Employer">I AM AN EMPLOYER</option>
      </select>
      <input style={styles.input} placeholder="EMAIL ADDRESS" type="email" required onChange={e => setForm({...form, email: e.target.value})} />
      {isReg && <input style={styles.input} placeholder="FULL NAME" required onChange={e => setForm({...form, name: e.target.value})} />}
      <button type="submit" style={styles.btnPriFull} disabled={loading}>{loading ? "SENDING..." : "CONTINUE"}</button>
    </form>
  ) : (
    <div>
      <p style={{fontSize: '12px', marginBottom: '20px', color: '#666', letterSpacing: '0.5px'}}>Code sent to {form.email}</p>
      <input style={{...styles.input, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px'}} placeholder="000000" onChange={e => setUserInput(e.target.value)} />
      <button onClick={handleVerify} style={styles.btnPriFull}>VERIFY</button>
    </div>
  );

// --- WORKER DASHBOARD ---

const WorkerDash = ({ user, profiles, onLogout, refresh }) => {
  const p = profiles.find(x => x.email === user.email) || {};
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isUploading, setIsUploading] = useState(false);
  const [f, setF] = useState({ 
    name: user.name || p.name || '', 
    skills: p.skills || '', 
    experience: p.experience || '', 
    contact: p.contact || '',
    location: p.location || '',
    availability: p.availability || 'Full-time',
    photoUrl: p.photoUrl || '' 
  });

  const save = async () => {
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "SAVE_PROFILE", ...f, email: user.email, role: 'Worker' }) });
    alert("Profile Updated"); refresh();
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      const base64Data = reader.result; // Full data URL string

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            action: "UPLOAD_DOC", // Matches your switch case in Apps Script
            email: user.email,
            fileName: `${docType}_${user.email}_${file.name}`,
            base64: base64Data // Matches params.base64 in your script
          })
        });
        alert(`${docType} upload request sent! Check BANTAY_VAULT folder.`);
      } catch (err) {
        console.error(err);
        alert("Upload failed.");
      } finally {
        setIsUploading(false);
        e.target.value = null; // Clear the input
      }
    };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'MESSAGES':
        return (
          <div style={styles.card}>
            <h3 style={styles.label}>Recent Notifications</h3>
            <p style={{fontSize: '13px', color: '#666'}}>Welcome to Bantay! Upload your ID to start finding jobs.</p>
          </div>
        );
      case 'DOCUMENTS':
        return (
          <div style={styles.card}>
            <h3 style={styles.label}>Secure Document Vault</h3>
            <p style={{fontSize: '12px', color: '#666', marginBottom: '20px'}}>Files uploaded here go directly to our encrypted storage for verification.</p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {['Government ID', 'NBI Clearance', 'Health Certificate'].map((docName, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#F8F9FA', borderRadius: '6px', border: '1px solid #E9ECEF' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{docName}</span>
                  <input type="file" id={`file-${i}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, docName.replace(/ /g, "_"))} />
                  <button 
                    disabled={isUploading} 
                    onClick={() => document.getElementById(`file-${i}`).click()} 
                    style={{...styles.btnSecSmall, opacity: isUploading ? 0.5 : 1}}
                  >
                    {isUploading ? "UPLOADING..." : "UPLOAD"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
            <div style={{...styles.card, textAlign: 'center'}}>
              <label style={styles.label}>Profile Photo</label>
              <div style={{width:'100%', height:'300px', backgroundColor: '#EEE', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px'}}>
                  <img src={f.photoUrl || "https://via.placeholder.com/300x300?text=No+Photo"} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
              </div>
              <input style={{...styles.input, fontSize: '12px'}} placeholder="Paste Image URL here" value={f.photoUrl} onChange={e => setF({...f, photoUrl: e.target.value})} />
              <div style={{marginTop: '20px', fontSize: '11px', fontWeight: '700', color: p.verified === "Yes" ? COLORS.brandGreen : '#D97706', textTransform: 'uppercase'}}>
                 {p.verified === "Yes" ? "Status: Verified ✅" : "Status: Verification Pending ⏳"}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.gridForm}>
                <div style={{gridColumn: '1/3'}}><label style={styles.label}>Full Name</label><input style={styles.input} value={f.name} onChange={e => setF({...f, name: e.target.value})} /></div>
                <div><label style={styles.label}>Main Skill (e.g. Cooking, Nanny)</label><input style={styles.input} value={f.skills} onChange={e => setF({...f, skills: e.target.value})} /></div>
                <div><label style={styles.label}>General Location</label><input style={styles.input} value={f.location} onChange={e => setF({...f, location: e.target.value})} /></div>
                <div style={{gridColumn: '1/3'}}><label style={styles.label}>Work Experience & Bio</label>
                  <textarea style={{...styles.input, height: '180px'}} value={f.experience} onChange={e => setF({...f, experience: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={navStyles.wrapper}>
      <div style={navStyles.sidebar}>
        <BantayLogo width="110px" />
        <div style={{ marginTop: '60px', flex: 1 }}>
          <div style={{...navStyles.sidebarLink, ...(activeTab === 'PROFILE' ? navStyles.activeLink : {})}} onClick={() => setActiveTab('PROFILE')}>Profile</div>
          <div style={{...navStyles.sidebarLink, ...(activeTab === 'DOCUMENTS' ? navStyles.activeLink : {})}} onClick={() => setActiveTab('DOCUMENTS')}>Documents</div>
          <div style={{...navStyles.sidebarLink, ...(activeTab === 'MESSAGES' ? navStyles.activeLink : {})}} onClick={() => setActiveTab('MESSAGES')}>Notifications</div>
        </div>
        <button onClick={onLogout} style={{...navStyles.sidebarLink, background: 'none', border: 'none', marginTop: 'auto', cursor: 'pointer'}}>Logout</button>
      </div>
      <div style={navStyles.mainContent}>
        <div style={navStyles.header}>
          <div>
            <h1 style={{margin: 0, fontSize: '24px', fontWeight: '600', color: COLORS.forest}}>Welcome, {f.name || 'Worker'}</h1>
            <p style={{fontSize: '13px', color: '#6C757D', marginTop: '4px'}}>Manage your digital profile and documents</p>
          </div>
          {activeTab === 'PROFILE' && <button style={styles.btnPriSmall} onClick={save}>Save Changes</button>}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// --- EMPLOYER DASHBOARD ---

const EmployerDash = ({ profiles, shortlist, setShortlist, getAvg, onLogout, refresh }) => {
  const [activeTab, setActiveTab] = useState('DISCOVER'); 
  const [filter, setFilter] = useState('');

  const workers = profiles.filter(p => {
    const isWorker = p.role === 'Worker' && p.verified === "Yes";
    const matchesSearch = `${p.skills} ${p.location} ${p.name}`.toLowerCase().includes(filter.toLowerCase());
    if (activeTab === 'SHORTLIST') return isWorker && matchesSearch && shortlist.includes(p.email);
    return isWorker && matchesSearch;
  });

  const renderContent = () => (
    <div style={styles.grid}>
      {workers.length > 0 ? workers.map((p, i) => (
        <div key={i} style={{...styles.card, padding: 0, overflow: 'hidden'}}>
          <div style={{position: 'relative', height: '220px', backgroundColor: '#EEE'}}>
            <img src={p.photoUrl || "https://via.placeholder.com/300x200?text=No+Photo"} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="" />
            <button onClick={() => setShortlist(s => s.includes(p.email) ? s.filter(ev => ev !== p.email) : [...s, p.email])} style={{...styles.favBtn, color: shortlist.includes(p.email) ? '#E63946' : '#CCC'}}>
                {shortlist.includes(p.email) ? '❤️ SAVED' : '🤍 SAVE'}
            </button>
          </div>
          <div style={{padding: '24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
              <h4 style={{margin:0, fontWeight: '600'}}>{p.name}</h4>
              <span style={{fontSize: '11px', fontWeight: '800', color: COLORS.gold}}>★ {getAvg(p.ratings)}</span>
            </div>
            <p style={{fontSize: '11px', color: COLORS.brandGreen, margin: '8px 0', fontWeight: '700', textTransform: 'uppercase'}}>{p.skills || 'General Domestic'}</p>
            <p style={{fontSize: '12px', color: '#666', height: '40px', overflow: 'hidden'}}>{p.experience}</p>
            <button style={{...styles.btnPriSmall, width: '100%', marginTop: '16px'}}>VIEW FULL PROFILE</button>
          </div>
        </div>
      )) : <p style={{gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, marginTop: '40px'}}>No verified professionals match your search.</p>}
    </div>
  );

  return (
    <div style={navStyles.wrapper}>
      <div style={{...navStyles.sidebar, backgroundColor: '#232F3E'}}>
        <BantayLogo width="110px" />
        <div style={{ marginTop: '60px', flex: 1 }}>
          <div style={{...navStyles.sidebarLink, ...(activeTab === 'DISCOVER' ? navStyles.activeLink : {})}} onClick={() => setActiveTab('DISCOVER')}>DISCOVER</div>
          <div style={{...navStyles.sidebarLink, ...(activeTab === 'SHORTLIST' ? navStyles.activeLink : {})}} onClick={() => setActiveTab('SHORTLIST')}>SHORTLIST ({shortlist.length})</div>
        </div>
        <button onClick={onLogout} style={{...navStyles.sidebarLink, background: 'none', border: 'none', marginTop: 'auto', cursor: 'pointer'}}>LOGOUT</button>
      </div>
      <div style={navStyles.mainContent}>
        <div style={navStyles.header}>
          <div><h1 style={{margin: 0, fontSize: '24px', fontWeight: '600'}}>{activeTab === 'DISCOVER' ? 'Find Professionals' : 'Saved Shortlist'}</h1></div>
          <input style={{...styles.input, width: '320px', marginBottom: 0}} placeholder="Search by skill or location..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---

const AdminDash = ({ profiles, onLogout, refresh }) => {
  const verify = async (p) => { 
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "SAVE_PROFILE", ...p, verified: "Yes" }) }); 
    alert("User Verified!"); refresh(); 
  };
  
  const del = async (email) => { 
    if(window.confirm("Are you sure you want to remove this user?")) {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "DELETE_USER", targetEmail: email }) }); 
      refresh(); 
    }
  };

  return (
    <div style={{ padding: '80px 10%' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: '40px'}}>
        <BantayLogo width="110px" />
        <h2 style={{margin: 0, color: COLORS.forest}}>System Administration</h2>
        <button onClick={onLogout} style={styles.btnSecSmall}>LOGOUT</button>
      </div>
      <div style={{...styles.card, padding: 0, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
            <thead style={{textAlign:'left', background: COLORS.forest, color: '#FFF'}}>
                <tr>
                    <th style={{padding: '20px', fontWeight: '500'}}>USER DETAILS</th>
                    <th style={{fontWeight: '500'}}>ROLE</th>
                    <th style={{fontWeight: '500'}}>STATUS</th>
                    <th style={{fontWeight: '500', textAlign: 'right', paddingRight: '20px'}}>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No profiles found in the database.</td></tr>
              ) : (
                profiles.map((p, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #F1F3F5'}}>
                    <td style={{padding: '20px'}}>{p.name || 'Unnamed'} <br/><span style={{opacity: 0.5, fontSize: '11px'}}>{p.email}</span></td>
                    <td style={{fontSize: '11px', fontWeight: '600'}}>{p.role}</td>
                    <td style={{fontWeight: '700', color: p.verified === 'Yes' ? COLORS.brandGreen : '#D97706', fontSize: '11px'}}>{p.verified === 'Yes' ? 'VERIFIED' : 'PENDING'}</td>
                    <td style={{textAlign: 'right', paddingRight: '20px'}}>
                      {p.role === 'Worker' && p.verified !== 'Yes' && (
                        <button onClick={() => verify(p)} style={{background:'none', border:'none', color: COLORS.brandGreen, fontWeight: '700', marginRight: '15px', cursor: 'pointer'}}>APPROVE</button>
                      )}
                      <button onClick={() => del(p.email)} style={{background:'none', border:'none', color: '#E63946', fontWeight: '700', cursor: 'pointer'}}>DELETE</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
};

// --- STYLES ---

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', padding: '30px 8%', alignItems: 'center' },
  hero: { display: 'flex', padding: '60px 8%', alignItems: 'center', gap: '80px', maxWidth: '1400px', margin: '0 auto' },
  heroTitle: { fontSize: '4rem', fontWeight: '700', color: COLORS.forest, lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' },
  heroSubText: { fontSize: '1.1rem', color: '#555', marginBottom: '40px', maxWidth: '480px', lineHeight: '1.6' },
  btnPriLarge: { padding: '16px 36px', background: COLORS.forest, color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  btnSec: { padding: '10px 24px', background: 'none', border: `1px solid ${COLORS.forest}`, borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecSmall: { padding: '8px 16px', background: 'none', border: `1px solid ${COLORS.forest}`, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' },
  btnPriSmall: { padding: '12px 20px', background: COLORS.forest, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  btnPriFull: { width: '100%', padding: '16px', background: COLORS.forest, color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', marginTop: '10px' },
  graphicBox: { flex: 0.8, background: '#DDD', height: '480px', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '40px', backgroundImage: 'url("https://images.unsplash.com/photo-1581578731522-745d05cb9704?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center' },
  mockCard: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.2)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(30,47,35,0.4)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  authCard: { background: '#FFF', padding: '60px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '10px', fontWeight: '800', cursor: 'pointer', opacity: 0.4 },
  input: { width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '4px', border: `1px solid #E9ECEF`, boxSizing: 'border-box', fontSize: '13px' },
  label: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#ADB5BD', marginBottom: '8px', textTransform: 'uppercase' },
  tabBox: { display: 'flex', marginBottom: '32px' },
  tabA: { flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${COLORS.forest}`, fontWeight: '700', cursor: 'pointer', fontSize: '11px' },
  tabI: { flex: 1, padding: '12px', background: 'none', border: 'none', opacity: 0.2, cursor: 'pointer', fontSize: '11px', fontWeight: '700' },
  card: { background: '#FFF', padding: '32px', borderRadius: '8px', border: '1px solid #E9ECEF' },
  favBtn: { position: 'absolute', top: '16px', right: '16px', background: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' },
  badge: { padding: '4px 8px', background: COLORS.mint, borderRadius: '4px', fontSize: '10px', fontWeight: '800', color: COLORS.brandGreen, display: 'inline-block' },
  gridForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
};