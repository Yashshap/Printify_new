import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import api from "./api";
import ShopRegistrationForm from './ShopRegistrationForm';
import ShopPrintOrders from './ShopPrintOrders';
import ProfilePage from './ProfilePage';

// Set the workerSrc for pdfjs to use the CDN version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

function Navbar({ active, onProfileClick, onLoginClick, isLoggedIn }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
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
        .catch(() => setStore(null))
        .finally(() => setLoading(false));
    } else {
      setStore(null);
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (loading) return null;

  const profileImage = user && user.profileImage
    ? `url(${user.profileImage})`
    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBp1cTiVe1zZPr9WqM9g762u7Cv14OfLUKepqDeIVsA7olVmiWyKwYy9zyScU4MiFLUGWmCX-PnY5xGKCsorNhVhL-fSE3lSP5FZuP728uHNuoCaZLNgFQ2FDEbW0eMfhi8tpUbCgKkGg9UlzXpXWwxX6MO5TbJ88xKDwkCj_0k3kGSLZRcjtRHf_Jgnbq9YkEHr-QxpazVkPpuR8FKdyBqFlZfWFLTuV4K98STg14T4LNkU4fRxF0Syt_CoL-a6uSytN9EOHEmsg")';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3 bg-white bg-opacity-95 backdrop-blur">
      <div className="flex items-center gap-4 text-[#0e141b] cursor-pointer" onClick={() => navigate('/')}>
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
          <Link className="text-[#0e141b] text-sm font-medium leading-normal" to="/">Home</Link>
          {isLoggedIn && store && (
            <>
              <Link className={`text-[#0e141b] text-sm font-medium leading-normal${active === 'dashboard' ? ' underline font-bold' : ''}`} to="/dashboard">Dashboard</Link>
              <Link className="text-[#0e141b] text-sm font-medium leading-normal" to="/orders">Orders</Link>
            </>
          )}
          <Link className="text-[#0e141b] text-sm font-medium leading-normal" to="/catalog">Catalog</Link>
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
          {isLoggedIn && (
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer"
              style={{ backgroundImage: profileImage }}
              onClick={() => {
                console.log('Profile picture clicked', { isLoggedIn, user });
                if (onProfileClick) {
                  onProfileClick();
                } else {
                  navigate('/profile');
                }
              }}
            ></div>
          )}
        </div>
      </div>
    </header>
  );
}

function MainAppContent({ isLoggedIn, setIsLoggedIn, onLoginClick, showLogin, setShowLogin }) {
  const [showSignup, setShowSignup] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupData, setSignupData] = useState({ firstName: "", lastName: "", mobile: "", email: "", password: "", confirmPassword: "" });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [colorMode, setColorMode] = useState("color");
  const [pagesInput, setPagesInput] = useState("");
  const [pagesToShow, setPagesToShow] = useState([]);
  const [showShopView, setShowShopView] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState("");
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

  // Restore handleLogin
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
        setIsLoggedIn(true); // Update isLoggedIn state
      } else {
        setLoginError("Invalid response from server");
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    }
  }

  // Restore handleSignup
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

  return (
    <>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-4 sm:px-6 flex flex-col lg:flex-row flex-1 justify-center py-5">
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
              <div className="px-4 sm:px-10 flex flex-1 justify-center py-5 w-full">
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
                <div className="border rounded shadow p-2 bg-white w-full max-w-[100vw] md:max-w-[700px] h-[70vh] overflow-auto">
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
                          <Page pageNumber={pageNum} width={window.innerWidth < 768 ? window.innerWidth - 40 : 650} />
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
          <div className="layout-content-container flex flex-col w-full lg:w-[360px]">
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const handleProfileClick = React.useCallback(() => navigate('/profile'), [navigate]);
  const [showLogin, setShowLogin] = React.useState(false);
  const handleLoginClick = React.useCallback(() => setShowLogin(true), []);

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        onProfileClick={handleProfileClick}
        onLoginClick={handleLoginClick}
      />
      <Routes>
        <Route path="/" element={<MainAppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onLoginClick={handleLoginClick} showLogin={showLogin} setShowLogin={setShowLogin} />} />
        <Route path="/profile" element={<ProfilePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onLoginClick={handleLoginClick} />} />
        <Route path="/orders" element={<ShopPrintOrders />} />
      </Routes>
    </>
  );
}
