import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzuyVXlxfmlbK_IzDbdxZjEbG0hBTc4TCTYKhhkSMDt63SWqX0xqNi5eqeQGZz0-cJ/exec";
const ADMIN_EMAIL = "munezrie@gmail.com"; 
const FALLBACK_PROFILE_IMG = "https://ui-avatars.com/api/?name=User&background=74ae08&color=fff";
const BANNER_IMG = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1600";

const THEME = {
  avocado: '#74ae08',
  white: '#FFFFFF',
  black: '#021c02',
  border: 'rgba(255, 255, 255, 0.1)',
  glass: 'rgba(255, 255, 255, 0.05)'
};

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bantay_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState('Home'); 
  const [portalTab, setPortalTab] = useState('Profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(['Welcome to Bantay!', 'Please complete your profile.']);
  
  // Updated: Track target by email and name
  const [activeMessagingTarget, setActiveMessagingTarget] = useState(null);

  const [coeRequests, setCoeRequests] = useState([
    { id: 101, workerName: "Juan Dela Cruz", date: "2026-03-08", status: "pending", role: "Housekeeper" }
  ]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bantay_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('bantay_session');
    }
  }, [user]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching profiles from:", SCRIPT_URL);
      const response = await fetch(SCRIPT_URL);
      console.log("📊 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Raw data received:", data);
      
      const allProfiles = data.profiles || [];
      console.log("👥 Profiles count:", allProfiles.length);
      console.log("👥 First profile:", allProfiles[0]);
      
      setProfiles(allProfiles);
      
      if (user) {
        const updatedUser = allProfiles.find(p => p.email.toLowerCase() === user.email.toLowerCase());
        if (updatedUser) setUser(updatedUser);
      }
    } catch (e) { 
      console.error("❌ Fetch error:", e);
      // Fallback to test data if fetch fails
      console.log("⚠️ Using test data due to fetch error");
      setProfiles([
        { name: 'Maria Santos', role: 'Worker', skills: 'Housekeeper', location: 'Pagadian City', experience: '3 years', dob: '1992-05-15', email: 'maria@test.com', photourl: '' },
        { name: 'Juan Dela Cruz', role: 'Worker', skills: 'Gardener', location: 'Pagadian City', experience: '5 years', dob: '1990-03-20', email: 'juan@test.com', photourl: '' }
      ]);
    }
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleLogin = (authData) => {
    const existingUser = profiles.find(p => p.email.toLowerCase() === authData.email.toLowerCase());
    const sessionData = existingUser || authData;
    setUser(sessionData);
  };

  // Fixed: Passing full worker object to get Email
  const handleStartConversation = (worker) => {
    setActiveMessagingTarget({ name: worker.name, email: worker.email });
    setView('Portal');
    setPortalTab('Messages');
  };

 const handleUpdateProfile = async (profileData) => {
  setLoading(true);
  const finalPhoto = tempPhoto || user.photourl;
  const updatedRecord = { ...profileData, photourl: finalPhoto, email: user.email, role: user.role };
  
  setUser(updatedRecord);
  setProfiles(prev => {
    const exists = prev.find(p => p.email === user.email);
    if (exists) return prev.map(p => p.email === user.email ? updatedRecord : p);
    return [updatedRecord, ...prev];
  });

  try {
    await fetch(SCRIPT_URL, { 
      method: 'POST', 
      mode: 'no-cors', 
      body: JSON.stringify({ action: 'updateProfile', ...updatedRecord }) 
    });
    alert("Account data saved successfully!");
    setView('Home'); 
  } catch (e) { console.error("Sync Error:", e); }
  setLoading(false);
};
  if (!user) return <AuthGate onLogin={handleLogin} />;

  const filteredWorkers = profiles.filter(p => 
    p.role?.toLowerCase() === 'worker' &&
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.skills?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: THEME.black, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="websitelogo.png" alt="Logo" style={{ height: '80px' }} />
          {notifications.length > 0 && <div title="Notifications" style={styles.notifBadge}>{notifications.length}</div>}
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={view === 'Home' ? styles.navActive : styles.navLink} onClick={() => setView('Home')}>Browse Workers</span>
          <button style={styles.portalBtn} onClick={() => { setView('Portal'); setPortalTab('Profile'); }}>
            {user.role} Dashboard
          </button>
          {isAdmin && (
            <button style={{ ...styles.portalBtn, background: '#e74c3c' }} onClick={() => { setView('Admin'); setPortalTab('Stats'); }}>
              Admin Panel
            </button>
          )}
          <button style={styles.logoutBtn} onClick={() => setUser(null)}>Logout</button>
        </div>
      </nav>

      <main>
        {view === 'Home' && (
          <HomeView filteredWorkers={filteredWorkers} user={user} setSearchQuery={setSearchQuery} onStartMsg={handleStartConversation} />
        )}

        {(view === 'Portal' || view === 'Admin') && (
          <div style={styles.portalContainer}>
            <aside style={styles.sidebar}>
              <h3 style={{ opacity: 0.4, fontSize: '11px', letterSpacing: '2px', marginBottom: '30px' }}>
                {view === 'Admin' ? 'SYSTEM CONTROL' : `SESSION: ${user.email}`}
              </h3>
              {view === 'Admin' ? (
                <>
                  <div onClick={() => setPortalTab('Stats')} style={portalTab === 'Stats' ? styles.tabActive : styles.tabInactive}>Website Status</div>
                  <div onClick={() => setPortalTab('WorkersList')} style={portalTab === 'WorkersList' ? styles.tabActive : styles.tabInactive}>Workers List</div>
                  <div onClick={() => setPortalTab('EmployersList')} style={portalTab === 'EmployersList' ? styles.tabActive : styles.tabInactive}>Employers List</div>
                </>
              ) : (
                <>
                  <div onClick={() => setPortalTab('Profile')} style={portalTab === 'Profile' ? styles.tabActive : styles.tabInactive}>My Account</div>
                  <div onClick={() => setPortalTab('Messages')} style={portalTab === 'Messages' ? styles.tabActive : styles.tabInactive}>Messages</div>
                  {user.role === 'Employer' ? (
                    <>
                      <div onClick={() => setPortalTab('GovDocs')} style={portalTab === 'GovDocs' ? styles.tabActive : styles.tabInactive}>Identity Verification</div>
                      <div onClick={() => setPortalTab('HiredList')} style={portalTab === 'HiredList' ? styles.tabActive : styles.tabInactive}>Hired Workers</div>
                    </>
                  ) : (
                    <>
                      <div onClick={() => setPortalTab('Jobs')} style={portalTab === 'Jobs' ? styles.tabActive : styles.tabInactive}>Job Board</div>
                      <div onClick={() => setPortalTab('GovDocs')} style={portalTab === 'GovDocs' ? styles.tabActive : styles.tabInactive}>Documents</div>
                    </>
                  )}
                </>
              )}
            </aside>

            <section style={styles.editorPanel}>
              {view === 'Admin' && portalTab === 'Stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <StatCard label="Total Users" val={profiles.length} />
                  <StatCard label="Workers" val={profiles.filter(p => p.role === 'Worker').length} />
                  <StatCard label="Employers" val={profiles.filter(p => p.role === 'Employer').length} />
                </div>
              )}
              {view === 'Admin' && portalTab === 'WorkersList' && <AdminTable title="Master Worker Registry" data={profiles.filter(p => p.role === 'Worker')} />}
              {view === 'Admin' && portalTab === 'EmployersList' && <AdminTable title="Master Employer Registry" data={profiles.filter(p => p.role === 'Employer')} />}

              {view === 'Portal' && portalTab === 'Profile' && (
                <ProfileEditor user={user} loading={loading} tempPhoto={tempPhoto} setTempPhoto={setTempPhoto} onSave={handleUpdateProfile} />
              )}

              {view === 'Portal' && portalTab === 'Messages' && (
                <MessagingView user={user} initialTarget={activeMessagingTarget} clearTarget={() => setActiveMessagingTarget(null)} />
              )}

              {view === 'Portal' && user.role === 'Worker' && (
                <>
                  {portalTab === 'Jobs' && <JobBoardView />}
                  {portalTab === 'GovDocs' && <GovDocsView title="Identity Verification" />}
                </>
              )}

              {view === 'Portal' && user.role === 'Employer' && (
                <>
                  {portalTab === 'GovDocs' && <GovDocsView title="Employer Verification" />}
                  {portalTab === 'HiredList' && <EmployerHiresView requests={coeRequests} setRequests={setCoeRequests} />}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HomeView({ filteredWorkers, user, setSearchQuery, onStartMsg }) {
  const getAge = (dobString) => {
    if (!dobString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <>
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay}>
          <h1 style={{ fontSize: '56px', fontWeight: '800' }}>Excellence in Service.</h1>
          <p style={{ fontSize: '20px', opacity: 0.8 }}>Welcome back, {user.name}!</p>
        </div>
      </div>
      <div style={{ padding: '0 8% 100px', marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <div style={styles.searchBox}>
          <input style={styles.searchInput} placeholder="Search names or skills..." onChange={(e) => setSearchQuery(e.target.value)} />
          <button style={styles.searchBtn}>Search</button>
        </div>
        <div style={styles.workerGrid}>
          {filteredWorkers.map((w, i) => (
            <div key={i} style={styles.workerCard}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                <img src={w.photourl || FALLBACK_PROFILE_IMG} style={styles.cardAvatar} alt="worker" />
                <div>
                  <h4 style={{ margin: 0 }}>{w.name}</h4>
                  <p style={{ color: THEME.avocado, margin: 0, fontWeight: 'bold' }}>{w.skills}</p>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: '15px', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ margin: '4px 0' }}><strong>Age:</strong> {getAge(w.dob)}</p>
                <p style={{ margin: '4px 0' }}><strong>Location:</strong> {w.location || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}><strong>Experience:</strong> {w.experience || 'Entry Level'}</p>
              </div>
              <button style={styles.msgBtn} onClick={() => onStartMsg(w)}>Message Worker</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MessagingView({ user, initialTarget, clearTarget }) {
  const [chats, setChats] = useState([]);
  const [selectedChatEmail, setSelectedChatEmail] = useState(null);
  const [textInput, setTextInput] = useState('');

  // 1. Fetch Messages (Polling every 5s)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${SCRIPT_URL}?action=getMessages&myEmail=${user.email}`);
        const allMessages = await response.json();
        
        // Group messages by conversation partner
        const grouped = {};
        allMessages.forEach(m => {
          const partner = m.senderEmail.toLowerCase() === user.email.toLowerCase() ? m.recipientEmail : m.senderEmail;
          if (!grouped[partner]) grouped[partner] = { email: partner, messages: [] };
          
          grouped[partner].messages.push({
            sender: m.senderEmail.toLowerCase() === user.email.toLowerCase() ? 'me' : 'other',
            text: m.text,
            type: m.type,
            content: m.content,
            fileName: m.fileName,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });

        const chatList = Object.values(grouped);
        setChats(chatList);

        // Auto-select first chat if none selected
        if (!selectedChatEmail && chatList.length > 0) {
          setSelectedChatEmail(chatList[0].email);
        }
      } catch (e) { console.error("Msg Sync Error:", e); }
    };

    const timer = setInterval(fetchMessages, 5000);
    fetchMessages();
    return () => clearInterval(timer);
  }, [user.email, selectedChatEmail]);

  // 2. Handle Initial Target from Home Page
  useEffect(() => {
    if (initialTarget) {
      setSelectedChatEmail(initialTarget.email);
      // Pre-populate chat list if it's a new contact
      setChats(prev => {
        if (!prev.find(c => c.email === initialTarget.email)) {
          return [{ email: initialTarget.email, messages: [] }, ...prev];
        }
        return prev;
      });
      clearTarget();
    }
  }, [initialTarget]);

  const activeChat = chats.find(c => c.email === selectedChatEmail) || { email: 'Select Chat', messages: [] };

  // 3. Send Message logic
  const handleSend = async (file = null, isMobileRequest = false) => {
    if (!textInput.trim() && !file && !isMobileRequest) return;
    if (!selectedChatEmail) return;

    const payload = {
      action: 'sendMessage',
      senderEmail: user.email,
      recipientEmail: selectedChatEmail,
      type: isMobileRequest ? 'text' : (file ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text'),
      text: isMobileRequest ? "System: I am requesting your mobile number." : textInput,
      content: file ? await toBase64(file) : null,
      fileName: file ? file.name : null
    };

    // Immediate UI update
    const tempMsg = { 
      sender: 'me', 
      text: payload.text, 
      type: payload.type, 
      time: 'Sending...',
      content: payload.content,
      fileName: payload.fileName 
    };
    
    setChats(prev => prev.map(c => 
      c.email === selectedChatEmail ? { ...c, messages: [...c.messages, tempMsg] } : c
    ));
    setTextInput('');

    try {
      await fetch(SCRIPT_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
      });
    } catch (e) { console.error("Send Error:", e); }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatSidebar}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${THEME.border}`, fontWeight: 'bold' }}>MESSAGES</div>
        {chats.map((c) => (
          <div key={c.email} onClick={() => setSelectedChatEmail(c.email)} style={{ ...styles.contactItem, background: selectedChatEmail === c.email ? THEME.glass : 'transparent' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>
              {c.messages[c.messages.length - 1]?.text?.substring(0, 20) || "Start chatting..."}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.chatMain}>
        <div style={styles.chatHeader}>
          <strong style={{ fontSize: '14px' }}>{activeChat.email}</strong>
          <button 
            onClick={() => handleSend(null, true)}
            style={{ background: 'transparent', border: `1px solid ${THEME.avocado}`, color: THEME.avocado, padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}
          >
            Request Mobile #
          </button>
        </div>
        <div style={styles.chatMessages}>
          {activeChat.messages.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '50px' }}>No messages yet.</p>}
          {activeChat.messages.map((m, i) => (
            <div key={i} style={m.sender === "me" ? styles.msgBubbleOut : styles.msgBubbleIn}>
              {m.type === 'text' && <div>{m.text}</div>}
              {m.type === 'image' && <img src={m.content} style={{ maxWidth: '100%', borderRadius: '8px' }} alt="sent" />}
              {m.type === 'file' && <a href={m.content} download={m.fileName} style={{ color: '#fff', fontSize: '12px' }}>📁 {m.fileName}</a>}
              <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '5px', textAlign: 'right' }}>{m.time}</div>
            </div>
          ))}
        </div>
        <div style={styles.chatInputArea}>
          <label style={{ cursor: 'pointer', opacity: 0.6 }}>
            📎 <input type="file" hidden onChange={(e) => handleSend(e.target.files[0])} />
          </label>
          <input 
            style={styles.msgInput} 
            value={textInput} 
            onChange={(e) => setTextInput(e.target.value)} 
            placeholder="Write a message..." 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
          />
          <button style={styles.sendBtn} onClick={() => handleSend()}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ... rest of the helper components and styles remain identical to your provided code ...

function ProfileEditor({ user, loading, tempPhoto, setTempPhoto, onSave }) {
  return (
    <>
      <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>Account Settings</h2>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src={tempPhoto || user.photourl || FALLBACK_PROFILE_IMG} style={styles.profilePreview} alt="User" />
        <label style={styles.uploadLabel}>
          Change Profile Image <input type="file" hidden onChange={async (e) => setTempPhoto(await toBase64(e.target.files[0]))} />
        </label>
      </div>
      <div style={styles.inputGrid}>
        <div style={styles.field}> <label>Full Name</label> <input id="pName" style={styles.input} defaultValue={user.name} /> </div>
        <div style={styles.field}> <label>{user.role === 'Worker' ? 'Primary Skills' : 'Organization/Family Name'}</label> <input id="pSkills" style={styles.input} defaultValue={user.skills} /> </div>
        <div style={styles.field}> <label>Location</label> <input id="pLoc" style={styles.input} defaultValue={user.location} /> </div>
        <div style={styles.field}> <label>Experience/History</label> <input id="pExp" style={styles.input} defaultValue={user.experience} /> </div>
        <div style={styles.field}> <label>Date of Birth</label> <input id="pDob" type="date" style={styles.input} defaultValue={user.dob} /> </div>
      </div>
      <button disabled={loading} style={styles.saveBtn} onClick={() => onSave({
        name: document.getElementById('pName').value,
        skills: document.getElementById('pSkills').value,
        location: document.getElementById('pLoc').value,
        experience: document.getElementById('pExp').value,
        dob: document.getElementById('pDob').value,
      })}>{loading ? 'Syncing...' : 'Update My Profile'}</button>
    </>
  );
}

function EmployerHiresView({ requests, setRequests }) {
  const handleUploadCOE = async (id, file) => {
    if (!file) return;
    const base64 = await toBase64(file);
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'completed', fileData: base64 } : req
    ));
    alert("Signed Certificate successfully uploaded and finalized.");
  };

  const pending = requests.filter(r => r.status === 'pending');

  return (
    <div>
      <h2 style={{ marginBottom: '10px' }}>Hired Workers & COE Management</h2>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>Review document requests and manage active staff.</p>

      <h4 style={{ color: THEME.avocado, marginBottom: '15px' }}>Pending Requests</h4>
      {pending.length > 0 ? (
        pending.map(req => (
          <div key={req.id} style={{ ...styles.workerCard, marginBottom: '20px', border: `1px solid ${THEME.avocado}44` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>{req.workerName}</strong>
                <p style={{ fontSize: '12px', opacity: 0.6, margin: '5px 0' }}>Requested: {req.date}</p>
              </div>
              <label style={{ ...styles.portalBtn, background: 'transparent', border: `1px solid ${THEME.avocado}`, cursor: 'pointer', fontSize: '14px' }}>
                Upload Signed PDF
                <input type="file" accept=".pdf" hidden onChange={(e) => handleUploadCOE(req.id, e.target.files[0])} />
              </label>
            </div>
          </div>
        ))
      ) : (
        <p style={{ opacity: 0.4, fontStyle: 'italic', marginBottom: '30px' }}>No pending document requests.</p>
      )}

      <h4 style={{ marginBottom: '15px', marginTop: '40px' }}>Current Staff Registry</h4>
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr style={{ textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>
              <th style={{ padding: '15px' }}>NAME</th>
              <th style={{ padding: '15px' }}>POSITION</th>
              <th style={{ padding: '15px' }}>DOCUMENTS</th>
              <th style={{ padding: '15px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{req.workerName}</td>
                <td style={{ padding: '15px' }}>{req.role}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ fontSize: '10px', background: req.status === 'completed' ? THEME.avocado : '#f1c40f', padding: '4px 8px', borderRadius: '4px' }}>
                    COE: {req.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px' }}>End Contract</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobBoardView() {
  return (
    <div>
      <h2>Job Board</h2>
      <div style={styles.workerCard}><h4 style={{ color: THEME.avocado }}>General Housekeeper Needed</h4><p style={{ opacity: 0.7 }}>Pagadian City • ₱7,500/mo</p></div>
    </div>
  );
}

function GovDocsView({ title }) {
  const [coeStatus, setCoeStatus] = useState('none'); 
  return (
    <div>
      <h2>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={styles.workerCard}><h5>National ID</h5><input type="file" style={{ marginTop: '10px' }} /></div>
        <div style={styles.workerCard}><h5>NBI Clearance</h5><input type="file" style={{ marginTop: '10px' }} /></div>
        <div style={{ ...styles.workerCard, gridColumn: 'span 2', border: `1px solid ${THEME.avocado}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h5 style={{ color: THEME.avocado }}>Certificate of Employment (COE)</h5>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>{coeStatus === 'requested' ? "Waiting for employer signature." : "Request a digital COE from your employer."}</p>
            </div>
            {coeStatus === 'none' ? <button onClick={() => setCoeStatus('requested')} style={styles.portalBtn}>Request COE</button> : <span style={{ color: '#f1c40f' }}>⏳ Pending</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val }) {
  return (
    <div style={{ background: THEME.glass, padding: '30px', borderRadius: '20px', border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
      <p style={{ opacity: 0.5, fontSize: '12px', marginBottom: '10px' }}>{label}</p>
      <h2 style={{ fontSize: '38px', margin: 0, color: THEME.avocado }}>{val}</h2>
    </div>
  );
}

function AdminTable({ title, data }) {
  return (
    <div>
      <h2>{title}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead><tr style={{ borderBottom: `1px solid ${THEME.border}`, textAlign: 'left', opacity: 0.5 }}><th style={{ padding: '12px' }}>Name</th><th style={{ padding: '12px' }}>Email</th></tr></thead>
        <tbody>{data.map((item, i) => (<tr key={i} style={{ borderBottom: `1px solid ${THEME.glass}` }}><td style={{ padding: '12px' }}>{item.name}</td><td style={{ padding: '12px' }}>{item.email}</td></tr>))}</tbody>
      </table>
    </div>
  );
}

function AuthGate({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('Worker');
  return (
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <img src="websitelogo.png" alt="Logo" style={{ height: '125px', marginBottom: '75px' }} />
        <div style={styles.roleToggle}>
          <button onClick={() => setRole('Worker')} style={role === 'Worker' ? styles.roleBtnActive : styles.roleBtn}>Worker</button>
          <button onClick={() => setRole('Employer')} style={role === 'Employer' ? styles.roleBtnActive : styles.roleBtn}>Employer</button>
        </div>
        {isRegister && <input style={styles.input} id="authName" placeholder="Full Name" />}
        <input style={styles.input} id="authEmail" placeholder="Email Address" type="email" />
        <input style={styles.input} placeholder="Password" type="password" />
        <button style={{ ...styles.saveBtn, width: '100%' }} onClick={() => onLogin({ name: "User", email: document.getElementById('authEmail').value, role })}>
          {isRegister ? 'Create Account' : 'Login'}
        </button>
        <p style={{ marginTop: '20px', fontSize: '14px', cursor: 'pointer', opacity: 0.7 }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account?' : 'New user? Register here'}
        </p>
      </div>
    </div>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', padding: '20px 8%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, alignItems: 'center', borderBottom: `1px solid ${THEME.border}` },
  navLink: { cursor: 'pointer', opacity: 0.6 },
  navActive: { cursor: 'pointer', color: THEME.avocado, fontWeight: 'bold' },
  notifBadge: { background: '#e74c3c', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' },
  portalBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' },
  heroBanner: { height: '60vh', backgroundImage: `url(${BANNER_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #021c02 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' },
  searchBox: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', padding: '8px', maxWidth: '600px', margin: '0 auto', border: `1px solid ${THEME.border}` },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: '#fff', paddingLeft: '25px', fontSize: '18px', outline: 'none' },
  searchBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  workerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  workerCard: { background: THEME.glass, padding: '30px', borderRadius: '24px', border: `1px solid ${THEME.border}` },
  cardAvatar: { width: '65px', height: '65px', borderRadius: '15px', objectFit: 'cover', border: `2px solid ${THEME.avocado}` },
  msgBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', border: 'none', background: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  portalContainer: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', padding: '60px 8%' },
  sidebar: { background: THEME.glass, padding: '30px', borderRadius: '24px', height: 'fit-content', border: `1px solid ${THEME.border}` },
  tabActive: { background: THEME.avocado, padding: '12px 20px', borderRadius: '12px', marginBottom: '10px', fontWeight: 'bold', cursor: 'pointer' },
  tabInactive: { padding: '12px 20px', opacity: 0.5, cursor: 'pointer' },
  editorPanel: { background: THEME.glass, padding: '40px', borderRadius: '24px', border: `1px solid ${THEME.border}` },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, padding: '15px', borderRadius: '12px', color: '#fff', width: '100%', boxSizing: 'border-box' },
  saveBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  profilePreview: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${THEME.avocado}`, marginBottom: '15px' },
  uploadLabel: { fontSize: '13px', opacity: 0.6, cursor: 'pointer', display: 'block' },
  authBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #021c02 0%, #0a2e0a 100%)' },
  authCard: { background: THEME.glass, padding: '40px', borderRadius: '24px', width: '400px', textAlign: 'center', border: `1px solid ${THEME.border}` },
  roleToggle: { display: 'flex', gap: '10px', marginBottom: '20px' },
  roleBtn: { flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer' },
  roleBtnActive: { flex: 1, padding: '10px', borderRadius: '10px', background: THEME.avocado, border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  chatContainer: { display: 'flex', height: '550px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: `1px solid ${THEME.border}`, overflow: 'hidden' },
  chatSidebar: { width: '280px', borderRight: `1px solid ${THEME.border}`, background: 'rgba(255,255,255,0.02)' },
  contactItem: { padding: '20px', cursor: 'pointer', transition: '0.2s', borderBottom: `1px solid ${THEME.border}44` },
  chatMain: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatMessages: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' },
  msgBubbleIn: { alignSelf: 'flex-start', background: THEME.glass, padding: '12px 18px', borderRadius: '15px 15px 15px 0', fontSize: '14px', maxWidth: '80%' },
  msgBubbleOut: { alignSelf: 'flex-end', background: THEME.avocado, padding: '12px 18px', borderRadius: '15px 15px 0 15px', fontSize: '14px', maxWidth: '80%' },
  chatInputArea: { padding: '20px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: '12px', alignItems: 'center' },
  msgInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', padding: '12px 20px', borderRadius: '12px', color: '#fff', outline: 'none' },
  sendBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

const toBase64 = file => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
});