import React from 'react';
import api from './api';
import { toast } from 'react-toastify';

export default function ShopRegistrationForm({
  shopReg,
  setShopReg,
  isRegisteringStore,
  setIsRegisteringStore,
  setShowShopReg,
  onSubmit,
  onCancel
}) {
  const [panFile, setPanFile] = React.useState(null);
  const [addressProofFile, setAddressProofFile] = React.useState(null);
  const [bankProofFile, setBankProofFile] = React.useState(null);
  // Remove unused DigiLocker setters for now

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      // Add text fields
      Object.entries(shopReg).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Add KYC files (manual or DigiLocker-fetched)
      if (panFile) formData.append('panDocument', panFile);
      // else if (panDigi) formData.append('panDocument', panDigi); // Removed as per edit hint
      if (addressProofFile) formData.append('addressProof', addressProofFile);
      // else if (addressProofDigi) formData.append('addressProof', addressProofDigi); // Removed as per edit hint
      if (bankProofFile) formData.append('bankProof', bankProofFile);
      // else if (bankProofDigi) formData.append('bankProof', bankProofDigi); // Removed as per edit hint
      setIsRegisteringStore(true);
      const token = localStorage.getItem('token');
      await api.post('/stores/register', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast('Store registered successfully! It will be reviewed by admin.', { type: 'success' });
      setShowShopReg(false);
      // Optionally reset form state here
    } catch (err) {
      // Show all backend errors in toast
      if (err.response?.data?.validationErrors) {
        toast(err.response.data.validationErrors.map(v => v.message).join('\n'), { type: 'error' });
      } else {
        toast(err.response?.data?.message || 'Failed to register store.', { type: 'error' });
      }
    } finally {
      setIsRegisteringStore(false);
    }
  }

  return (
    <>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Store Name (required)</p>
          <input
            placeholder="Enter store name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.storeName}
            onChange={e => setShopReg(s => ({ ...s, storeName: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Business Name/Legal Entity (optional)</p>
          <input
            placeholder="Enter business name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.businessName}
            onChange={e => setShopReg(s => ({ ...s, businessName: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Business Type</p>
          <select
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 bg-[image:--select-button-svg] placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.businessType}
            onChange={e => setShopReg(s => ({ ...s, businessType: e.target.value }))}
          >
            <option value="">Select business type</option>
            <option value="individual">Individual</option>
            <option value="partnership">Partnership</option>
            <option value="corporation">Corporation</option>
            <option value="llc">LLC</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Tax ID/GST/VAT Number (optional)</p>
          <input
            placeholder="Enter tax ID"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.taxId}
            onChange={e => setShopReg(s => ({ ...s, taxId: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Shop Address</p>
          <input
            placeholder="Enter shop address"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.shopAddress}
            onChange={e => setShopReg(s => ({ ...s, shopAddress: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Support Phone Number (optional)</p>
          <input
            placeholder="Enter support phone number"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.supportPhone}
            onChange={e => setShopReg(s => ({ ...s, supportPhone: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Bank Account Info/PayPal Email</p>
          <input
            placeholder="Enter bank account info or PayPal email"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.bankInfo}
            onChange={e => setShopReg(s => ({ ...s, bankInfo: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Billing Address</p>
          <input
            placeholder="Enter billing address"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.billingAddress}
            onChange={e => setShopReg(s => ({ ...s, billingAddress: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Owner Name (required)</p>
          <input
            placeholder="Enter owner name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.ownerName || ''}
            onChange={e => setShopReg(s => ({ ...s, ownerName: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">PAN Document (required)</p>
          <input type="file" accept="application/pdf,image/*" onChange={e => setPanFile(e.target.files[0])} disabled={!!panFile} />
          <button type="button" onClick={() => { /* TODO: DigiLocker fetch logic for PAN */ }} disabled={!!panFile}>Fetch from DigiLocker</button>
          {panFile && <span>Selected: {panFile.name}</span>}
          {/* Removed panDigi && <span>Fetched from DigiLocker</span> */}
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Bank Account Number (required)</p>
          <input
            placeholder="Enter bank account number"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.bankAccountNumber || ''}
            onChange={e => setShopReg(s => ({ ...s, bankAccountNumber: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">IFSC (required)</p>
          <input
            placeholder="Enter IFSC code"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.ifsc || ''}
            onChange={e => setShopReg(s => ({ ...s, ifsc: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">GST Number (optional)</p>
          <input
            placeholder="Enter GST number"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.gstNumber || ''}
            onChange={e => setShopReg(s => ({ ...s, gstNumber: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">KYC Address (required)</p>
          <input
            placeholder="Enter KYC address"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.kycAddress || ''}
            onChange={e => setShopReg(s => ({ ...s, kycAddress: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Contact Email (required)</p>
          <input
            placeholder="Enter contact email"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.contactEmail || ''}
            onChange={e => setShopReg(s => ({ ...s, contactEmail: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Contact Phone (required)</p>
          <input
            placeholder="Enter contact phone number"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7097] p-[15px] text-base font-normal leading-normal"
            value={shopReg.contactPhone || ''}
            onChange={e => setShopReg(s => ({ ...s, contactPhone: e.target.value }))}
          />
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Address Proof Document (required)</p>
          <input type="file" accept="application/pdf,image/*" onChange={e => setAddressProofFile(e.target.files[0])} disabled={!!addressProofFile} />
          <button type="button" onClick={() => { /* TODO: DigiLocker fetch logic for Address Proof */ }} disabled={!!addressProofFile}>Fetch from DigiLocker</button>
          {addressProofFile && <span>Selected: {addressProofFile.name}</span>}
          {/* Removed addressProofDigi && <span>Fetched from DigiLocker</span> */}
        </label>
      </div>
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Bank Proof Document (required)</p>
          <input type="file" accept="application/pdf,image/*" onChange={e => setBankProofFile(e.target.files[0])} disabled={!!bankProofFile} />
          <button type="button" onClick={() => { /* TODO: DigiLocker fetch logic for Bank Proof */ }} disabled={!!bankProofFile}>Fetch from DigiLocker</button>
          {bankProofFile && <span>Selected: {bankProofFile.name}</span>}
          {/* Removed bankProofDigi && <span>Fetched from DigiLocker</span> */}
        </label>
      </div>
      <div className="flex justify-stretch">
        <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#176fd3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
            onClick={handleSubmit}
            disabled={isRegisteringStore}
          >
            {isRegisteringStore ? 'Launching...' : 'Launch Store'}
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]" onClick={onCancel}>
            <span className="truncate">Cancel</span>
          </button>
        </div>
      </div>
    </>
  );
} 