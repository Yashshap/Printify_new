import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from './api';
import ShopRegistrationForm from './ShopRegistrationForm';

function ProfilePage({ onLoginClick, isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [showShopReg, setShowShopReg] = useState(false);
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [shopReg, setShopReg] = useState({
    storeName: '',
    businessName: '',
    businessType: '',
    taxId: '',
    shopAddress: '',
    supportPhone: '',
    bankInfo: '',
    billingAddress: ''
  });
  const [isRegisteringStore, setIsRegisteringStore] = useState(false);
  const [shopRegToast, setShopRegToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/stores/me')
        .then(res => {
          if (res.data && res.data.data) {
            setStore(res.data.data);
          }
        })
        .catch(() => {
          setStore(null);
        });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.dispatchEvent(new Event('storage'));
    setIsLoggedIn(false);
  };

  async function handleLaunchStore() {
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
        billingAddress: ''
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

  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append('firstName', editedUser.firstName);
    formData.append('lastName', editedUser.lastName);
    formData.append('mobile', editedUser.mobile);
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }
    try {
      const { data } = await api.patch('/users/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(data.data);
      setEditedUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      setIsEditing(false);
      window.dispatchEvent(new Event('userStateChanged'));
    } catch (error) {
      console.error('Failed to update profile', error);
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
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onProfileImageDrop,
    accept: 'image/*',
    multiple: false,
  });

  return (
    <>
      <div
        className="relative flex min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Profile</p>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#176fd3] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div className="flex p-4">
                <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between md:items-center">
                  <div className="flex gap-4">
                    <div {...getRootProps()} className="cursor-pointer">
                      <input {...getInputProps()} />
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                        style={{ backgroundImage: `url(${editedUser.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuClUEUOy2scE6UXRbDawj2q3Jm7dtLgFfdozKtLI7AhppWhOozYEKOiw0Y8GnEGlyY-wfYdYAZ12kBrBdGaMZ9_zv4AJyWxGoffutKBhfyeg1BEgxzOd0p8LExqt4s-AFB3EWJJThZyF5B5cXDPmymLp_NggK8xplUkNuDTMmtvvJwJVWCdNj5c2yot2Noz4eo0O2Wyk-uG_WdFk9k3-rs4MkE7LK_-OU4UTP_4swr8gyQhhI2Tk1XuE5cy9zNNFpRSLsQ5T54cXg'})`, border: 'none' }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em]">{user ? `${user.firstName} ${user.lastName}` : ''}</p>
                      <p className="text-[#4e7097] text-base font-normal leading-normal">{user ? user.email : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Personal information</h2>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">First name</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
                    value={isEditing ? editedUser.firstName : user?.firstName || ''}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, firstName: e.target.value })}
                  />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Last name</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
                    value={isEditing ? editedUser.lastName : user?.lastName || ''}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, lastName: e.target.value })}
                  />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Email</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
                    value={user?.email || ''}
                    readOnly
                  />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Phone number</p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
                    value={isEditing ? editedUser.mobile : user?.mobile || ''}
                    readOnly={!isEditing}
                    onChange={(e) => isEditing && setEditedUser({ ...editedUser, mobile: e.target.value })}
                  />
                </label>
              </div>

              {isEditing && (
                <div className="flex px-4 py-3">
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#176fd3] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* My Store section */}
              {store && (
                <>
                  <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">My Store</h2>
                  <div className="bg-white rounded-xl p-4 border border-[#d0dbe7] mx-4 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      {store.storeProfileImage && (
                        <div
                          className="w-16 h-16 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${store.storeProfileImage})` }}
                        ></div>
                      )}
                      <div>
                        <p className="text-[#0e141b] text-lg font-bold">{store.storeName}</p>
                        <p className="text-[#4e7097] text-sm">Status: {store.status}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#4e7097]">Address:</p>
                        <p className="text-[#0e141b]">{store.shopAddress}</p>
                      </div>
                      <div>
                        <p className="text-[#4e7097]">Phone:</p>
                        <p className="text-[#0e141b]">{store.supportPhone}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Shop Registration section: only if user does NOT have a store */}
              {!store && (
                <>
                  <div className="px-4 py-3">
                    <button
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#176fd3] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
                      onClick={() => setShowShopReg(true)}
                    >
                      Register Shop
                    </button>
                  </div>
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
                </>
              )}

              <div className="flex px-4 py-3">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f87171] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
                  onClick={handleLogout}
                >
                  <span className="truncate">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage; 