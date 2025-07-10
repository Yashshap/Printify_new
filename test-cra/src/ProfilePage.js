import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from './api';
import ShopRegistrationForm from './ShopRegistrationForm';

function ProfilePage({ navigate, isLoggedIn, setIsLoggedIn, user, setUser, handleLogout }) {
  // All hooks at the top
  const [showShopReg, setShowShopReg] = useState(false);
  const [store, setStore] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user ? { ...user } : {});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  const [isLoading, setIsLoading] = useState(true);
  const [shopReg, setShopReg] = useState({
    storeName: '', businessName: '', businessType: '', taxId: '', shopAddress: '', supportPhone: '', bankInfo: '', billingAddress: '', ownerName: '', pan: '', bankAccountNumber: '', ifsc: '', gstNumber: '', kycAddress: '', contactEmail: '', contactPhone: ''
  });
  const [isRegisteringStore, setIsRegisteringStore] = useState(false);
  const [shopRegToast, setShopRegToast] = useState({ message: '', type: 'success' });
  const [debugLogs, setDebugLogs] = useState([]);

  // Helper to add logs to the debug UI
  const addDebugLog = (msg, data) => {
    setDebugLogs(logs => [
      { msg, data: data ? JSON.stringify(data, null, 2) : undefined, ts: new Date().toLocaleTimeString() },
      ...logs.slice(0, 19) // keep last 20 logs
    ]);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const apiResponse = await api.get('/users/me');
          addDebugLog('[ProfilePage] API /users/me FULL RESPONSE', apiResponse);
          const { data } = apiResponse;
          addDebugLog('[ProfilePage] API /users/me response', data);
          addDebugLog('[ProfilePage] API /users/me response.data', data && data.data);
          setUser(data.data);
          setEditedUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
          addDebugLog('[ProfilePage] Set user state', data.data);
          addDebugLog('[ProfilePage] Set localStorage user', localStorage.getItem('user'));
          setIsLoading(false);
        } catch (error) {
          addDebugLog('[ProfilePage] Failed to fetch user profile (error object)', error);
          addDebugLog('[ProfilePage] Failed to fetch user profile (error.response)', error && error.response);
          addDebugLog('[ProfilePage] Failed to fetch user profile (error.message)', error && error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          navigate('/');
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [navigate, setIsLoggedIn, setUser]);

  useEffect(() => {
    if (user) {
      addDebugLog('[ProfilePage] user prop changed', user);
      setEditedUser({ ...user });
      api.get('/stores/me')
        .then(res => {
          addDebugLog('Fetched store', res.data);
          if (res.data && res.data.data) {
            setStore(res.data.data);
          }
        })
        .catch((err) => {
          addDebugLog('Failed to fetch store', err.message || err);
          setStore(null);
        });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      const { data } = await api.patch('/users/me', {
        firstName: editedUser?.firstName || '',
        lastName: editedUser?.lastName || '',
        mobile: editedUser?.mobile || '',
      });
      console.log('Profile updated:', data);
      setUser(data.data);
      setEditedUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      setIsEditing(false);
      window.dispatchEvent(new Event('userStateChanged'));
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const { data } = await api.put('/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile image URL received from backend:', data.data.profileImage);
      const updatedUser = { ...user, profileImage: `${data.data.profileImage}?t=${new Date().getTime()}` };
      setUser(updatedUser);
      setEditedUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userStateChanged'));
    } catch (error) {
      console.error('Failed to upload profile image', error);
    }
  };

  const onProfileImageDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onProfileImageDrop,
    accept: 'image/*',
    multiple: false,
  });

  function validateShopReg(shopReg) {
    const requiredFields = [
      'storeName', 'businessType', 'shopAddress', 'ownerName', 'pan', 'bankAccountNumber', 'ifsc', 'kycAddress', 'contactEmail', 'contactPhone'
    ];
    for (const field of requiredFields) {
      if (!shopReg[field] || shopReg[field].trim() === '') {
        return `Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1')}`;
      }
    }
    return null;
  }

  async function handleLaunchStore() {
    const validationError = validateShopReg(shopReg);
    if (validationError) {
      setShopRegToast({ message: validationError, type: 'error' });
      return;
    }
    setIsRegisteringStore(true);
    setShopRegToast({ message: '', type: 'success' });
    try {
      const token = localStorage.getItem('token');
      await api.post('/stores/register', shopReg, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShopRegToast({ message: 'Store registered successfully!', type: 'success' });
      setShopReg({
        storeName: '',
        businessName: '',
        businessType: '',
        taxId: '',
        shopAddress: '',
        supportPhone: '',
        bankInfo: '',
        billingAddress: '',
        ownerName: '',
        pan: '',
        bankAccountNumber: '',
        ifsc: '',
        gstNumber: '',
        kycAddress: '',
        contactEmail: '',
        contactPhone: ''
      });
      setShowShopReg(false);
      api.get('/stores/me').then(res => {
        if (res.data && res.data.data) setStore(res.data.data);
      });
    } catch (err) {
      setShopRegToast({ message: err.response?.data?.message || 'Failed to register store.', type: 'error' });
    } finally {
      setIsRegisteringStore(false);
    }
  }

  // Add a debug box to the UI
  const debugBox = (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      width: 340,
      maxHeight: 320,
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      fontSize: 12,
      borderRadius: 8,
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      padding: 12,
      overflow: 'auto',
      fontFamily: 'monospace',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>DEBUG: User Data</div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'none', color: '#fbbf24' }}>{JSON.stringify(user, null, 2)}</pre>
      <div style={{ fontWeight: 'bold', margin: '8px 0 2px 0' }}>Logs</div>
      <div style={{ maxHeight: 120, overflowY: 'auto' }}>
        {debugLogs.map((log, i) => (
          <div key={i} style={{ marginBottom: 4, borderBottom: '1px solid #333', paddingBottom: 2 }}>
            <span style={{ color: '#4e7097' }}>[{log.ts}]</span> <span style={{ color: '#fff' }}>{log.msg}</span>
            {log.data && <pre style={{ margin: 0, color: '#a3e635', background: 'none' }}>{log.data}</pre>}
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#176fd3] mx-auto mb-4"></div>
          <p className="text-[#4e7097] text-lg font-medium">Loading profile...</p>
        </div>
        {debugBox}
      </div>
    );
  }

  return (
    <>
      <div
        className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden"
        style={{ fontFamily: '"Inter", "Work Sans", "Noto Sans", sans-serif' }}
      >
        {/* Animated Gradient Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 50%, #fbbf24 100%)',
          animation: 'gradient-move 8s ease-in-out infinite',
          backgroundSize: '200% 200%'
        }} />
        
        {/* Decorative SVG Blob */}
        <svg style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, opacity: 0.18, zIndex: 1 }} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="200" fill="url(#profileBlob)" />
          <defs>
            <radialGradient id="profileBlob" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#176fd3" />
              <stop offset="1" stopColor="#fbbf24" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>

        <div className="layout-container flex h-full grow flex-col" style={{ position: 'relative', zIndex: 2 }}>
          <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 24,
                boxShadow: '0 8px 32px 0 rgba(23,111,211,0.08)',
                padding: '32px',
                marginBottom: 32,
                border: '2px solid #e0e7ff',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-center">
                  <div className="flex gap-6">
                    <div {...getRootProps()} className="cursor-pointer">
                      <input {...getInputProps()} />
                      <div
                        style={{
                          backgroundImage: `url(${(editedUser && editedUser.profileImage) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuClUEUOy2scE6UXRbDawj2q3Jm7dtLgFfdozKtLI7AhppWhOozYEKOiw0Y8GnEGlyY-wfYdYAZ12kBrBdGaMZ9_zv4AJyWxGoffutKBhfyeg1BEgxzOd0p8LExqt4s-AFB3EWJJThZyF5B5cXDPmymLp_NggK8xplUkNuDTMmtvvJwJVWCdNj5c2yot2Noz4eo0O2Wyk-uG_WdFk9k3-rs4MkE7LK_-OU4UTP_4swr8gyQhhI2Tk1XuE5cy9zNNFpRSLsQ5T54cXg'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          width: '128px',
                          height: '128px',
                          borderRadius: '50%',
                          border: '4px solid #e0e7ff',
                          boxShadow: '0 8px 24px 0 rgba(23,111,211,0.15)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 12px 32px 0 rgba(23,111,211,0.25)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(23,111,211,0.15)';
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: '#0e141b',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.01em'
                      }}>
                        {user && user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Loading...'}
                      </h2>
                      <p style={{
                        color: '#4e7097',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        margin: 0
                      }}>
                        {user && user.email ? user.email : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Combined Profile & Orders Card with Segmented Control */}
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 24,
                boxShadow: '0 8px 32px 0 rgba(23,111,211,0.08)',
                padding: '32px',
                marginBottom: 32,
                border: '2px solid #e0e7ff',
                backdropFilter: 'blur(10px)',
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Segmented Control */}
                <div style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 16,
                  padding: '4px',
                  marginBottom: '32px',
                  position: 'relative',
                  border: '2px solid #e0e7ff'
                }}>
                  {/* Sliding Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: activeTab === 'profile' ? '4px' : 'calc(50% + 4px)',
                    width: 'calc(50% - 4px)',
                    height: 'calc(100% - 8px)',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px 0 rgba(23,111,211,0.15)',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1
                  }} />
                  
                  {/* Profile Tab */}
                  <button
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: activeTab === 'profile' ? '#176fd3' : '#4e7097',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setActiveTab('profile')}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </button>
                  
                  {/* Orders Tab */}
                  <button
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: activeTab === 'orders' ? '#176fd3' : '#4e7097',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setActiveTab('orders')}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Orders
                  </button>
                </div>

                {/* Content Area */}
                {activeTab === 'profile' ? (
                  /* Personal Information Content */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#0e141b',
                      margin: '0 0 24px 0',
                      letterSpacing: '-0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: '#176fd3' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', flex: 1 }}>
                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 600 }}>First name</span>
                  <input
                            style={{
                              width: '100%',
                              padding: '16px',
                              borderRadius: '16px',
                              border: '2px solid #e0e7ff',
                              backgroundColor: 'rgba(248,250,252,0.8)',
                              color: '#0e141b',
                              fontSize: '1rem',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              outline: 'none',
                            }}
                    value={isEditing ? (editedUser?.firstName || '') : (user?.firstName || '')}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, firstName: e.target.value })}
                            onFocus={e => {
                              if (isEditing) {
                                e.target.style.border = '2px solid #176fd3';
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                              }
                            }}
                            onBlur={e => {
                              e.target.style.border = '2px solid #e0e7ff';
                              e.target.style.backgroundColor = 'rgba(248,250,252,0.8)';
                            }}
                  />
                </label>
              </div>
                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 600 }}>Last name</span>
                  <input
                            style={{
                              width: '100%',
                              padding: '16px',
                              borderRadius: '16px',
                              border: '2px solid #e0e7ff',
                              backgroundColor: 'rgba(248,250,252,0.8)',
                              color: '#0e141b',
                              fontSize: '1rem',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              outline: 'none',
                            }}
                    value={isEditing ? (editedUser?.lastName || '') : (user?.lastName || '')}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, lastName: e.target.value })}
                            onFocus={e => {
                              if (isEditing) {
                                e.target.style.border = '2px solid #176fd3';
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                              }
                            }}
                            onBlur={e => {
                              e.target.style.border = '2px solid #e0e7ff';
                              e.target.style.backgroundColor = 'rgba(248,250,252,0.8)';
                            }}
                  />
                </label>
              </div>
                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 600 }}>Email</span>
                  <input
                            style={{
                              width: '100%',
                              padding: '16px',
                              borderRadius: '16px',
                              border: '2px solid #e0e7ff',
                              backgroundColor: 'rgba(248,250,252,0.8)',
                              color: '#4e7097',
                              fontSize: '1rem',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              outline: 'none',
                            }}
                    value={user?.email || ''}
                    readOnly
                  />
                </label>
              </div>
                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 600 }}>Phone number</span>
                  <input
                            style={{
                              width: '100%',
                              padding: '16px',
                              borderRadius: '16px',
                              border: '2px solid #e0e7ff',
                              backgroundColor: 'rgba(248,250,252,0.8)',
                              color: '#0e141b',
                              fontSize: '1rem',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              outline: 'none',
                            }}
                    value={isEditing ? (editedUser?.mobile || '') : (user?.mobile || '')}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, mobile: e.target.value })}
                            onFocus={e => {
                              if (isEditing) {
                                e.target.style.border = '2px solid #176fd3';
                                e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
                              }
                            }}
                            onBlur={e => {
                              e.target.style.border = '2px solid #e0e7ff';
                              e.target.style.backgroundColor = 'rgba(248,250,252,0.8)';
                            }}
                  />
                </label>
                      </div>
                    </div>

                    {/* Action Buttons Section - Full Width */}
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'flex-end' }}>
                      <button
                        style={{
                          padding: '16px 32px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #176fd3 0%, #4e7097 100%)',
                          boxShadow: '0 4px 24px 0 rgba(23,111,211,0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(23,111,211,0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(23,111,211,0.3)';
                        }}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                      {!store && (
                        <button
                          style={{
                            padding: '16px 32px',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 999,
                            background: 'linear-gradient(90deg, #fbbf24 0%, #176fd3 100%)',
                            boxShadow: '0 4px 24px 0 rgba(251,191,36,0.3)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(251,191,36,0.4)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(251,191,36,0.3)';
                          }}
                          onClick={() => setShowShopReg(true)}
                        >
                          Register Shop
                        </button>
                      )}
                      <button
                        style={{
                          padding: '16px 32px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow: '0 4px 24px 0 rgba(239,68,68,0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(239,68,68,0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(239,68,68,0.3)';
                        }}
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  /* My Orders Content */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#0e141b',
                      margin: '0 0 24px 0',
                      letterSpacing: '-0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <svg style={{ width: '24px', height: '24px', color: '#fbbf24' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Orders
                    </h2>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '48px 24px',
                      textAlign: 'center',
                      flex: 1
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                      }}>
                        <svg style={{ width: '40px', height: '40px', color: '#176fd3' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#0e141b',
                        margin: '0 0 12px 0'
                      }}>
                        No Orders Yet
                      </h3>
                      <p style={{
                        color: '#4e7097',
                        fontSize: '1rem',
                        fontWeight: 500,
                        margin: '0 0 24px 0',
                        maxWidth: '400px'
                      }}>
                        Your order history will appear here once you place your first order.
                      </p>
                      <button
                        style={{
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #176fd3 0%, #4e7097 100%)',
                          boxShadow: '0 4px 16px 0 rgba(23,111,211,0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(23,111,211,0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(23,111,211,0.3)';
                        }}
                        onClick={() => navigate('/')}
                      >
                        Start Printing
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div style={{ marginBottom: 32 }}>
                  <button
                    style={{
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #176fd3 0%, #4e7097 100%)',
                      boxShadow: '0 4px 24px 0 rgba(23,111,211,0.3)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      width: '100%',
                      maxWidth: '480px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 28px 0 rgba(23,111,211,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(23,111,211,0.3)';
                    }}
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* My Store section */}
              {store && (
                <div style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 24,
                  boxShadow: '0 8px 32px 0 rgba(23,111,211,0.08)',
                  padding: '32px',
                  marginBottom: 32,
                  border: '2px solid #e0e7ff',
                  backdropFilter: 'blur(10px)',
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#0e141b',
                    margin: '0 0 24px 0',
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <svg style={{ width: '24px', height: '24px', color: '#fbbf24' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    My Store
                    {/* KYC Status */}
                    {store.kyc_status && (
                      <span style={{
                        marginLeft: 16,
                        padding: '4px 16px',
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 14,
                        background: store.kyc_status === 'approved' ? 'linear-gradient(90deg,#22c55e,#bbf7d0)' : store.kyc_status === 'rejected' ? 'linear-gradient(90deg,#ef4444,#fee2e2)' : 'linear-gradient(90deg,#fbbf24,#fef9c3)',
                        color: store.kyc_status === 'approved' ? '#15803d' : store.kyc_status === 'rejected' ? '#b91c1c' : '#b45309',
                        marginRight: 0
                      }}>
                        {store.kyc_status.charAt(0).toUpperCase() + store.kyc_status.slice(1)}
                      </span>
                    )}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      {store.storeProfileImage && (
                        <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundImage: `url(${store.storeProfileImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '3px solid #e0e7ff',
                          boxShadow: '0 4px 16px 0 rgba(23,111,211,0.15)',
                        }}
                        ></div>
                      )}
                      <div>
                      <h3 style={{
                        color: '#0e141b',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        margin: '0 0 4px 0'
                      }}>
                        {store.storeName}
                      </h3>
                      <span style={{
                        color: '#4e7097',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        padding: '4px 12px',
                        backgroundColor: '#e0e7ff',
                        borderRadius: '999px',
                        display: 'inline-block'
                      }}>
                        Status: {store.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div>
                      <p style={{ color: '#4e7097', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 8px 0' }}>Address:</p>
                      <p style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 500, margin: 0 }}>{store.shopAddress}</p>
                      </div>
                      <div>
                      <p style={{ color: '#4e7097', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 8px 0' }}>Phone:</p>
                      <p style={{ color: '#0e141b', fontSize: '1rem', fontWeight: 500, margin: 0 }}>{store.supportPhone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop Registration Modal */}
                  {showShopReg && (
                    <ShopRegistrationForm
                      shopReg={shopReg}
                      setShopReg={setShopReg}
                      isRegisteringStore={isRegisteringStore}
                      onSubmit={handleLaunchStore}
                      onCancel={() => setShowShopReg(false)}
                      toast={shopRegToast}
                      setToast={setShopRegToast}
                    />
                  )}
            </div>
          </div>
        </div>
      </div>
      {/* Keyframes for animated gradient */}
      <style>{`
        @keyframes gradient-move {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      {debugBox}
    </>
  );
}

export default ProfilePage; 