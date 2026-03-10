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
  glass: 'rgba(255, 255, 255, 0.05)',
  status: {
    available: '#99ff00',
    unemployed: '#99ff00',
    working: '#ffcc00',
    employed: '#888888'
  }
};

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8%', borderBottom: `1px solid ${THEME.border}`, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 },
  navLink: { opacity: 0.6, cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  navActive: { color: THEME.avocado, cursor: 'pointer', fontSize: '14px', fontWeight: '700' },
  portalBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { background: 'transparent', color: '#fff', border: `1px solid ${THEME.border}`, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' },
  portalContainer: { display: 'flex', minHeight: 'calc(100vh - 80px)' },
  sidebar: { width: '280px', borderRight: `1px solid ${THEME.border}`, padding: '40px 30px' },
  tabActive: { padding: '12px 20px', background: THEME.glass, borderRadius: '10px', color: THEME.avocado, fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' },
  tabInactive: { padding: '12px 20px', opacity: 0.4, marginBottom: '10px', cursor: 'pointer' },
  editorPanel: { flex: 1, padding: '60px 8%', overflowY: 'auto' },
  workerCard: { background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.border}`, borderRadius: '15px', padding: '20px' },
  heroBanner: { height: '400px', backgroundImage: `url(${BANNER_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,28,2,0.4), #021c02)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' },
  searchBox: { background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '15px', display: 'flex', gap: '10px', border: `1px solid ${THEME.border}`, backdropFilter: 'blur(20px)', marginBottom: '40px' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '15px', fontSize: '16px', outline: 'none' },
  searchBtn: { background: THEME.avocado, color: '#fff', border: 'none', padding: '0 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  workerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  cardAvatar: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${THEME.avocado}` },
  msgBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '10px', background: THEME.glass, border: `1px solid ${THEME.border}`, color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  chatContainer: { display: 'flex', height: '70vh', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', overflow: 'hidden', border: `1px solid ${THEME.border}` },
  chatSidebar: { width: '300px', borderRight: `1px solid ${THEME.border}` },
  contactItem: { padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' },
  chatMain: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatMessages: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
  msgBubbleIn: { alignSelf: 'flex-start', background: THEME.glass, padding: '12px 18px', borderRadius: '15px 15px 15px 0', maxWidth: '70%', fontSize: '14px' },
  msgBubbleOut: { alignSelf: 'flex-end', background: THEME.avocado, padding: '12px 18px', borderRadius: '15px 15px 0 15px', maxWidth: '70%', fontSize: '14px' },
  chatInputArea: { padding: '20px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: '10px' },
  msgInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' },
  sendBtn: { background: THEME.avocado, border: 'none', padding: '0 20px', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  requestBtn: { background: 'transparent', border: `1px solid ${THEME.avocado}`, color: THEME.avocado, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' },
  profilePreview: { width: '150px', height: '150px', borderRadius: '20px', objectFit: 'cover', border: `3px solid ${THEME.avocado}`, marginBottom: '15px' },
  uploadLabel: { fontSize: '12px', color: THEME.avocado, cursor: 'pointer', textDecoration: 'underline' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.border}`, padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' },
  saveBtn: { marginTop: '30px', padding: '15px 40px', background: THEME.avocado, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  notifBadge: { background: '#e74c3c', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', position: 'relative', top: '-10px', left: '-10px' }
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
  const [activeMessagingTarget, setActiveMessagingTarget] = useState(null);

  const [coeRequests, setCoeRequests] = useState([
    { id: 101, workerName: "Juan Dela Cruz", workerEmail: "juan@example.com", employerEmail: "admin@example.com", date: "2026-03-08", status: "pending", role: "Housekeeper" }
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

  const handleAcceptJob = (employerEmail) => {
    setCoeRequests(prev => {
      // Check if this specific hire already exists in the list
      const alreadyHired = prev.some(
        req => req.workerEmail === user.email && 
               req.employerEmail === employerEmail && 
               req.status === "accepted"
      );

      if (alreadyHired) {
        alert("You are already in this employer's hired list.");
        return prev;
      }

      // Create the new hire record with 'accepted' status
      const newHire = {
        id: Date.now(),
        workerName: user.name,
        workerEmail: user.email,
        employerEmail: employerEmail,
        date: new Date().toISOString().split('T')[0],
        status: "accepted", // This is the trigger for the list
        role: user.skills || "Staff"
      };

      return [newHire, ...prev];
    });

    alert("Job offer accepted! You are now listed in the employer's active staff list.");
  };
  
  const handleUpdateProfile = async (profileData) => {
    setLoading(true);
    const finalPhoto = tempPhoto || user.photourl;
    
    const updatedRecord = { 
      ...profileData, 
      photourl: finalPhoto, 
      email: user.email, 
      role: user.role 
    };
    
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
                <MessagingView user={user} coeRequests={coeRequests} initialTarget={activeMessagingTarget} clearTarget={() => setActiveMessagingTarget(null)} onAcceptJob={handleAcceptJob} />
              )}

              {view === 'Portal' && portalTab === 'GovDocs' && (
                <GovDocsView user={user} coeRequests={coeRequests} title={user.role === 'Employer' ? "Employer Verification" : "Identity Verification"} />
              )}

              {view === 'Portal' && user.role === 'Worker' && portalTab === 'Jobs' && <JobBoardView />}

              {view === 'Portal' && user.role === 'Employer' && portalTab === 'HiredList' && (
                <EmployerHiresView requests={coeRequests} setRequests={setCoeRequests} user={user} />
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

  const getStatusStyle = (status) => {
    const s = (status || 'available').toLowerCase();
    return THEME.status[s] || THEME.status.available;
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
                <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <strong>Status:</strong> 
                    <span style={{ color: getStatusStyle(w.availability_status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                        ● {w.availability_status || 'Available'}
                    </span>
                </p>
              </div>
              <button style={styles.msgBtn} onClick={() => onStartMsg(w)}>Message Worker</button>
            </div>
          )) : <p style={{ textAlign: 'center', width: '100%', opacity: 0.5, marginTop: '40px' }}>No workers found matching your search.</p>}
        </div>
      </div>
    </>
  );
}

function MessagingView({ user, coeRequests, initialTarget, clearTarget, onAcceptJob }) {
  const [chatList, setChatList] = useState([]); 
  const [selectedChatEmail, setSelectedChatEmail] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [textInput, setTextInput] = useState('');

  const fetchChatList = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getChatList&myEmail=${user.email}`);
      const data = await response.json();
      setChatList(data || []);
    } catch (e) { console.error("Chat List Error:", e); }
  };

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

  const handleSend = async (file = null, isMobileRequest = false, isHireRequest = false) => {
    if (!textInput.trim() && !file && !isMobileRequest && !isHireRequest) return;
    if (!selectedChatEmail) return;

    let fileContent = null;
    if (file) fileContent = await toBase64(file);

    const payload = {
      action: 'sendMessage',
      senderEmail: user.email,
      recipientEmail: selectedChatEmail,
      type: (isMobileRequest || isHireRequest) ? 'text' : (file ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text'),
      text: isMobileRequest ? "System: I am requesting your mobile number." : (isHireRequest ? "SYSTEM_HIRE_REQUEST" : textInput),
      content: fileContent,
      fileName: file ? file.name : null
    };

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
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={() => handleSend(null, true)} style={styles.requestBtn}>Request Mobile #</button>
                 {user.role === 'Employer' && (
                    <button 
                      onClick={() => window.confirm(`Send hire request to ${selectedChatEmail}?`) && handleSend(null, false, true)} 
                      style={{ ...styles.portalBtn, fontSize: '12px' }}
                    >
                      Hire Staff
                    </button>
                 )}
              </div>
            </div>
            <div style={styles.chatMessages}>
              {messages.length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, marginTop: '50px' }}>No messages yet. Send a greeting!</p>}
              {messages.map((m, i) => (
                <div key={i} style={m.sender === "me" ? styles.msgBubbleOut : styles.msgBubbleIn}>
                  {m.text === "SYSTEM_HIRE_REQUEST" ? (
                     <div style={{ textAlign: 'center', padding: '5px' }}>
                        <p style={{ fontSize: '12px', margin: '0 0 8px 0' }}>💼 <strong>New Job Offer!</strong></p>
                        {m.sender === 'other' && user.role === 'Worker' ? (
                          !coeRequests.some(r => r.workerEmail === user.email && r.employerEmail === selectedChatEmail) ? (
                            <button onClick={() => onAcceptJob(selectedChatEmail)} style={{ background: THEME.avocado, border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Accept Job</button>
                          ) : (
                            <span style={{ color: THEME.avocado, fontSize: '11px', fontWeight: 'bold' }}>✓ Job Accepted</span>
                          )
                        ) : <span style={{ opacity: 0.5, fontSize: '11px' }}>Hire request sent.</span>}
                     </div>
                  ) : (
                    <>
                      {m.type === 'text' && <div>{m.text}</div>}
                      {m.type === 'image' && <img src={m.content} style={{ maxWidth: '200px', borderRadius: '8px', display: 'block' }} alt="sent" />}
                      {m.type === 'file' && <a href={m.content} download={m.fileName} style={{ color: '#fff', fontSize: '12px', textDecoration: 'underline' }}>📁 {m.fileName}</a>}
                    </>
                  )}
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
  const isWorker = user.role === 'Worker';

  const triggerSave = () => {
    const data = {
      name: document.getElementById('pName').value,
      dob: document.getElementById('pDob').value,
      bio: document.getElementById('pBio').value,
    };

    if (isWorker) {
      data.skills = document.getElementById('pSkills').value;
      data.location = document.getElementById('pLoc').value;
      data.experience = document.getElementById('pExp').value;
      data.availability_status = document.getElementById('pStatus').value;
    } else {
      data.residence = document.getElementById('pRes').value;
      data.email_contact = document.getElementById('pEmailContact').value;
      data.contact_no = document.getElementById('pPhone').value;
    }

    onSave(data);
  };

  return (
    <>
      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Profile Settings</h2>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>
        {isWorker ? 'Keep your professional skills up to date for better visibility.' : 'Update your contact details for workers to reach you.'}
      </p>
      
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
            <div style={styles.field}> <label>Date of Birth</label> <input id="pDob" type="date" style={styles.input} defaultValue={user.dob} /> </div>

            {isWorker ? (
              <>
                <div style={styles.field}> <label>Main Skill</label> <input id="pSkills" style={styles.input} defaultValue={user.skills} /> </div>
                <div style={styles.field}> <label>Current Location</label> <input id="pLoc" style={styles.input} defaultValue={user.location} /> </div>
                <div style={styles.field}> <label>Experience (Years)</label> <input id="pExp" style={styles.input} defaultValue={user.experience} /> </div>
                <div style={styles.field}> 
                    <label>Availability Status</label> 
                    <select id="pStatus" style={styles.input} defaultValue={user.availability_status || 'available'}>
                        <option value="available">Available</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="employed">Employed</option>
                        <option value="working">Working</option>
                    </select>
                </div>
              </>
            ) : (
              <>
                <div style={styles.field}> <label>Residence</label> <input id="pRes" style={styles.input} defaultValue={user.residence} /> </div>
                <div style={styles.field}> <label>Contact Email</label> <input id="pEmailContact" style={styles.input} defaultValue={user.email_contact} /> </div>
                <div style={styles.field}> <label>Contact No.</label> <input id="pPhone" style={styles.input} defaultValue={user.contact_no} /> </div>
              </>
            )}

            <div style={{ ...styles.field, gridColumn: 'span 2' }}> 
              <label>{isWorker ? 'Bio / Background' : 'Employer Description'}</label> 
              <textarea id="pBio" style={{ ...styles.input, height: '80px', resize: 'none' }} defaultValue={user.bio || ""} placeholder={isWorker ? "Tell employers about your previous work..." : "Briefly describe your hiring needs..."}></textarea> 
            </div>
          </div>
          
          <button disabled={loading} style={styles.saveBtn} onClick={triggerSave}>
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </>
  );
}
function GovDocsView({ user, title }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Track if the user just uploaded something in this session
  const [uploadStatus, setUploadStatus] = useState(user.doc_status || "Not Submitted");

  const DOCS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzuyVXlxfmlbK_IzDbdxZjEbG0hBTc4TCTYKhhkSMDt63SWqX0xqNi5eqeQGZz0-cJ/exec";

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSaveToDrive = async () => {
    if (!selectedFile) return alert("Please select a document first.");
    
    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      
      const payload = {
        action: "UPLOAD_DOC",
        userType: user.role,    
        userId: user.email,
        fileName: `${user.role}_ID_${user.name.replace(/\s/g, '_')}_${Date.now()}`,
        mimeType: selectedFile.type,
        base64: base64Data
      };

      try {
        await fetch(DOCS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });

        // Update local state to show "Pending Review"
        setUploadStatus("Pending Review");
        alert("Document saved successfully! Admin will review your identity.");
        setSelectedFile(null);
      } catch (error) {
        console.error("Upload Error:", error);
        alert("Failed to save document.");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  // Helper to color the status badge
  const getStatusColor = (status) => {
    switch(status) {
      case "Verified": return "#2ecc71";
      case "Pending Review": return "#f1c40f";
      case "Rejected": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '32px', margin: 0 }}>{title}</h2>
        <span style={{ 
          padding: '5px 12px', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          background: getStatusColor(uploadStatus),
          color: '#000'
        }}>
          {uploadStatus.toUpperCase()}
        </span>
      </div>
      
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>
        {user.role === 'Employer' 
          ? 'Upload business permits or valid IDs to verify your account.' 
          : 'Upload NBI Clearance, PhilID, or Barangay Certificate for background checking.'}
      </p>

      <div style={{ 
        background: THEME.glass, 
        padding: '30px', 
        borderRadius: '15px', 
        border: `1px solid ${THEME.border}` 
      }}>
        {uploadStatus === "Verified" ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
            <h4 style={{ color: '#2ecc71' }}>Account Verified</h4>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Your identity has been confirmed. You do not need to upload further documents.</p>
          </div>
        ) : (
          <>
            <div style={styles.field}>
              <label style={{ marginBottom: '15px', fontWeight: 'bold' }}>Select Government Document</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".pdf,image/*" 
                style={styles.input} 
              />
            </div>

            <button 
              onClick={handleSaveToDrive} 
              disabled={uploading || !selectedFile}
              style={{
                ...styles.saveBtn,
                width: '100%',
                background: uploading ? '#444' : THEME.avocado,
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: (uploading || !selectedFile) ? 0.6 : 1
              }}
            >
              {uploading ? "Uploading to Drive..." : "Save to Google Drive"}
            </button>
          </>
        )}

        <div style={{ marginTop: '20px', fontSize: '11px', opacity: 0.4, textAlign: 'center', lineHeight: '1.4' }}>
          Your data is processed according to the BANTAY Privacy Policy.<br/>
          Current Status: <strong>{uploadStatus}</strong>
        </div>
      </div>
    </div>
  );
}
function EmployerHiresView({ requests, setRequests, user }) {
  
  // NEW: Function to generate the interactive COE
  const handlePrintCOE = (req) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const coeHtml = `
      <html>
        <head>
          <title>COE - ${req.workerName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #74ae08; padding-bottom: 20px; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #74ae08; text-transform: uppercase; letter-spacing: 2px; }
            .date { text-align: right; margin-bottom: 30px; }
            .content { margin-bottom: 50px; }
            .editable { border-bottom: 1px dashed #74ae08; padding: 2px 5px; background: #f0f7e6; cursor: text; }
            .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-box { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px; }
            @media print {
              .no-print { display: none; }
              .editable { border: none; background: transparent; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #eef7de; padding: 15px; border: 1px solid #74ae08; margin-bottom: 20px; border-radius: 8px; font-family: sans-serif; font-size: 13px;">
            <strong>BANTAY System Tip:</strong> You can click and edit the <span style="color:#74ae08; font-weight:bold;">green highlighted</span> text. 
            Once finished, press <b>Ctrl + P</b> to save as PDF.
          </div>

          <div class="header">
            <h1>BANTAY</h1>
            <p>Domestic Worker Management & Profiling System</p>
          </div>

          <div class="date">Date: ${new Date().toLocaleDateString()}</div>

          <div class="content">
            <h2 style="text-align: center; text-decoration: underline;">CERTIFICATE OF EMPLOYMENT</h2>
            <br/>
            <p>To Whom It May Concern,</p>
            <p>This is to certify that <strong>${req.workerName}</strong> has been employed by the undersigned in the capacity of 
            <span class="editable" contenteditable="true">${req.role || 'Domestic Worker'}</span>.</p>
            
            <p>The period of employment commenced on <strong>${req.date}</strong> and continues to the present date.</p>
            
            <p>During this tenure, the employee has performed their duties with 
            <span class="editable" contenteditable="true">reliability and professional conduct</span>.</p>
            
            <p>This certification is being issued upon the request of the aforementioned individual for 
            <span class="editable" contenteditable="true">verification and profiling requirements</span>.</p>
          </div>

          <div class="signature-section">
            <div>
              <div class="sig-box">
                <strong>${user.name}</strong><br/>
                Employer Name
              </div>
            </div>
            <div>
              <div class="sig-box">
                Date Signed
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(coeHtml);
    printWindow.document.close();
  };

  const handleFileUpload = async (id, file) => {
    const base64 = await toBase64(file);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, fileData: base64, status: 'verified' } : r));
    alert("Signed COE uploaded and verified!");
  };

  return (
    <div>
      <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Hired Workers</h2>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>Generate certificates and manage your active staff.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {requests.filter(r => r.employerEmail === user.email).map(req => (
          <div key={req.id} style={{ ...styles.workerCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{req.workerName}</h4>
              <div style={{ display: 'flex', gap: '15px', fontSize: '12px', opacity: 0.6 }}>
                <span>Hired: {req.date}</span>
                <span>Role: {req.role}</span>
              </div>
              {/* Updated Button Call */}
              <button 
                onClick={() => handlePrintCOE(req)} 
                style={{ background: 'none', border: 'none', color: THEME.avocado, padding: '10px 0 0 0', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
              >
                Generate & Download COE
              </button>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: req.status === 'verified' ? '#74ae0822' : '#ffcc0022', color: req.status === 'verified' ? THEME.avocado : '#ffcc00' }}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              <label style={{ ...styles.uploadLabel, fontSize: '11px' }}>
                {req.fileData ? 'Update Signed COE' : 'Upload Signed COE'}
                <input type="file" hidden onChange={(e) => handleFileUpload(req.id, e.target.files[0])} />
              </label>
            </div>
          </div>
        ))}
        {requests.filter(r => r.employerEmail === user.email).length === 0 && (
          <p style={{ opacity: 0.4, textAlign: 'center', padding: '40px' }}>No hired workers yet.</p>
        )}
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
                <h4 style={{ color: THEME.avocado, margin: '0 0 5px 0' }}>Professional Housekeeper Needed</h4>
                <p style={{ fontSize: '12px', opacity: 0.6 }}>Full-time • Brgy. San Jose</p>
                <p style={{ marginTop: '15px', fontSize: '14px' }}>Looking for a reliable housekeeper with at least 2 years of experience. Must be trustworthy and diligent.</p>
            </div>
            <button style={styles.portalBtn}>Apply Now</button>
        </div>
      </div>
    </div>
  );
}

function AuthGate({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Worker');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, name: name || email.split('@')[0], role });
  };

  const authStyles = {
    container: {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      /* FADING EFFECT: Linear gradient over the background image */
      background: `linear-gradient(rgba(2, 28, 2, 0.85), rgba(2, 28, 2, 0.85)), url('/background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, sans-serif'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(15px)',
      padding: '40px',
      borderRadius: '20px',
      border: `1px solid ${THEME.border}`,
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <img src="websitelogo.png" alt="Bantay" style={{ height: '60px', marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '30px', fontWeight: '700' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              style={styles.input} 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          )}
          <input 
            style={styles.input} 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <select 
            style={styles.input} 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Worker">I am a Worker</option>
            <option value="Employer">I am an Employer</option>
          </select>
          
          <button type="submit" style={styles.saveBtn}>
            {isLogin ? 'Login to Portal' : 'Register Now'}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '14px', opacity: 0.6 }}>
          {isLogin ? "Don't have an account?" : "Already registered?"} 
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: THEME.avocado, cursor: 'pointer', marginLeft: '8px', fontWeight: 'bold' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, val }) {
  return (
    <div style={styles.workerCard}>
      <p style={{ opacity: 0.6, fontSize: '12px', margin: '0 0 10px 0' }}>{label}</p>
      <h2 style={{ fontSize: '36px', color: THEME.avocado, margin: 0 }}>{val}</h2>
    </div>
  );
}

function AdminTable({ title, data }) {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>{title}</h2>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr style={{ textAlign: 'left', opacity: 0.5, fontSize: '12px' }}>
              <th style={{ padding: '15px' }}>NAME</th>
              <th style={{ padding: '15px' }}>EMAIL</th>
              <th style={{ padding: '15px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                <td style={{ padding: '15px' }}>{item.name}</td>
                <td style={{ padding: '15px' }}>{item.email}</td>
                <td style={{ padding: '15px' }}><button style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Suspend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}