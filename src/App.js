import React, { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxddr3f5h0C_WnimSKqtlJ_U-1X9waCYUGffIDR0PymRSvjFZjHVifzVUCvulPucEpg/exec";
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

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

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
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      const allProfiles = data.profiles || [];
      setProfiles(allProfiles);
      
      if (user) {
        const updatedUser = allProfiles.find(p => p.email.toLowerCase() === user.email.toLowerCase());
        if (updatedUser) setUser(updatedUser);
      }
    } catch (e) { console.error("Fetch error:", e); }
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleLogin = (authData) => {
    const existingUser = profiles.find(p => p.email.toLowerCase() === authData.email.toLowerCase());
    const sessionData = existingUser || authData;
    setUser(sessionData);
  };

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
      const exists = prev.find(p => p.email.toLowerCase() === user.email.toLowerCase());
      if (exists) return prev.map(p => p.email.toLowerCase() === user.email.toLowerCase() ? updatedRecord : p);
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

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        setUser(null);
        setView('Home');
    }
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
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
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
          <input 
            style={styles.searchInput} 
            placeholder="Search names or skills (e.g. Housekeeper)..." 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <button style={styles.searchBtn}>Find Staff</button>
        </div>
        <div style={styles.workerGrid}>
          {filteredWorkers.length > 0 ? filteredWorkers.map((w, i) => (
            <div key={i} style={styles.workerCard}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                <img src={w.photourl || FALLBACK_PROFILE_IMG} style={styles.cardAvatar} alt="worker" />
                <div>
                  <h4 style={{ margin: 0 }}>{w.name}</h4>
                  <p style={{ color: THEME.avocado, margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{w.skills}</p>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: '15px', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ margin: '4px 0' }}><strong>Age:</strong> {getAge(w.dob)}</p>
                <p style={{ margin: '4px 0' }}><strong>Location:</strong> {w.location || 'Pagadian City'}</p>
                <p style={{ margin: '4px 0' }}><strong>Experience:</strong> {w.experience || 'Entry Level'}</p>
              </div>
              <button style={styles.msgBtn} onClick={() => onStartMsg(w)}>Message Worker</button>
            </div>
          )) : <p style={{ textAlign: 'center', width: '100%', opacity: 0.5, marginTop: '40px' }}>No workers found matching your search.</p>}
        </div>
      </div>
    </>
  );
}

function MessagingView({ user, initialTarget, clearTarget }) {
  const [chatList, setChatList] = useState([]); // List of partner emails
  const [selectedChatEmail, setSelectedChatEmail] = useState(null);
  const [messages, setMessages] = useState([]); // Messages for current chat
  const [textInput, setTextInput] = useState('');

  // 1. Fetch Chat Partners (Sidebar)
  const fetchChatList = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getChatList&myEmail=${user.email}`);
      const data = await response.json();
      setChatList(data || []);
    } catch (e) { console.error("Chat List Error:", e); }
  };

  // 2. Fetch Messages for Selected Chat
  const fetchMessages = async (contactEmail) => {
    if (!contactEmail) return;
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getMessages&myEmail=${user.email}&contactEmail=${contactEmail}`);
      const data = await response.json();
      const formatted = data.map(m => ({
        sender: m.senderEmail.toLowerCase() === user.email.toLowerCase() ? 'me' : 'other',
        text: m.text,
        type: m.type,
        content: m.content,
        fileName: m.fileName,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formatted);
    } catch (e) { console.error("Msg Sync Error:", e); }
  };

  useEffect(() => {
    fetchChatList();
    const listTimer = setInterval(fetchChatList, 10000);
    return () => clearInterval(listTimer);
  }, [user.email]);

  useEffect(() => {
    if (selectedChatEmail) {
      fetchMessages(selectedChatEmail);
      const msgTimer = setInterval(() => fetchMessages(selectedChatEmail), 4000);
      return () => clearInterval(msgTimer);
    }
  }, [selectedChatEmail, user.email]);

  useEffect(() => {
    if (initialTarget) {
      const targetEmail = initialTarget.email.toLowerCase();
      setSelectedChatEmail(targetEmail);
      if (!chatList.includes(targetEmail)) {
        setChatList(prev => [targetEmail, ...prev]);
      }
      clearTarget();
    }
  }, [initialTarget]);

  const handleSend = async (file = null, isMobileRequest = false) => {
    if (!textInput.trim() && !file && !isMobileRequest) return;
    if (!selectedChatEmail) return;

    let fileContent = null;
    if (file) fileContent = await toBase64(file);

    const payload = {
      action: 'sendMessage',
      senderEmail: user.email,
      recipientEmail: selectedChatEmail,
      type: isMobileRequest ? 'text' : (file ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text'),
      text: isMobileRequest ? "System: I am requesting your mobile number." : textInput,
      content: fileContent,
      fileName: file ? file.name : null
    };

    // Optimistic UI update
    const tempMsg = { 
      sender: 'me', 
      text: payload.text, 
      type: payload.type, 
      time: 'Sending...',
      content: payload.content,
      fileName: payload.fileName 
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setTextInput('');

    try {
      await fetch(SCRIPT_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
      });
      // Refresh list after sending if it's a new contact
      if (!chatList.includes(selectedChatEmail)) fetchChatList();
    } catch (e) { console.error("Send Error:", e); }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatSidebar}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${THEME.border}`, fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px' }}>CONVERSATIONS</div>
        <div style={{ overflowY: 'auto', height: 'calc(100% - 55px)' }}>
          {chatList.length === 0 && <p style={{ padding: '20px', fontSize: '12px', opacity: 0.4 }}>No active chats.</p>}
          {chatList.map((email) => (
            <div key={email} onClick={() => setSelectedChatEmail(email)} style={{ ...styles.contactItem, background: selectedChatEmail === email ? THEME.glass : 'transparent' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
              <div style={{ fontSize: '10px', color: THEME.avocado }}>Active Partner</div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.chatMain}>
        {selectedChatEmail ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px' }}>{selectedChatEmail}</strong>
                <span style={{ fontSize: '10px', color: THEME.avocado }}>Private Conversation</span>
              </div>
              <button onClick={() => handleSend(null, true)} style={styles.requestBtn}>Request Mobile #</button>
            </div>
            <div style={styles.chatMessages}>
              {messages.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '50px' }}>No messages yet. Send a greeting!</p>}
              {messages.map((m, i) => (
                <div key={i} style={m.sender === "me" ? styles.msgBubbleOut : styles.msgBubbleIn}>
                  {m.type === 'text' && <div>{m.text}</div>}
                  {m.type === 'image' && <img src={m.content} style={{ maxWidth: '200px', borderRadius: '8px', display: 'block' }} alt="sent" />}
                  {m.type === 'file' && <a href={m.content} download={m.fileName} style={{ color: '#fff', fontSize: '12px', textDecoration: 'underline' }}>📁 {m.fileName}</a>}
                  <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '5px', textAlign: 'right' }}>{m.time}</div>
                </div>
              ))}
            </div>
            <div style={styles.chatInputArea}>
              <label style={{ cursor: 'pointer', opacity: 0.6, fontSize: '20px', padding: '0 10px' }}>
                📎 <input type="file" hidden onChange={(e) => handleSend(e.target.files[0])} />
              </label>
              <input 
                style={styles.msgInput} 
                value={textInput} 
                onChange={(e) => setTextInput(e.target.value)} 
                placeholder="Type your message..." 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
              />
              <button style={styles.sendBtn} onClick={() => handleSend()}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileEditor({ user, loading, tempPhoto, setTempPhoto, onSave }) {
  return (
    <>
      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Profile Settings</h2>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>Keep your professional info up to date for better visibility.</p>
      
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={tempPhoto || user.photourl || FALLBACK_PROFILE_IMG} style={styles.profilePreview} alt="User" />
          <label style={styles.uploadLabel}>
            Update Photo <input type="file" hidden onChange={async (e) => setTempPhoto(await toBase64(e.target.files[0]))} />
          </label>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={styles.inputGrid}>
            <div style={styles.field}> <label>Full Name</label> <input id="pName" style={styles.input} defaultValue={user.name} /> </div>
            <div style={styles.field}> <label>{user.role === 'Worker' ? 'Main Skill' : 'Employer Name'}</label> <input id="pSkills" style={styles.input} defaultValue={user.skills} /> </div>
            <div style={styles.field}> <label>Current Location</label> <input id="pLoc" style={styles.input} defaultValue={user.location} /> </div>
            <div style={styles.field}> <label>Experience (Years)</label> <input id="pExp" style={styles.input} defaultValue={user.experience} /> </div>
            <div style={{ ...styles.field, gridColumn: 'span 2' }}> <label>Bio / Background</label> <textarea id="pBio" style={{ ...styles.input, height: '80px', resize: 'none' }} defaultValue={user.bio || ""} placeholder="Tell employers about your previous work..."></textarea> </div>
            <div style={styles.field}> <label>Date of Birth</label> <input id="pDob" type="date" style={styles.input} defaultValue={user.dob} /> </div>
          </div>
          <button disabled={loading} style={styles.saveBtn} onClick={() => onSave({
            name: document.getElementById('pName').value,
            skills: document.getElementById('pSkills').value,
            location: document.getElementById('pLoc').value,
            experience: document.getElementById('pExp').value,
            dob: document.getElementById('pDob').value,
            bio: document.getElementById('pBio').value,
          })}>{loading ? 'Saving Changes...' : 'Save Profile'}</button>
        </div>
      </div>
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
      <h2 style={{ marginBottom: '10px' }}>Personnel Management</h2>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>Review document requests and manage active staff contracts.</p>
      <h4 style={{ color: THEME.avocado, marginBottom: '15px' }}>Document Requests</h4>
      {pending.length > 0 ? (
        pending.map(req => (
          <div key={req.id} style={{ ...styles.workerCard, marginBottom: '20px', border: `1px solid ${THEME.avocado}44` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>{req.workerName}</strong>
                <p style={{ fontSize: '12px', opacity: 0.6, margin: '5px 0' }}>Request Date: {req.date}</p>
              </div>
              <label style={{ ...styles.portalBtn, background: 'transparent', border: `1px solid ${THEME.avocado}`, cursor: 'pointer', fontSize: '14px' }}>
                Sign & Upload COE
                <input type="file" accept=".pdf" hidden onChange={(e) => handleUploadCOE(req.id, e.target.files[0])} />
              </label>
            </div>
          </div>
        ))
      ) : (
        <p style={{ opacity: 0.4, fontStyle: 'italic', marginBottom: '30px' }}>No pending document requests.</p>
      )}
      <h4 style={{ marginBottom: '15px', marginTop: '40px' }}>Active Staff List</h4>
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr style={{ textAlign: 'left', fontSize: '11px', opacity: 0.5 }}>
              <th style={{ padding: '15px' }}>NAME</th>
              <th style={{ padding: '15px' }}>ROLE</th>
              <th style={{ padding: '15px' }}>STATUS</th>
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
                  <button style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px' }}>Terminate Contract</button>
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
      <p style={{ opacity: 0.6, marginBottom: '25px' }}>Current opportunities in Pagadian City.</p>
      <div style={styles.workerCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h4 style={{ color: THEME.avocado, margin: '0 0 5px 0' }}>General Housekeeper Needed</h4>
                <p style={{ opacity: 0.7, margin: 0, fontSize: '14px' }}>Sta. Lucia, Pagadian City • ₱7,500/mo</p>
            </div>
            <button style={{ ...styles.portalBtn, fontSize: '12px' }}>Apply Now</button>
        </div>
      </div>
    </div>
  );
}

function GovDocsView({ title }) {
  const [coeStatus, setCoeStatus] = useState('none'); 
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ opacity: 0.6 }}>Manage your legal requirements for profiling.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={styles.workerCard}><h5>National ID / Driver's License</h5><input type="file" style={{ marginTop: '10px' }} /></div>
        <div style={styles.workerCard}><h5>NBI / Police Clearance</h5><input type="file" style={{ marginTop: '10px' }} /></div>
        <div style={{ ...styles.workerCard, gridColumn: 'span 2', border: `1px solid ${THEME.avocado}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h5 style={{ color: THEME.avocado }}>Certificate of Employment (COE)</h5>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>{coeStatus === 'requested' ? "Your employer has been notified." : "Request a digital COE from your employer for your records."}</p>
            </div>
            {coeStatus === 'none' ? <button onClick={() => setCoeStatus('requested')} style={styles.portalBtn}>Request COE</button> : <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>⏳ Requested</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val }) {
  return (
    <div style={{ background: THEME.glass, padding: '30px', borderRadius: '20px', border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
      <p style={{ opacity: 0.5, fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>{label}</p>
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
        <img src="websitelogo.png" alt="Logo" style={{ height: '125px', marginBottom: '40px' }} />
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>{isRegister ? 'Join Bantay' : 'Welcome Back'}</h2>
        <div style={styles.roleToggle}>
          <button onClick={() => setRole('Worker')} style={role === 'Worker' ? styles.roleBtnActive : styles.roleBtn}>Worker</button>
          <button onClick={() => setRole('Employer')} style={role === 'Employer' ? styles.roleBtnActive : styles.roleBtn}>Employer</button>
        </div>
        {isRegister && <input style={styles.input} id="authName" placeholder="Full Name" />}
        <input style={styles.input} id="authEmail" placeholder="Email Address" type="email" />
        <input style={{ ...styles.input, marginTop: '10px' }} placeholder="Password" type="password" />
        <button style={{ ...styles.saveBtn, width: '100%' }} onClick={() => onLogin({ name: isRegister ? document.getElementById('authName').value : "User", email: document.getElementById('authEmail').value, role })}>
          {isRegister ? 'Register' : 'Login'}
        </button>
        <p style={{ marginTop: '20px', fontSize: '14px', cursor: 'pointer', opacity: 0.7 }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', padding: '20px 8%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, alignItems: 'center', borderBottom: `1px solid ${THEME.border}` },
  navLink: { cursor: 'pointer', opacity: 0.6, transition: '0.3s' },
  navActive: { cursor: 'pointer', color: THEME.avocado, fontWeight: 'bold' },
  notifBadge: { background: '#e74c3c', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' },
  portalBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  logoutBtn: { background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' },
  heroBanner: { height: '60vh', backgroundImage: `url(${BANNER_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, #021c02 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' },
  searchBox: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', padding: '8px', maxWidth: '650px', margin: '0 auto', border: `1px solid ${THEME.border}`, backdropFilter: 'blur(10px)' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: '#fff', paddingLeft: '25px', fontSize: '16px', outline: 'none' },
  searchBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  workerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '40px' },
  workerCard: { background: THEME.glass, padding: '30px', borderRadius: '24px', border: `1px solid ${THEME.border}`, transition: '0.3s' },
  cardAvatar: { width: '65px', height: '65px', borderRadius: '15px', objectFit: 'cover', border: `2px solid ${THEME.avocado}` },
  msgBtn: { width: '100%', marginTop: '20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: `1px solid ${THEME.border}`, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  portalContainer: { display: 'flex', minHeight: 'calc(100vh - 120px)', padding: '40px 8%' },
  sidebar: { width: '280px', borderRight: `1px solid ${THEME.border}`, paddingRight: '40px' },
  tabInactive: { padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', opacity: 0.5, transition: '0.3s', marginBottom: '8px' },
  tabActive: { padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', background: THEME.glass, color: THEME.avocado, fontWeight: 'bold', marginBottom: '8px' },
  editorPanel: { flex: 1, paddingLeft: '60px' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { background: THEME.glass, border: `1px solid ${THEME.border}`, borderRadius: '12px', padding: '15px', color: '#fff', outline: 'none', fontSize: '15px' },
  saveBtn: { marginTop: '30px', background: THEME.avocado, color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  profilePreview: { width: '180px', height: '180px', borderRadius: '30px', objectFit: 'cover', marginBottom: '15px', border: `3px solid ${THEME.avocado}` },
  uploadLabel: { display: 'block', color: THEME.avocado, fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  authBg: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.black },
  authCard: { width: '400px', textAlign: 'center', padding: '50px', background: THEME.glass, borderRadius: '30px', border: `1px solid ${THEME.border}` },
  roleToggle: { display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px', marginBottom: '25px' },
  roleBtn: { flex: 1, padding: '10px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', borderRadius: '8px' },
  roleBtnActive: { flex: 1, padding: '10px', border: 'none', background: THEME.avocado, color: '#fff', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
  chatContainer: { display: 'flex', height: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${THEME.border}` },
  chatSidebar: { width: '300px', borderRight: `1px solid ${THEME.border}`, background: 'rgba(255,255,255,0.02)' },
  contactItem: { padding: '20px', cursor: 'pointer', borderBottom: `1px solid ${THEME.border}`, transition: '0.2s' },
  chatMain: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px 30px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  requestBtn: { background: 'transparent', border: `1px solid ${THEME.avocado}`, color: THEME.avocado, padding: '6px 14px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' },
  chatMessages: { flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
  msgBubbleIn: { alignSelf: 'flex-start', background: THEME.glass, padding: '12px 18px', borderRadius: '18px 18px 18px 4px', maxWidth: '70%', fontSize: '14px' },
  msgBubbleOut: { alignSelf: 'flex-end', background: THEME.avocado, color: '#fff', padding: '12px 18px', borderRadius: '18px 18px 4px 18px', maxWidth: '70%', fontSize: '14px' },
  chatInputArea: { padding: '20px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: '15px', alignItems: 'center' },
  msgInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '12px 20px', color: '#fff', outline: 'none' },
  sendBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};