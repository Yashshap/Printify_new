import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import api from "./api";
import ShopRegistrationForm from './ShopRegistrationForm';
import ShopPrintOrders from './ShopPrintOrders';
import ProfilePage from './ProfilePage';
import CatalogPage from './CatalogPage';
import { toast } from 'react-toastify';

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
      setUser(userData && userData !== 'undefined' ? JSON.parse(userData) : null);
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

  console.log('Navbar profileImage:', profileImage);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap px-10 py-3 bg-white/80 backdrop-blur-md shadow-md border-b-2 border-[#176fd3]">
      <div className="flex items-center gap-4 text-[#0e141b] cursor-pointer select-none" onClick={() => navigate('/')}> 
        <div className="size-6 md:size-8 lg:size-10">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
              fill="#176fd3"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
              fill="#176fd3"
            ></path>
          </svg>
        </div>
        <h2 className="text-[#0e141b] text-2xl md:text-3xl font-extrabold leading-tight tracking-[-0.015em] drop-shadow-sm">Printify</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link className={`text-[#0e141b] text-sm font-semibold leading-normal px-2 py-1 rounded transition relative ${active === 'home' ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-[#176fd3] after:rounded-full' : 'hover:bg-[#e0e7ff] hover:text-[#176fd3]'}`} to="/">Home</Link>
          {isLoggedIn && store && (
            <>
              <Link className={`text-[#0e141b] text-sm font-semibold leading-normal px-2 py-1 rounded transition relative ${active === 'dashboard' ? 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-[#176fd3] after:rounded-full' : 'hover:bg-[#e0e7ff] hover:text-[#176fd3]'}`} to="/dashboard">Dashboard</Link>
              <Link className="text-[#0e141b] text-sm font-semibold leading-normal px-2 py-1 rounded transition hover:bg-[#e0e7ff] hover:text-[#176fd3]" to="/orders">Orders</Link>
            </>
          )}
          <Link className="text-[#0e141b] text-sm font-semibold leading-normal px-2 py-1 rounded transition hover:bg-[#e0e7ff] hover:text-[#176fd3]" to="/catalog">Catalog</Link>
        </div>
        <div className="flex gap-2">
          {!isLoggedIn && onLoginClick && (
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-gradient-to-r from-[#176fd3] to-[#4e7097] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow hover:scale-105 transition"
              onClick={onLoginClick}
            >
              <span className="truncate">Log in</span>
            </button>
          )}
          {isLoggedIn && (
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-[#176fd3] shadow cursor-pointer hover:scale-105 transition"
              style={{ backgroundImage: profileImage }}
              onClick={() => {
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

function MainAppContent({ isLoggedIn, setIsLoggedIn, onLoginClick, showLogin, setShowLogin, handleLogin, loginEmail, setLoginEmail, loginPassword, setLoginPassword, loginError }) {
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({ firstName: "", lastName: "", mobile: "", email: "", password: "", confirmPassword: "" });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [colorMode, setColorMode] = useState("color");
  const [pagesInput, setPagesInput] = useState("");
  const [pagesToShow, setPagesToShow] = useState([]);
  const pagesInputRef = useRef("");
  const [showShopView, setShowShopView] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const initiateRazorpayPayment = (orderId, amount, currency, key_id, orderDetails) => {
    try {
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Printify",
        description: "Order Payment",
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post('/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDetails.id,
            });

            if (verifyResponse.data.status === 'success') {
              toast('Payment successful and order confirmed!', { type: 'success' });
              // Reset form
              setPdfFile(null);
              setNumPages(null);
              setPagesInput("");
              pagesInputRef.current = "";
              setPagesToShow([]);
              setSelectedShop(null);
              setColorMode('color');
            } else {
              toast('Payment verification failed: ' + verifyResponse.data.message, { type: 'error' });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast('An error occurred during payment verification.', { type: 'error' });
          }
        },
        prefill: {
          name: orderDetails.user.firstName + " " + orderDetails.user.lastName,
          email: orderDetails.user.email,
          contact: orderDetails.user.mobile,
        },
        notes: {
          address: "Printify Office",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            toast('Payment cancelled by user.', { type: 'info' });
            console.log('Razorpay modal dismissed by user');
          }
        },
        // Razorpay does not have a direct onPaymentError, but we can use handler and modal.ondismiss
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast('Payment failed: ' + (response.error && response.error.description ? response.error.description : 'Unknown error'), { type: 'error' });
        console.error('Razorpay payment failed:', response);
      });
      rzp.open();
      console.log('Razorpay payment modal opened');
    } catch (err) {
      console.error('Error launching Razorpay:', err);
      toast('Could not launch payment window. Please try again.', { type: 'error' });
    }
  };

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

  // Monitor pagesInput changes for debugging
  useEffect(() => {
    console.log('pagesInput changed to:', pagesInput);
  }, [pagesInput]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    // Validate file type and extension
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      toast('Please select a valid PDF file.', { type: 'error' });
      return;
    }
    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast('File size must be less than 20MB.', { type: 'error' });
      return;
    }
    setPdfFile(file);
    console.log('Clearing pages input due to new PDF file');
    setPagesInput("");
    pagesInputRef.current = "";
    setPagesToShow([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    console.log('Clearing pages input due to document load success');
    setPagesInput("");
    pagesInputRef.current = "";
    setPagesToShow(Array.from({ length: numPages }, (_, i) => i + 1));
  }

  function handlePagesInputChange(e) {
    const value = e.target.value;
    console.log('Pages input changing to:', value);
    pagesInputRef.current = value;
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
      toast('Please upload a PDF first', { type: 'error' });
      return;
    }
    
    if (!selectedShop) {
      toast('Please select a shop first', { type: 'error' });
      return;
    }

    if (!numPages) {
      toast('Please wait for PDF to load completely', { type: 'info' });
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
        toast('Please login to place an order', { type: 'error' });
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
        const { orderId, amount, currency, key_id } = response.data.data.razorpayOrder;
        const orderDetails = response.data.data.order;
        initiateRazorpayPayment(orderId, amount, currency, key_id, orderDetails);
      } else {
        toast('Failed to place order: ' + response.data.message, { type: 'error' });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (error.response?.status === 401) {
        toast('Please login to place an order', { type: 'error' });
        setShowLogin(true);
      } else {
        toast('Failed to place order: ' + (error.response?.data?.message || error.message), { type: 'error' });
      }
    } finally {
      setIsPlacingOrder(false);
    }
  }

  const handlePrint = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

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
      toast(err.response?.data?.message || "Signup failed", { type: 'error' });
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
                      "flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed px-6 py-14 transition-all duration-300 shadow-lg " +
                      (isDragActive
                        ? "border-[#176fd3] bg-gradient-to-br from-[#e0e7ff] to-[#f8fafc] scale-105"
                        : "border-[#d5dbe2] bg-white hover:shadow-2xl")
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-[#176fd3] mb-2 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ filter: 'url(#arrowShadow)' }}
                      >
                        <defs>
                          <filter id="arrowShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
                          </filter>
                        </defs>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-4 4m4-4l4 4m-8 4h8" />
                      </svg>
                      <p className="text-[#0e141b] text-lg font-bold text-center">
                        {isDragActive ? "Drop the PDF here ..." : "Drag and drop your PDF here"}
                      </p>
                      <p className="text-[#4e7097] text-sm text-center">Or</p>
                    <button
                      type="button"
                        className="mt-2 px-6 py-2 bg-gradient-to-r from-[#fbbf24] to-[#176fd3] text-white rounded-full font-bold shadow hover:scale-105 transition animate-gradient-x"
                      onClick={e => {
                        e.stopPropagation();
                        getInputProps().onClick(e);
                      }}
                    >
                        Choose a File
                    </button>
                  </div>
                </div>
                  </div>
              </>
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
                      toast('Failed to load PDF. Please make sure the file is a valid PDF and try again.', { type: 'error' });
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
                    pagesInputRef.current = "";
                    setPagesToShow([]);
                  }}
                >
                  Remove PDF
                </button>
              </div>
            )}
          </div>
          <div className="layout-content-container flex flex-col w-full lg:w-[360px] bg-white rounded-2xl shadow-xl p-6 mt-6 lg:mt-0 transition-all duration-300">
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-2 flex items-center gap-2">
              <span className="relative inline-block w-8 h-8 align-middle">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                  {/* Printer body */}
                  <rect x="6" y="16" width="28" height="14" rx="3" fill="#176fd3" />
                  <rect x="10" y="8" width="20" height="10" rx="2" fill="#fbbf24" />
                  {/* Animated paper */}
                  <rect id="animated-paper" x="13" y="22" width="14" height="10" rx="1" fill="#fff" className="animate-print-paper" />
                  <rect x="15" y="25" width="10" height="2" rx="1" fill="#e0e7ff" />
                  <rect x="15" y="28" width="10" height="2" rx="1" fill="#e0e7ff" />
                </svg>
              </span>
              Print Options
            </h2>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Number of Pages</p>
                <div className="relative">
                <input
                    key={`pages-input-${pdfFile?.name || 'no-file'}`}
                  placeholder="e.g. 1,3,5-7"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-none focus:ring-2 focus:ring-[#176fd3] border border-[#d5dbe2] bg-[#f8fafc] h-14 placeholder:text-[#5e7187] p-[15px] text-base font-normal leading-normal transition-all duration-200"
                    value={pagesInput || pagesInputRef.current}
                  onChange={handlePagesInputChange}
                  disabled={!pdfFile || !numPages}
                />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4e7187]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" /></svg>
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-3 py-2">
              <label
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#d5dbe2] px-4 h-11 text-[#111418] cursor-pointer transition-all duration-200 ${colorMode === "color" ? "border-[3px] px-3.5 border-[#176fd3] bg-gradient-to-r from-[#176fd3] to-[#4e7097] text-white shadow-lg" : "hover:border-[#176fd3]"}`}
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
                className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#d5dbe2] px-4 h-11 text-[#111418] cursor-pointer transition-all duration-200 ${colorMode === "bw" ? "border-[3px] px-3.5 border-[#176fd3] bg-gradient-to-r from-[#176fd3] to-[#4e7097] text-white shadow-lg" : "hover:border-[#176fd3]"}`}
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
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#fbbf24]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>
              Order Summary
            </h2>
            <div className="p-4 grid gap-y-4 border-t border-t-[#d5dbe2] bg-[#f8fafc] rounded-xl shadow-inner">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-[#5e7187] text-sm font-normal leading-normal">
                  <svg className="w-5 h-5 align-middle leading-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><rect x="4" y="3" width="12" height="14" rx="2" fill="#e0e7ff" stroke="#176fd3" strokeWidth="1.5"/><rect x="7" y="7" width="6" height="1.5" rx="0.75" fill="#b4cae3"/><rect x="7" y="10" width="6" height="1.5" rx="0.75" fill="#b4cae3"/></svg>
                  Total Pages
                </span>
                <span className="text-[#111418] text-sm font-normal leading-normal">{(pagesToShow.length > 0 ? pagesToShow.length : numPages) || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-[#5e7187] text-sm font-normal leading-normal">
                  <svg className="w-5 h-5 align-middle leading-none" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="12" cy="12" rx="10" ry="8" fill="url(#paletteGradient)" />
                    <circle cx="8.5" cy="14" r="2" fill="#f87171" />
                    <circle cx="12" cy="9.5" r="2" fill="#34d399" />
                    <circle cx="15.5" cy="15" r="2" fill="#60a5fa" />
                  </svg>
                  Type
                </span>
                <span className="text-[#111418] text-sm font-normal leading-normal">{colorMode === 'bw' ? 'Black & White' : 'Color'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-[#5e7187] text-sm font-normal leading-normal">
                  <svg className="w-5 h-5 align-middle leading-none" fill="none" viewBox="0 0 20 20"><text x="2" y="16" fontSize="16" fontWeight="bold" fill="#fbbf24">₹</text></svg>
                  Price
                </span>
                <span className="text-[#fbbf24] text-base font-bold leading-normal">
                  {((pagesToShow.length > 0 ? pagesToShow.length : numPages) * (colorMode === 'bw' ? 0.10 : 0.20)).toFixed(2)}
                </span>
              </div>
              {selectedShop ? (
                <div
                  className="flex items-center gap-4 p-3 border rounded-xl bg-white my-2 cursor-pointer hover:bg-[#e0e7ff] hover:shadow-lg transition"
                  onClick={() => setShowShopView(true)}
                  title="Change shop"
                >
                  <div className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-xl border-2 border-[#176fd3] shadow" style={{ backgroundImage: `url('${selectedShop.image || selectedShop.storeProfileImage || ""}')` }}></div>
                  <div className="flex flex-col">
                    <span className="text-[#111418] text-base font-bold leading-tight">{selectedShop.name || selectedShop.storeName}</span>
                    <span className="text-[#5e7187] text-sm font-normal leading-normal">{selectedShop.location || selectedShop.shopAddress}</span>
                    <span className="text-[#5e7187] text-sm font-normal leading-normal">Mobile: {selectedShop.mobile || selectedShop.supportPhone}</span>
                    {selectedShop.rating && (
                      <span className="text-[#22c55e] text-sm font-normal leading-normal">Rating: {selectedShop.rating}</span>
                    )}
                    {selectedShop.pendingOrders && (
                      <span className="text-[#ef4444] text-sm font-normal leading-normal">Pending Orders: {selectedShop.pendingOrders}</span>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-gradient-to-r from-[#176fd3] to-[#4e7097] text-white text-sm font-bold leading-normal tracking-[0.015em] mt-2 shadow hover:scale-105 transition"
                  onClick={() => setShowShopView(true)}
                >
                  <span className="truncate">Select Shop</span>
                </button>
              )}
            </div>
            <div className="flex py-3">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 flex-1 bg-gradient-to-r from-[#fbbf24] to-[#176fd3] text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:scale-105 transition"
                onClick={handlePlaceOrder}
              >
                <span className="truncate">Place Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay Shop Selection View */}
      {showShopView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="px-4 sm:px-10 flex flex-1 justify-center py-5 w-full animate-slide-up">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 h-[600px] relative bg-white rounded-2xl shadow-xl border-2 border-[#176fd3]/20 p-6">
              {/* Decorative SVG blob */}
              <div className="absolute top-20 right-10 w-64 h-64 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#176fd3" d="M45.3,-63.4C59.9,-54.8,73.5,-42.9,79.8,-28.4C86.1,-13.9,85.1,3.2,83.9,20.3C82.7,37.4,81.3,54.5,74.2,67.1C67.1,79.7,54.3,87.8,40.1,91.9C25.9,96,10.4,96.1,-2.8,100.2C-16,104.3,-29.2,112.4,-42.1,109.8C-55,107.2,-67.6,93.9,-75.8,79.1C-84,64.3,-87.8,48,-89.9,31.4C-92,14.8,-92.4,-2.1,-90.8,-18.5C-89.2,-34.9,-85.6,-50.8,-78.2,-63.8C-70.8,-76.8,-59.6,-86.9,-46.8,-93.1C-34,-99.3,-19.5,-101.6,-5.2,-94.2C9.1,-86.8,30.7,-72,45.3,-63.4Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="flex flex-wrap justify-between gap-3 p-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#176fd3] to-[#4e7097] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">Select Shop</p>
                    <p className="text-[#5e7187] text-sm">Choose your preferred printing shop</p>
                  </div>
                </div>
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl bg-white/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => setShowShopView(false)}
                  aria-label="Dismiss shop list"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#5e7187]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    placeholder="Search shops by name or location..." 
                    className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-[#d5dbe2] rounded-xl text-[#111418] placeholder:text-[#5e7187] text-sm font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#176fd3] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md" 
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#5e7187]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[520px] pr-2 px-4">
                {shopsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#176fd3] mx-auto mb-4"></div>
                      <p className="text-[#5e7187] text-center">Loading shops...</p>
                    </div>
                  </div>
                ) : shopsError ? (
                  <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 font-semibold">Error Loading Shops</p>
                    </div>
                    <p className="text-red-500 text-sm">{shopsError}</p>
                  </div>
                ) : shops.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
                    <svg className="w-16 h-16 text-[#5e7187] mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-[#5e7187] text-lg font-medium mb-2">No shops found</p>
                    <p className="text-[#5e7187] text-sm">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {shops.map((shop, index) => {
                      // Static data for rating and estimated time (will be replaced with API data later)
                      const staticData = [
                        { rating: 4.8, estimatedTime: "2-3h", profileImage: null },
                        { rating: 4.6, estimatedTime: "1-2h", profileImage: null },
                        { rating: 4.9, estimatedTime: "3-4h", profileImage: null },
                        { rating: 4.7, estimatedTime: "2-3h", profileImage: null },
                        { rating: 4.5, estimatedTime: "1-2h", profileImage: null }
                      ];
                      const shopData = staticData[index % staticData.length];
                      
                      return (
                        <div 
                          key={shop.id}
                          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-[#176fd3]/20 group cursor-pointer"
                          onClick={() => { 
                            console.log('Shop selected:', shop.name || shop.storeName);
                            setSelectedShop(shop); 
                            setShowShopView(false); 
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Profile Picture */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-white flex-shrink-0">
                              {shopData.profileImage ? (
                                <img 
                                  src={shopData.profileImage} 
                                  alt={`${shop.name || shop.storeName} profile`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#176fd3] to-[#4e7097] flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Shop Name */}
                              <p className="text-[#111418] text-base font-bold leading-tight mb-1">{shop.name || shop.storeName}</p>
                              
                              {/* Contact and Location */}
                              <div className="flex items-center gap-3 text-[#5e7187] text-xs mb-2">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="truncate">{shop.supportPhone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{shop.shopAddress}</span>
                                </div>
                              </div>
                              
                              {/* Rating and Time */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg 
                                        key={i}
                                        className={`w-3 h-3 ${i < Math.floor(shopData.rating) ? 'text-[#fbbf24]' : 'text-gray-300'}`}
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-[#111418] text-xs font-medium">{shopData.rating}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-[#5e7187]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-[#5e7187] text-xs">{shopData.estimatedTime}</span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-[#176fd3] to-[#4e7097] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group-hover:from-[#4e7097] group-hover:to-[#176fd3] flex-shrink-0"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                console.log('Shop selected via button:', shop.name || shop.storeName);
                                setSelectedShop(shop); 
                                setShowShopView(false); 
                              }}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [user, setUser] = React.useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
  });
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");

  const navigate = useNavigate();
  const handleProfileClick = React.useCallback(() => navigate('/profile'), [navigate]);
  const [showLogin, setShowLogin] = React.useState(false);
  const handleLoginClick = React.useCallback(() => setShowLogin(true), []);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  }, [navigate, setIsLoggedIn, setUser]);

  // Effect to update user state when localStorage changes (e.g., after login/logout)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null);
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStateChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStateChanged', handleStorageChange);
    };
  }, []);

  // Parallax and mouse background state
  const [parallax, setParallax] = useState({ y1: 0, y2: 0 });
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const parallaxRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallax({
        y1: scrollY * 0.15,
        y2: scrollY * 0.08,
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      if (res.data && res.data.data && res.data.data.token) {
        localStorage.setItem("token", res.data.data.token);
        // Fetch user profile after login and store in localStorage
        try {
          const profileRes = await api.get("/users/me");
          if (profileRes.data && profileRes.data.data) {
            localStorage.setItem("user", JSON.stringify(profileRes.data.data));
            setUser(profileRes.data.data); // Ensure App state is updated
            window.dispatchEvent(new Event('userStateChanged'));
          }
        } catch (profileErr) {
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
      toast(err.response?.data?.message || "Login failed", { type: 'error' });
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] relative overflow-x-hidden"
      style={{
        background: `radial-gradient(ellipse 40% 30% at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(251,191,36,0.10), transparent 80%)`
      }}
    >
      {/* Parallax Decorative SVG Top Left */}
      <svg
        className="absolute left-[-120px] top-[-120px] w-[320px] h-[320px] opacity-30 z-0 animate-float-slow"
        style={{ transform: `translateY(${parallax.y1}px)` }}
        viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="200" cy="200" r="200" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#176fd3" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
      {/* Parallax Decorative SVG Bottom Right */}
      <svg
        className="absolute right-[-120px] bottom-[-120px] w-[320px] h-[320px] opacity-20 z-0 animate-float-slower"
        style={{ transform: `translateY(-${parallax.y2}px)` }}
        viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="200" cy="200" rx="200" ry="180" fill="url(#paint1_radial)" />
        <defs>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200 180)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24" />
            <stop offset="1" stopColor="#176fd3" stopOpacity="0.15" />
          </radialGradient>
        </defs>
      </svg>
      <Navbar
        isLoggedIn={isLoggedIn}
        onProfileClick={handleProfileClick}
        onLoginClick={handleLoginClick}
        user={user}
      />
      {/* Animated section background for dashboard content */}
      <div className="relative z-10">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#e0e7ff]/60 via-[#fbbf24]/10 to-[#176fd3]/10 animate-gradient-move pointer-events-none rounded-3xl blur-2xl" />
        <main className="relative z-10 animate-fadein-slow">
      <Routes>
            <Route
              path="/"
              element={
                <MainAppContent
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  onLoginClick={handleLoginClick}
                  showLogin={showLogin}
                  setShowLogin={setShowLogin}
                  handleLogin={handleLogin}
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  loginError={loginError}
                />
              }
            />
        <Route path="/profile" element={<ProfilePage navigate={navigate} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} setUser={setUser} handleLogout={handleLogout} />} />
        <Route path="/orders" element={<ShopPrintOrders />} />
        <Route path="/catalog" element={<CatalogPage />} />
      </Routes>
        </main>
      </div>
    </div>
  );
}
