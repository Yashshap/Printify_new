import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import api from "./api";

// Set the workerSrc for pdfjs to use the official CDN version matching the installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SHOPS = [
  {
    id: 1,
    name: "Print Shop Central",
    label: "Shop 1",
    mobile: "(555) 123-4567",
    rating: 4.5,
    location: "123 Main St, Anytown",
    pendingOrders: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUKPqtKJTKLKH-fAH9O1oyl2-xayjoK-o2h9boVfFo0oIqisWBMrIneze_TRog3S3zNvTMWDFTtwYwoovH7rF5MdTIZlVTYzmPg5jLPc7MFvCzoOjT9QAJqgysyXqg5mFixJJE79AxMP8tbaxr30X7MqB3ixqcn77kRACY1V6hLrrxdCfo6MrYMEN5fmV2qQY2Ewz4ikDHd0v6tOlOC_b2rcj3YgOf2FI2DpwhNI_4iWUIXd_CWmKWuYOqvSz9GAOvfeu_p2hOyA"
  },
  {
    id: 2,
    name: "Quick Prints Now",
    label: "Shop 2",
    mobile: "(555) 987-6543",
    rating: 4.2,
    location: "456 Oak Ave, Anytown",
    pendingOrders: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFuEqfYGNIhx6wY4_ZRkbFeHUE6O72oUjIxhw8O_W_3o_VA5AfgxJEced8A9_C57paf_Oh9YHHjgWNsH55shUBOqNgnsccs2YoCCM5YtOFqunflEGaWWiW1p_7IKgwqU4da4xkFR2oWcxIXlaSPVWPKYSqKrPcfD5hk6gRauVfmT0-RpY_GPRR9zyY8mLqfPClVvahHij-p6TMXb4AvZli2x4ndCdtDk0f_lPbEC0gl-sWW19A-MBNy8oyTKUjE7Nk7oixLjV8Nw"
  },
  {
    id: 3,
    name: "Express Print Solutions",
    label: "Shop 3",
    mobile: "(555) 111-2222",
    rating: 4.8,
    location: "789 Pine Ln, Anytown",
    pendingOrders: 8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBjbsyPyJLY2uRbt4ZjVb7lT-JiRUa5CPEEa53mtDOWm2Ytpcc1u0CEdXJHsVJC1UMEeVnyycComSKPYFUIe0VH85midDGDAKtPJfAPLz3AzTixe1L7U31cLH4eXkR4s6klyKU0hXZMfButOfplyzue6NDg1gehFBfvHSeKB3Eneg_q5DSBziX_nLTw7is8Kx0uWgVh_xHEC2IVwmuCuRm92XmC9TaTMEJB066e_IzxH6e9ngnzg7iI8HtjffwnmmESGzQ-PO-wA"
  },
  {
    id: 4,
    name: "Print Masters Inc.",
    label: "Shop 4",
    mobile: "(555) 333-4444",
    rating: 4.6,
    location: "101 Elm Rd, Anytown",
    pendingOrders: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZyiLOYJejJrTeyh1FibV4zxkDxUdNfMrzUFn3BlKcpZLsywviGWQl2u9e5tejY8_xkdRF70nKSlBLA0JKvPC4xxXprOYaqcK8FPhcIW42lLcgvYHLBv_COjUAXl_KefuJW_mpNuXpMrmXZ6KVSxttebkG1s0HCTiPddP2y9gUnuYnlAi9Zoj-g8FvAiB-1s6f0tC2F0rQiT3aqCow86ikkMfvXpV5_P094FCcAqTvvRfCRb-H0kCcvBoPgAQj4NNeu8FLNPhRZQ"
  },
  {
    id: 5,
    name: "Print Pro Services",
    label: "Shop 5",
    mobile: "(555) 555-6666",
    rating: 4.3,
    location: "222 Maple Dr, Anytown",
    pendingOrders: 6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaOrDEHW9R444kqSLZ79IJk_XU8sZ7Ub91H6WXhLeF0vncBTOjtEAgGMvNX2bSPJwm3aQoG600VNeF9ydhLvFwF5q5H5fk2js1mQM1uVLCb1LZXOzkMjZM_FrWUw3toIrnXN5HpWipuWGHREyevaLiOwzAm1hqNCIPaWP9RKaXzh9r0N38UgIg4R9GiQ36J8TjBnxylCth1WACKGduuuaka7ykwqkqmPd-30j3M4yYdHzXh3oKGoH__fA4FQq0IChwZgSJ57L9xA"
  }
];

function parsePagesInput(input, numPages) {
  // Accepts comma-separated numbers and ranges (e.g., 1,3,5-7)
  if (!input) return [];
  const pages = new Set();
  input.split(",").forEach(part => {
    part = part.trim();
    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= numPages) pages.add(n);
    } else if (/^(\d+)-(\d+)$/.test(part)) {
      const [, start, end] = part.match(/(\d+)-(\d+)/);
      let s = parseInt(start, 10), e = parseInt(end, 10);
      if (s > e) [s, e] = [e, s];
      for (let i = s; i <= e; i++) {
        if (i >= 1 && i <= numPages) pages.add(i);
      }
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}

function Navbar({ active, onProfileClick, onLoginClick }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStateChanged', handleStorageChange);
    handleStorageChange();
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStateChanged', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/stores/me')
        .then(res => {
          if (res.data && res.data.data) {
            setStore(res.data.data);
          } else {
            setStore(null);
          }
        })
        .catch(() => setStore(null));
    } else {
      setStore(null);
    }
  }, [isLoggedIn]);

  const profileImage = user && user.profileImage
    ? `url(${user.profileImage})`
    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBp1cTiVe1zZPr9WqM9g762u7Cv14OfLUKepqDeIVsA7olVmiWyKwYy9zyScU4MiFLUGWmCX-PnY5xGKCsorNhVhL-fSE3lSP5FZuP728uHNuoCaZLNgFQ2FDEbW0eMfhi8tpUbCgKkGg9UlzXpXWwxX6MO5TbJ88xKDwkCj_0k3kGSLZRcjtRHf_Jgnbq9YkEHr-QxpazVkPpuR8FKdyBqFlZfWFLTuV4K98STg14T4LNkU4fRxF0Syt_CoL-a6uSytN9EOHEmsg")';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3 bg-white bg-opacity-95 backdrop-blur">
      <div className="flex items-center gap-4 text-[#0e141b]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
              fill="currentColor"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">Printify</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          {isLoggedIn && store ? (
            <>
              <a className={`text-[#0e141b] text-sm font-medium leading-normal${active === 'dashboard' ? ' underline font-bold' : ''}`} href="/dashboard">Dashboard</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="/orders">Orders</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#">Catalog</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#">Blog</a>
            </>
          ) : (
            <>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#">Catalog</a>
              <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#">Blog</a>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {!isLoggedIn && onLoginClick && (
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={onLoginClick}
            >
              <span className="truncate">Log in</span>
            </button>
          )}
          <button
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf3] text-[#0e141b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
          >
            <div className="text-[#0e141b]" data-icon="Question" data-size="20px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                ></path>
              </svg>
            </div>
          </button>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer"
            style={{ backgroundImage: profileImage }}
            onClick={onProfileClick || (() => navigate('/profile'))}
          ></div>
        </div>
      </div>
    </header>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const [showShopReg, setShowShopReg] = useState(false);
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch the user's store info
      api.get('/stores/me')
        .then(res => {
          if (res.data && res.data.data) {
            setStore(res.data.data);
          }
        })
        .catch(() => {
          setStore(null); // No store or error
        });
    }
  }, [user]);

  return (
    <>
      <Navbar onProfileClick={() => navigate('/profile')} />
      <div
        className="relative flex min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4"><p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Profile</p></div>
              <div className="flex p-4">
                <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between md:items-center">
                  <div className="flex gap-4">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                      style={{ backgroundImage: user && user.profileImage ? `url(${user.profileImage})` : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuClUEUOy2scE6UXRbDawj2q3Jm7dtLgFfdozKtLI7AhppWhOozYEKOiw0Y8GnEGlyY-wfYdYAZ12kBrBdGaMZ9_zv4AJyWxGoffutKBhfyeg1BEgxzOd0p8LExqt4s-AFB3EWJJThZyF5B5cXDPmymLp_NggK8xplUkNuDTMmtvvJwJVWCdNj5c2yot2Noz4eo0O2Wyk-uG_WdFk9k3-rs4MkE7LK_-OU4UTP_4swr8gyQhhI2Tk1XuE5cy9zNNFpRSLsQ5T54cXg")' }}
                    ></div>
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
                  <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value={user ? user.firstName : ''} readOnly />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Last name</p>
                  <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value={user ? user.lastName : ''} readOnly />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Email</p>
                  <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value={user ? user.email : ''} readOnly />
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Phone number</p>
                  <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value={user ? user.mobile : ''} readOnly />
                </label>
              </div>

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
                  <button
                    className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 text-left w-full hover:underline"
                    onClick={() => setShowShopReg((v) => !v)}
                  >
                    Shop Registration
                  </button>
                  {showShopReg && (
                    <>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Store Name (required)</p>
                          <input placeholder="Enter store name" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex flex-col p-4">
                        <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#d0dbe7] px-6 py-14">
                          <div className="flex max-w-[480px] flex-col items-center gap-2">
                            <p className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">Logo/Image Upload (optional)</p>
                            <p className="text-[#0e141b] text-sm font-normal leading-normal max-w-[480px] text-center">Drag and drop or browse to upload an image</p>
                          </div>
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
                            <span className="truncate">Upload Image</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Business Name/Legal Entity (optional)</p>
                          <input placeholder="Enter business name" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Business Type</p>
                          <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 bg-[image:--select-button-svg] placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal">
                            <option value="one">Select business type</option>
                            <option value="two">two</option>
                            <option value="three">three</option>
                          </select>
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Tax ID/GST/VAT Number (optional)</p>
                          <input placeholder="Enter tax ID" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Shop Address</p>
                          <input placeholder="Enter shop address" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Support Phone Number (optional)</p>
                          <input placeholder="Enter support phone number" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Bank Account Info/PayPal Email</p>
                          <input placeholder="Enter bank account info or PayPal email" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Billing Address</p>
                          <input placeholder="Enter billing address" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal" value="" />
                        </label>
                      </div>
                      <div className="flex justify-stretch">
                        <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#176fd3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
                            <span className="truncate">Launch Store</span>
                          </button>
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
                            <span className="truncate">Save & Continue Later</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AppContent() {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [colorMode, setColorMode] = useState("color");
  const [pagesInput, setPagesInput] = useState("");
  const [pagesToShow, setPagesToShow] = useState([]);
  const [showShopView, setShowShopView] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupData, setSignupData] = useState({ firstName: "", lastName: "", mobile: "", email: "", password: "", confirmPassword: "" });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  // Fetch shops from backend
  useEffect(() => {
    if (showShopView) {
      setShopsLoading(true);
      setShopsError("");
      api.get("/stores/all-approved")
        .then(res => {
          setShops(res.data.stores || []);
        })
        .catch(err => {
          setShopsError("Failed to load shops");
        })
        .finally(() => setShopsLoading(false));
    }
  }, [showShopView]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    // Validate file type and extension
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      alert('Please select a valid PDF file.');
      return;
    }
    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB.');
      return;
    }
    setPdfFile(file);
    setPagesInput("");
    setPagesToShow([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPagesInput("");
    setPagesToShow(Array.from({ length: numPages }, (_, i) => i + 1));
  }

  function handlePagesInputChange(e) {
    const value = e.target.value;
    setPagesInput(value);
    if (numPages) {
      const parsed = parsePagesInput(value, numPages);
      setPagesToShow(parsed.length > 0 ? parsed : []);
    }
  }

  function handleColorChange(mode) {
    setColorMode(mode);
  }

  // Login handler
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      if (res.data && res.data.data && res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
        // Fetch user profile after login and store in localStorage
        try {
          const profileRes = await api.get("/auth/me");
          if (profileRes.data && profileRes.data.data) {
            localStorage.setItem("user", JSON.stringify(profileRes.data.data));
            // Optionally, trigger a custom event for other components
            window.dispatchEvent(new Event('userStateChanged'));
          }
        } catch (profileErr) {
          // If fetching profile fails, clear token and user
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoginError("Failed to fetch user profile after login.");
          return;
        }
        setShowLogin(false);
        setLoginEmail("");
        setLoginPassword("");
        setLoginError("");
      } else {
        setLoginError("Invalid response from server");
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    }
  }

  // Signup handler
  async function handleSignup(e) {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    try {
      const res = await api.post("/auth/signup", {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        mobile: signupData.mobile,
        email: signupData.email,
        password: signupData.password,
      });
      setSignupSuccess("Signup successful! Please log in.");
      setShowSignup(false);
      setShowLogin(true);
      setSignupData({ firstName: "", lastName: "", mobile: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setSignupError(err.response?.data?.message || "Signup failed");
    }
  }

  // Order placement handler
  async function handlePlaceOrder() {
    if (!pdfFile) {
      alert('Please upload a PDF first');
      return;
    }
    
    if (!selectedShop) {
      alert('Please select a shop first');
      return;
    }

    if (!numPages) {
      alert('Please wait for PDF to load completely');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('storeId', selectedShop.id);
      formData.append('colorMode', colorMode === 'bw' ? 'black_white' : 'color');
      formData.append('pageRange', pagesInput || 'all');
      formData.append('paymentStatus', 'pending');
      formData.append('paymentMethod', 'online');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to place an order');
        setShowLogin(true);
        return;
      }

      // Upload to backend
      const response = await api.post('/orders/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        alert('Order placed successfully!');
        // Reset form
        setPdfFile(null);
        setNumPages(null);
        setPagesInput("");
        setPagesToShow([]);
        setSelectedShop(null);
        setColorMode('color');
      } else {
        alert('Failed to place order: ' + response.data.message);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (error.response?.status === 401) {
        alert('Please login to place an order');
        setShowLogin(true);
      } else {
        alert('Failed to place order: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsPlacingOrder(false);
    }
  }

  const handlePrint = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <>
      <Navbar onProfileClick={() => navigate('/profile')} onLoginClick={() => setShowLogin(true)} />
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            {!pdfFile ? (
              <>
                <h2 className="text-[#111418] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
                  Upload Your PDF
                </h2>
                <div className="flex flex-col p-4">
                  <div
                    {...getRootProps()}
                    className={
                      "flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#d5dbe2] px-6 py-14 " +
                      (isDragActive ? "bg-blue-100" : "")
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                        {isDragActive ? "Drop the PDF here ..." : "Drag and drop your PDF here"}
                      </p>
                      <p className="text-[#111418] text-sm font-normal leading-normal max-w-[480px] text-center">
                        Or
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#eaedf0] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                      onClick={e => {
                        e.stopPropagation();
                        getInputProps().onClick(e);
                      }}
                    >
                      <span className="truncate">Choose a File</span>
                    </button>
                  </div>
                </div>
              </>
            ) : showShopView ? (
              <div className="px-10 flex flex-1 justify-center py-5 w-full">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1 relative">
                  <div className="flex flex-wrap justify-between gap-3 p-4">
                    <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Shops</p>
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl bg-white bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center shadow"
                      onClick={() => setShowShopView(false)}
                      aria-label="Dismiss shop list"
                    >
                      ×
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <label className="flex flex-col min-w-40 h-12 w-full">
                      <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                        <div className="text-[#5e7187] flex border-none bg-[#eaedf0] items-center justify-center pl-4 rounded-l-xl border-r-0" data-icon="MagnifyingGlass" data-size="24px" data-weight="regular">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                          </svg>
                        </div>
                        <input placeholder="Search shops" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#eaedf0] focus:border-none h-full placeholder:text-[#5e7187] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" />
                      </div>
                    </label>
                  </div>
                  <div className="overflow-y-auto max-h-[520px] pr-2">
                    {shopsLoading ? (
                      <div className="p-4 text-center">Loading shops...</div>
                    ) : shopsError ? (
                      <div className="p-4 text-center text-red-500">{shopsError}</div>
                    ) : shops.length === 0 ? (
                      <div className="p-4 text-center">No shops found.</div>
                    ) : (
                      shops.map(shop => (
                        <div className="p-4" key={shop.id}>
                          <div className="flex items-stretch justify-between gap-4 rounded-xl">
                            <div className="flex flex-[2_2_0px] flex-col gap-4">
                              <div className="flex flex-col gap-1">
                                <p className="text-[#5e7187] text-sm font-normal leading-normal">{shop.label || shop.storeName}</p>
                                <p className="text-[#111418] text-base font-bold leading-tight">{shop.name || shop.storeName}</p>
                                <p className="text-[#5e7187] text-sm font-normal leading-normal">Mobile: {shop.supportPhone} • Location: {shop.shopAddress}</p>
                              </div>
                              <button
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-3 bg-[#eaedf0] text-[#111418] text-sm font-medium leading-normal w-auto"
                                onClick={() => { setSelectedShop(shop); setShowShopView(false); }}
                              >
                                <span className="truncate">Select</span>
                              </button>
                            </div>
                            {/* Optionally show shop image if available */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full max-w-[920px] mx-auto">
                <h3 className="text-lg font-bold mb-2">PDF Preview</h3>
                <div className="border rounded shadow p-2 bg-white w-full max-w-[700px] h-[700px] overflow-auto">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={error => {
                      console.error('PDF load error:', error);
                      if (pdfFile) {
                        console.error('PDF file info:', {
                          name: pdfFile.name,
                          type: pdfFile.type,
                          size: pdfFile.size
                        });
                      }
                      alert('Failed to load PDF. Please make sure the file is a valid PDF and try again.');
                    }}
                    loading={<div>Loading PDF...</div>}
                  >
                    {(pagesToShow.length > 0 ? pagesToShow : Array.from({ length: numPages }, (_, i) => i + 1)).map((pageNum, idx, arr) => (
                      <React.Fragment key={pageNum}>
                        <div style={colorMode === "bw" ? { filter: "grayscale(1)" } : {}}>
                          <Page pageNumber={pageNum} width={650} />
                        </div>
                        {idx < arr.length - 1 && (
                          <div className="w-full border-t border-gray-300 my-4"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </Document>
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-red-200 text-red-800 rounded"
                  onClick={() => {
                    setPdfFile(null);
                    setNumPages(null);
                    setPagesInput("");
                    setPagesToShow([]);
                  }}
                >
                  Remove PDF
                </button>
              </div>
            )}
          </div>
          <div className="layout-content-container flex flex-col w-[360px]">
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Print Options
            </h2>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Number of Pages</p>
                <input
                  placeholder="e.g. 1,3,5-7"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#d5dbe2] bg-gray-50 focus:border-[#d5dbe2] h-14 placeholder:text-[#5e7187] p-[15px] text-base font-normal leading-normal"
                  value={pagesInput}
                  onChange={handlePagesInputChange}
                  disabled={!pdfFile || !numPages}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 p-4">
              <label
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#d5dbe2] px-4 h-11 text-[#111418] cursor-pointer ${colorMode === "color" ? "border-[3px] px-3.5 border-[#b4cae3]" : ""}`}
              >
                Color
                <input
                  type="radio"
                  className="invisible absolute"
                  name="print-color"
                  checked={colorMode === "color"}
                  onChange={() => handleColorChange("color")}
                />
              </label>
              <label
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#d5dbe2] px-4 h-11 text-[#111418] cursor-pointer ${colorMode === "bw" ? "border-[3px] px-3.5 border-[#b4cae3]" : ""}`}
              >
                Black & White
                <input
                  type="radio"
                  className="invisible absolute"
                  name="print-color"
                  checked={colorMode === "bw"}
                  onChange={() => handleColorChange("bw")}
                />
              </label>
            </div>
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Order Summary
            </h2>
            <div className="p-4 grid gap-y-4 border-t border-t-[#d5dbe2]">
              <div className="flex justify-between items-center">
                <span className="text-[#5e7187] text-sm font-normal leading-normal">Total Pages</span>
                <span className="text-[#111418] text-sm font-normal leading-normal">{(pagesToShow.length > 0 ? pagesToShow.length : numPages) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5e7187] text-sm font-normal leading-normal">Type</span>
                <span className="text-[#111418] text-sm font-normal leading-normal">{colorMode === 'bw' ? 'Black & White' : 'Color'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5e7187] text-sm font-normal leading-normal">Price</span>
                <span className="text-[#111418] text-sm font-normal leading-normal">
                  {((pagesToShow.length > 0 ? pagesToShow.length : numPages) * (colorMode === 'bw' ? 0.10 : 0.20)).toFixed(2)}
                </span>
              </div>
              {selectedShop ? (
                <div
                  className="flex items-center gap-4 p-3 border rounded-xl bg-[#f8fafc] my-2 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => setShowShopView(true)}
                  title="Change shop"
                >
                  <div className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-xl" style={{ backgroundImage: `url('${selectedShop.image || selectedShop.storeProfileImage || ""}')` }}></div>
                  <div className="flex flex-col">
                    <span className="text-[#111418] text-base font-bold leading-tight">{selectedShop.name || selectedShop.storeName}</span>
                    <span className="text-[#5e7187] text-sm font-normal leading-normal">{selectedShop.location || selectedShop.shopAddress}</span>
                    <span className="text-[#5e7187] text-sm font-normal leading-normal">Mobile: {selectedShop.mobile || selectedShop.supportPhone}</span>
                    {selectedShop.rating && (
                      <span className="text-[#5e7187] text-sm font-normal leading-normal">Rating: {selectedShop.rating}</span>
                    )}
                    {selectedShop.pendingOrders && (
                      <span className="text-[#5e7187] text-sm font-normal leading-normal">Pending Orders: {selectedShop.pendingOrders}</span>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#eaedf0] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] mt-2"
                  onClick={() => setShowShopView(true)}
                >
                  <span className="truncate">Select Shop</span>
                </button>
              )}
            </div>
            <div className="flex px-4 py-3">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#b4cae3] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={handlePlaceOrder}
              >
                <span className="truncate">Place Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4 relative">
            <h2 className="text-xl font-bold text-center mb-2">Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
              {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
              <button
                className="w-full bg-[#176fd3] text-white font-bold py-2 rounded-lg mt-2"
                type="submit"
              >
                Login
              </button>
            </form>
            <div className="text-center text-sm text-[#5e7187] mt-2">
              Don't have an account? <button className="text-[#176fd3] underline" onClick={() => { setShowLogin(false); setShowSignup(true); }}>Create one</button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4 relative">
            <h2 className="text-xl font-bold text-center mb-2">Sign Up</h2>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="First Name"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.firstName}
                onChange={e => setSignupData(d => ({ ...d, firstName: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.lastName}
                onChange={e => setSignupData(d => ({ ...d, lastName: e.target.value }))}
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.mobile}
                onChange={e => setSignupData(d => ({ ...d, mobile: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.email}
                onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.password}
                onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 mb-2"
                value={signupData.confirmPassword}
                onChange={e => setSignupData(d => ({ ...d, confirmPassword: e.target.value }))}
                required
              />
              {signupError && <div className="text-red-500 text-sm mb-2">{signupError}</div>}
              {signupSuccess && <div className="text-green-600 text-sm mb-2">{signupSuccess}</div>}
              <button
                className="w-full bg-[#176fd3] text-white font-bold py-2 rounded-lg mt-2"
                type="submit"
              >
                Sign Up
              </button>
            </form>
            <div className="text-center text-sm text-[#5e7187] mt-2">
              Already have an account? <button className="text-[#176fd3] underline" onClick={() => { setShowSignup(false); setShowLogin(true); }}>Log in</button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowSignup(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function OrdersPage() {
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = React.useState('all');
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [storeId, setStoreId] = React.useState(null);
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);

  React.useEffect(() => {
    async function fetchStore() {
      try {
        const res = await api.get('/stores/me');
        if (res.data && res.data.data && res.data.data.id) {
          setStoreId(res.data.data.id);
        } else {
          setError('No store found for this user.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch store info.');
        setLoading(false);
      }
    }
    fetchStore();
  }, []);

  React.useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    const params = orderFilter === 'all' ? '' : `?status=${orderFilter}`;
    api.get(`/orders/shop/${storeId}${params}`)
      .then(res => {
        setOrders(res.data.orders || []);
      })
      .catch(() => {
        setError('Failed to fetch orders.');
      })
      .finally(() => setLoading(false));
  }, [storeId, orderFilter]);

  const handlePrint = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  const handleComplete = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/orders/${orderId}/status`, { status: 'completed' }, { headers: { 'Authorization': `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
      alert('Order marked as completed!');
    } catch (err) {
      alert('Failed to mark order as completed.');
    }
  };

  const filteredOrders = orders;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}>
      <Navbar active="orders" onProfileClick={() => navigate('/profile')} />
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1400px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Orders</p>
          </div>
          <div className="px-4 py-3 @container">
            <div className="flex items-center mb-4 gap-2">
              {['all', 'pending', 'completed'].map(option => (
                <button
                  key={option}
                  className={`px-5 py-2 rounded-xl text-sm font-medium border border-[#d0dbe7] transition-colors duration-150 ${orderFilter === option ? 'bg-[#176fd3] text-white' : 'bg-white text-[#0e141b]'}`}
                  onClick={() => setOrderFilter(option)}
                  type="button"
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex overflow-x-auto rounded-xl border border-[#d0dbe7] bg-slate-50">
              <table className="flex-1 min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Order #</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[180px] text-sm font-medium leading-normal">User Name</th>
                    <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Mobile Number</th>
                    <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Date</th>
                    <th className="px-2 py-3 text-left text-[#0e141b] w-[120px] text-sm font-medium leading-normal">Time</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[220px] text-sm font-medium leading-normal">File Name</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-60 text-sm font-medium leading-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr
                        className={`border-t border-t-[#d0dbe7] cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      >
                        <td className="h-[72px] px-4 py-2 w-[120px] text-[#0e141b] text-sm font-normal leading-normal">{order.id}</td>
                        <td className="h-[72px] px-4 py-2 w-[180px] text-[#4e7097] text-sm font-normal leading-normal">{order.user?.firstName} {order.user?.lastName}</td>
                        <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">{order.user?.mobile}</td>
                        <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">{order.date}</td>
                        <td className="h-[72px] px-2 py-2 w-[120px] text-[#4e7097] text-sm font-normal leading-normal">{order.time}</td>
                        <td className="h-[72px] px-4 py-2 w-[220px] text-[#4e7097] text-sm font-normal leading-normal">{order.file}</td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal flex items-center justify-start">
                          <button className="flex w-28 min-w-0 max-w-[480px] cursor-pointer items-center justify-start overflow-hidden rounded-full h-8 px-3 bg-[#e7edf3] text-[#0e141b] text-sm font-medium leading-normal">
                            <span className="truncate">{order.status}</span>
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={7} className="bg-white p-6 border-t border-b border-[#b4cae3]">
                            <div className="flex flex-col gap-2">
                              <div><b>Order ID:</b> {order.id}</div>
                              <div><b>User:</b> {order.user?.firstName} {order.user?.lastName} ({order.user?.email})</div>
                              <div><b>Mobile:</b> {order.user?.mobile}</div>
                              <div><b>Date:</b> {order.date}</div>
                              <div><b>Time:</b> {order.time}</div>
                              <div><b>File Name:</b> {order.file}</div>
                              <div><b>Status:</b> {order.status}</div>
                              <div className="flex gap-3 mt-3">
                                {order.pdfUrl && (
                                  <>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={e => { e.stopPropagation(); window.open(order.pdfUrl, '_blank'); }}>Preview</button>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={e => { e.stopPropagation(); handlePrint(order.pdfUrl); }}>Print</button>
                                  </>
                                )}
                                {order.status !== 'completed' && (
                                  <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={e => { e.stopPropagation(); handleComplete(order.id); }}>Mark as Completed</button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopOwnerDashboard() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: '"Work Sans", "Noto Sans", sans-serif' }}>
      <Navbar active="dashboard" onProfileClick={() => navigate('/profile')} />
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1400px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
          </div>
          {/* Dashboard is empty for now */}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<ShopOwnerDashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Router>
  );
}
