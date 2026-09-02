'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  IdCard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';

const PROPERTY_TYPES = [
  'Camping Ground',
  'Glamping',
  'Cabin',
  'Campervan',
  'Motocamp',
  'Bike Camp',
  'Saung / Gazebo',
] as const;

const POPULAR_BANKS = [
  'BCA (Bank Central Asia)',
  'Bank Mandiri',
  'BRI (Bank Rakyat Indonesia)',
  'BNI (Bank Negara Indonesia)',
  'BSI (Bank Syariah Indonesia)',
  'Bank CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank BTN (Bank Tabungan Negara)',
  'Bank BJB (BJB Jawa Barat & Banten)',
  'Bank Jatim',
  'Bank Jateng',
  'Bank Sumut',
  'Bank Nagari (BPD Sumatera Barat)',
  'Bank Sulselbar',
  'Bank Kalbar',
  'Bank Kalsel',
  'Bank Jago',
  'SeaBank Indonesia',
  'Bank Neo Commerce (BNC)',
  'Allo Bank Indonesia',
  'Bank OCBC NISP',
  'Bank Panin',
  'Bank Maybank Indonesia',
  'Bank Sinarmas',
  'Bank Mega',
  'Bank Muamalat',
  'Bank Lainnya',
] as const;

type FormState = {
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  ktpNumber: string;
  ownerAddress: string;
  campsiteName: string;
  campsiteType: string;
  campsitePhone: string;
  campsiteEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  province: string;
  city: string;
  district: string;
  campsiteAddress: string;
  googleMapsUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
};

const initialForm: FormState = {
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  ktpNumber: '',
  ownerAddress: '',
  campsiteName: '',
  campsiteType: '',
  campsitePhone: '',
  campsiteEmail: '',
  instagramUrl: '',
  tiktokUrl: '',
  websiteUrl: '',
  province: '',
  city: '',
  district: '',
  campsiteAddress: '',
  googleMapsUrl: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
};

const steps = [
  { id: 0, title: 'Akun Pemilik', short: 'Akun' },
  { id: 1, title: 'Identitas & KTP', short: 'Identitas' },
  { id: 2, title: 'Tempat Camp', short: 'Campsite' },
  { id: 3, title: 'Lokasi & Peta', short: 'Lokasi' },
  { id: 4, title: 'Rekening Payout', short: 'Rekening' },
] as const;

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
  PENDING_REVIEW: {
    label: 'Menunggu Verifikasi Tim',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    desc: 'Pengajuan Anda sedang ditinjau oleh tim kurasi Embun. Estimasi proses 1-2 hari kerja.',
  },
  NEEDS_REVISION: {
    label: 'Perlu Dilengkapi / Revisi',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    desc: 'Ada beberapa data yang perlu diperjelas atau dilengkapi sebelum kemitraan disetujui.',
  },
  APPROVED: {
    label: 'Pendaftaran Disetujui',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    desc: 'Selamat! Akun Anda telah disetujui. Tim operasional Embun akan menghubungi Anda untuk akses backoffice.',
  },
  REJECTED: {
    label: 'Pengajuan Belum Sesuai',
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    desc: 'Mohon maaf, saat ini lokasi atau data properti belum memenuhi kriteria kemitraan Embun.',
  },
};

type PartnerApplicationResult = {
  id: string;
  status: string;
  ownerName: string;
  email: string;
  phone: string;
  ktpNumber?: string;
  ktpPhotoUrl?: string;
  ownerAddress?: string;
  campsiteName: string;
  campsiteType?: string | null;
  campsitePhone?: string | null;
  campsiteEmail?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  province: string;
  city: string;
  district?: string | null;
  campsiteAddress?: string;
  googleMapsUrl?: string | null;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  reviewNote?: string | null;
  revisionSections?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
};

const SECTION_STEP_INDEX: Record<string, number> = {
  owner: 0,
  ktp: 1,
  campsite: 2,
  location: 3,
  bank: 4,
};

const SECTION_TITLE_MAP: Record<string, string> = {
  owner: 'Akun & Kontak Pemilik',
  ktp: 'Legalitas & Foto KTP',
  campsite: 'Profil Tempat Camp',
  location: 'Lokasi & Alamat Campsite',
  bank: 'Rekening Pencairan (Payout)',
};

const FIELD_TITLE_MAP: Record<string, string> = {
  // Owner
  ownerName: 'Nama Pemilik / PIC',
  email: 'Email Terdaftar',
  phone: 'Nomor WhatsApp PIC',
  owner: 'Akun & Kontak Pemilik',
  // KTP
  ktpNumber: 'NIK KTP',
  ownerAddress: 'Alamat Domisili KTP',
  ktpPhoto: 'Foto KTP',
  ktp: 'Legalitas & Foto KTP',
  // Campsite
  campsiteName: 'Nama Campsite',
  campsiteType: 'Tipe Properti',
  campsitePhone: 'No. WhatsApp Campsite',
  campsiteEmail: 'Email Bisnis Campsite',
  instagramUrl: 'Instagram',
  tiktokUrl: 'TikTok / Website',
  campsite: 'Profil Tempat Camp',
  // Location
  provinceCity: 'Provinsi & Kota / Kab',
  district: 'Kecamatan',
  campsiteAddress: 'Alamat Lengkap Campsite',
  googleMapsUrl: 'Link Titik Google Maps',
  location: 'Lokasi & Alamat Campsite',
  // Bank
  bankName: 'Nama Bank',
  bankAccountNumber: 'Nomor Rekening Bank',
  bankAccountHolder: 'Nama Pemilik Rekening',
  bank: 'Rekening Pencairan (Payout)',
};

export default function MitraRegisterPage() {
  const [mode, setMode] = useState<'register' | 'status'>('register');
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [ktpPhoto, setKtpPhoto] = useState<File | null>(null);
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null);
  const [showKtpModal, setShowKtpModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PartnerApplicationResult | null>(null);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [authPassword, setAuthPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [resubmitSuccessMsg, setResubmitSuccessMsg] = useState('');
  const [statusTab, setStatusTab] = useState<'revision' | 'details'>('revision');
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('embun_mitra_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.result) {
          setResult(parsed.result);
          setMode('status');
          populateFormFromResult(parsed.result);
          if (parsed.authPassword) {
            setAuthPassword(parsed.authPassword);
            if (parsed.result.email) {
              fetch(`${API_BASE_URL}/partner-applications/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsed.result.email, password: parsed.authPassword }),
              })
                .then(async (res) => {
                  if (res.ok) {
                    const latest = await res.json();
                    setResult(latest);
                    setMode('status');
                    populateFormFromResult(latest);
                    localStorage.setItem(
                      'embun_mitra_session',
                      JSON.stringify({ result: latest, authPassword: parsed.authPassword }),
                    );
                  }
                })
                .catch(() => undefined);
            }
          }
          setStatusTab(parsed.result.status === 'NEEDS_REVISION' ? 'revision' : 'details');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('embun_mitra_session');
    } catch {}
    setResult(null);
    setLogin({ email: '', password: '' });
    setAuthPassword('');
    setError('');
    setResubmitSuccessMsg('');
    setIsRevising(false);
    setStatusTab('revision');
  };

  const isFieldNeedsRevision = (fieldKey: string, sectionKey?: string) => {
    if (!result || result.status !== 'NEEDS_REVISION') return false;
    if (!result.revisionSections || result.revisionSections.trim() === '') return true;
    const list = result.revisionSections.split(',').map((s) => s.trim());
    return list.includes(fieldKey) || (sectionKey ? list.includes(sectionKey) : false);
  };

  const isSectionNeedsRevision = (sectionKey: string, fieldKeys: string[]) => {
    if (!result || result.status !== 'NEEDS_REVISION') return false;
    if (!result.revisionSections || result.revisionSections.trim() === '') return true;
    const list = result.revisionSections.split(',').map((s) => s.trim());
    return list.includes(sectionKey) || fieldKeys.some((k) => list.includes(k));
  };

  // Cascading Region Dropdown State
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleKtpChange(file);
      }
    }
  };

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    setLoadingProvinces(true);
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((res) => res.json())
      .then((data: { id: string; name: string }[]) => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
          setProvinces(sorted);
        }
      })
      .catch((err) => console.error('Failed to load provinces', err))
      .finally(() => setLoadingProvinces(false));
  }, []);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    const prov = provinces.find((p) => p.id === provinceId);
    const provName = prov ? toTitleCase(prov.name) : '';
    setForm((prev) => ({ ...prev, province: provName, city: '', district: '' }));
    setSelectedCityId('');
    setCities([]);
    setDistricts([]);

    if (provinceId) {
      setLoadingCities(true);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`)
        .then((res) => res.json())
        .then((data: { id: string; name: string }[]) => {
          if (Array.isArray(data)) {
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setCities(sorted);
          }
        })
        .catch((err) => console.error('Failed to load cities', err))
        .finally(() => setLoadingCities(false));
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const c = cities.find((item) => item.id === cityId);
    const cityName = c ? toTitleCase(c.name) : '';
    setForm((prev) => ({ ...prev, city: cityName, district: '' }));
    setDistricts([]);

    if (cityId) {
      setLoadingDistricts(true);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`)
        .then((res) => res.json())
        .then((data: { id: string; name: string }[]) => {
          if (Array.isArray(data)) {
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            setDistricts(sorted);
          }
        })
        .catch((err) => console.error('Failed to load districts', err))
        .finally(() => setLoadingDistricts(false));
    }
  };

  const handleDistrictChange = (districtId: string) => {
    const d = districts.find((item) => item.id === districtId);
    const districtName = d ? toTitleCase(d.name) : '';
    setForm((prev) => ({ ...prev, district: districtName }));
  };

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const togglePropertyType = (type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    setForm((prev) => ({ ...prev, campsiteType: updated.join(', ') }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const normalizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
      cleaned = cleaned.slice(2);
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleKtpChange = (file: File | null) => {
    setKtpPhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setKtpPreviewUrl(url);
    } else {
      setKtpPreviewUrl(null);
    }
  };

  // Validasi ketat per step
  const isStepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          form.ownerName.trim().length >= 3 &&
          isValidEmail(form.email) &&
          form.phone.trim().length >= 8 &&
          (form.password.length >= 8 || isRevising)
        );
      case 1:
        return (
          form.ktpNumber.trim().length >= 16 &&
          form.ownerAddress.trim().length >= 5 &&
          (ktpPhoto !== null || ktpPreviewUrl !== null)
        );
      case 2:
        const isCampsiteEmailValid =
          !form.campsiteEmail.trim() || isValidEmail(form.campsiteEmail);
        return (
          form.campsiteName.trim().length >= 3 &&
          form.campsitePhone.trim().length >= 8 &&
          isCampsiteEmailValid
        );
      case 3:
        return (
          form.province.trim().length >= 2 &&
          form.city.trim().length >= 2 &&
          form.campsiteAddress.trim().length >= 8
        );
      case 4:
        return (
          form.bankName.trim().length >= 2 &&
          form.bankAccountNumber.trim().length >= 4 &&
          form.bankAccountHolder.trim().length >= 3 &&
          (isAgreed || isRevising)
        );
      default:
        return false;
    }
  }, [step, form, ktpPhoto, ktpPreviewUrl, isRevising, isAgreed]);

  const handleNextStep = () => {
    if (!isStepValid) return;
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (targetIndex: number) => {
    // Hanya izinkan navigasi mundur atau ke step yang sudah pernah diselesaikan
    if (isRevising || targetIndex <= step || completedSteps.includes(targetIndex - 1)) {
      setStep(targetIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const populateFormFromResult = (app: PartnerApplicationResult) => {
    setForm({
      ownerName: app.ownerName || '',
      email: app.email || '',
      phone: app.phone ? normalizePhone(app.phone) : '',
      password: authPassword || login.password || form.password || '',
      ktpNumber: app.ktpNumber || '',
      ownerAddress: app.ownerAddress || '',
      campsiteName: app.campsiteName || '',
      campsiteType: app.campsiteType || '',
      campsitePhone: app.campsitePhone ? normalizePhone(app.campsitePhone) : '',
      campsiteEmail: app.campsiteEmail || '',
      instagramUrl: app.instagramUrl || '',
      tiktokUrl: app.tiktokUrl || '',
      websiteUrl: app.websiteUrl || '',
      province: app.province || '',
      city: app.city || '',
      district: app.district || '',
      campsiteAddress: app.campsiteAddress || '',
      googleMapsUrl: app.googleMapsUrl || '',
      bankName: app.bankName || '',
      bankAccountNumber: app.bankAccountNumber || '',
      bankAccountHolder: app.bankAccountHolder || '',
    });
    if (app.campsiteType) {
      setSelectedTypes(
        app.campsiteType.split(',').map((s) => s.trim()).filter(Boolean),
      );
    }
    if (app.ktpPhotoUrl) {
      const fullUrl = app.ktpPhotoUrl.startsWith('http')
        ? app.ktpPhotoUrl
        : `${API_BASE_URL}${app.ktpPhotoUrl}`;
      setKtpPreviewUrl(fullUrl);
    }
  };

  const startRevision = () => {
    if (!result) return;
    setIsRevising(true);
    setMode('register');
    populateFormFromResult(result);
    const revisionArr = result.revisionSections
      ? result.revisionSections.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (revisionArr.length > 0 && SECTION_STEP_INDEX[revisionArr[0]] !== undefined) {
      setStep(SECTION_STEP_INDEX[revisionArr[0]]);
    } else {
      setStep(0);
    }
    setCompletedSteps([0, 1, 2, 3, 4]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resubmit = async () => {
    if (!result) return;
    setSubmitting(true);
    setError('');
    setResubmitSuccessMsg('');
    try {
      const data = new FormData();
      data.append('email', result.email);
      const pwd = authPassword || login.password || form.password;
      data.append('password', pwd);

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'password' || key === 'email') return;
        if (key === 'phone' && value) {
          data.append(key, value.startsWith('0') ? value : '0' + value);
        } else if (key === 'campsitePhone' && value) {
          data.append(key, value.startsWith('0') ? value : '0' + value);
        } else {
          data.append(key, value);
        }
      });

      if (ktpPhoto) {
        data.append('ktpPhoto', ktpPhoto);
      }

      const res = await fetch(
        `${API_BASE_URL}/partner-applications/${result.id}/resubmit`,
        {
          method: 'PATCH',
          body: data,
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.message || 'Gagal mengirim ulang perbaikan berkas pendaftaran.',
        );
      }
      setResult(body);
      try {
        localStorage.setItem(
          'embun_mitra_session',
          JSON.stringify({ result: body, authPassword: pwd }),
        );
      } catch {}
      setIsRevising(false);
      setMode('status');
      setStatusTab('details');
      setResubmitSuccessMsg(
        'Perbaikan data pengajuan berhasil dikirimkan ulang! Tim kurasi Embun akan meninjau perubahan data Anda.',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Terjadi gangguan jaringan saat mengirim ulang revisi.');
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (isRevising) {
      return resubmit();
    }
    if (!isStepValid) return;
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'phone' && value) {
          data.append(key, value.startsWith('0') ? value : '0' + value);
        } else if (key === 'campsitePhone' && value) {
          data.append(key, value.startsWith('0') ? value : '0' + value);
        } else {
          data.append(key, value);
        }
      });
      if (ktpPhoto) data.append('ktpPhoto', ktpPhoto);
      const res = await fetch(`${API_BASE_URL}/partner-applications`, {
        method: 'POST',
        body: data,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Pendaftaran gagal dikirim. Periksa kembali kelengkapan data.');
      }
      setAuthPassword(form.password);
      setResult(body);
      try {
        localStorage.setItem(
          'embun_mitra_session',
          JSON.stringify({ result: body, authPassword: form.password }),
        );
      } catch {}
      setMode('status');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Terjadi gangguan jaringan saat mengirim pendaftaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    if (!login.email || !login.password) {
      setError('Masukkan email dan password pendaftaran Anda.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/partner-applications/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Email atau password tidak sesuai.');
      }
      setAuthPassword(login.password);
      setResult(body);
      setMode('status');
      try {
        localStorage.setItem(
          'embun_mitra_session',
          JSON.stringify({ result: body, authPassword: login.password }),
        );
      } catch {}
      populateFormFromResult(body);
      setStatusTab(body.status === 'NEEDS_REVISION' ? 'revision' : 'details');
    } catch (err: any) {
      setError(err?.message || 'Email atau password tidak sesuai.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/partner-applications/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirimkan permintaan reset kata sandi.');
      }
      setForgotSuccess(
        data.message ||
          'Tautan pengaturan ulang kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam Anda.',
      );
    } catch (err: any) {
      setForgotError(err?.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#191919] font-sans antialiased selection:bg-[#CEFB0A] selection:text-[#191919]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr]">
        
        {/* ── LEFT HERO BRANDING PANEL ──────────────────────────────────────── */}
        <aside className="relative flex flex-col justify-between bg-[#18181B] text-white p-8 sm:p-12 lg:p-14 overflow-hidden border-r border-neutral-800">
          {/* Top Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/logo/model1_white.svg"
                alt="Embun"
                width={138}
                height={31}
                unoptimized
                priority
              />
            </Link>

            {/* Main Hero Header */}
            <div className="mt-12 space-y-3">
              <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-bold leading-snug tracking-tight text-white">
                Kelola dan pasarkan campsite Anda bersama Embun.
              </h1>

              <p className="text-sm leading-relaxed text-neutral-400">
                Daftarkan properti camping atau glamping Anda untuk menjangkau wisatawan, mengatur jadwal ketersediaan spot, dan memantau transaksi dalam satu tempat.
              </p>
            </div>

            {/* Value Highlights */}
            <div className="mt-10 space-y-5 border-t border-neutral-800/80 pt-8">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">01. Reservasi Online</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Terima dan kelola pemesanan langsung dari calon pengunjung melalui aplikasi.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">02. Manajemen Ketersediaan</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Atur kalender booking, ketersediaan kavling, dan jadwal operasional spot.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">03. Pembayaran & Payout</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Laporan transaksi tercatat otomatis dan dana dapat dicairkan langsung ke rekening bank.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="relative z-10 mt-14 pt-8 border-t border-neutral-800/80 text-xs leading-relaxed text-neutral-400 space-y-1.5">
            <p>Pendaftaran tidak dipungut biaya. Tim Embun akan meninjau kelengkapan data dalam 1–2 hari kerja.</p>
            <p className="text-neutral-500">
              Butuh bantuan pendaftaran? Hubungi{' '}
              <a
                href="mailto:support@embun.app"
                className="text-neutral-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                support@embun.app
              </a>
            </p>
          </div>
        </aside>

        {/* ── RIGHT MAIN FORM CONTAINER ────────────────────────────────────── */}
        <main className="flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-14 xl:p-16 max-w-4xl w-full mx-auto">
          <div className="w-full">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#191919]">
                  {result
                    ? 'Status Pengajuan Kemitraan'
                    : mode === 'register'
                    ? 'Formulir Pendaftaran Mitra'
                    : 'Pantau Status Pengajuan'}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  {result
                    ? 'Pantau progres verifikasi kurasi atau lengkapi kolom data yang perlu diperbaiki.'
                    : mode === 'register'
                    ? 'Lengkapi data awal properti Anda untuk proses verifikasi kurasi.'
                    : 'Cek perkembangan status review berkas pendaftaran yang telah dikirim.'}
                </p>
              </div>

              {!result && (
                <div className="inline-flex p-1 rounded-xl bg-[#E5E7EB]/60 border border-[#E5E7EB] self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white text-[#0841B5] shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Daftar Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('status')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'status'
                        ? 'bg-white text-[#0841B5] shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Cek Status
                  </button>
                </div>
              )}
            </div>

          {/* ── MODE: CHECK STATUS OR LOGGED-IN STATUS DASHBOARD ───────────── */}
          {(mode === 'status' || result) && !isRevising ? (
            <div className="mt-8 space-y-6 animate-in fade-in duration-200">
              {!result ? (
                isForgotPassword ? (
                  <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xs space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#191919]">Lupa Kata Sandi Pendaftaran</h3>
                      <p className="text-xs text-neutral-500">
                        Masukkan alamat email yang Anda daftarkan saat pendaftaran mitra. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                      </p>
                    </div>

                    {forgotSuccess ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>{forgotSuccess}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(false);
                            setForgotSuccess('');
                            setForgotError('');
                          }}
                          className="inline-flex items-center text-xs font-bold text-[#0841B5] hover:underline cursor-pointer"
                        >
                          ← Kembali ke Form Masuk
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Alamat Email Terdaftar
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="email"
                              required
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="owner@domain.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {forgotError && (
                          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                            {forgotError}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={forgotLoading || !forgotEmail.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {forgotLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                            <span>Kirim Tautan Reset Kata Sandi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(false);
                              setForgotError('');
                            }}
                            className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-center"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xs space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#191919]">Masuk untuk Cek Status</h3>
                      <p className="text-xs text-neutral-500">
                        Gunakan email dan password yang Anda buat saat pertama kali mengisi form pendaftaran.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Alamat Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="email"
                            value={login.email}
                            onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))}
                            placeholder="owner@domain.com"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotEmail(login.email);
                              setIsForgotPassword(true);
                              setError('');
                            }}
                            className="text-[11.5px] font-semibold text-[#0841B5] hover:underline cursor-pointer"
                          >
                            Lupa kata sandi?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={login.password}
                            onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-11 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={checkStatus}
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      <span>Periksa Status Pengajuan</span>
                    </button>
                  </div>
                )
              ) : (
                /* Status Display Card */
                <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xs space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Property Header & Badge + Logout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Properti</span>
                      <h4 className="text-xl font-black text-[#191919]">{result.campsiteName}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{result.city}, {result.province} • a.n. {result.ownerName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                      >
                        <LogOut className="h-3.5 w-3.5 text-neutral-500" />
                        <span>Keluar</span>
                      </button>
                      {(() => {
                        const conf = statusBadgeConfig[result.status] || {
                          label: result.status,
                          bg: 'bg-neutral-100',
                          text: 'text-neutral-700',
                          border: 'border-neutral-200',
                          desc: '',
                        };
                        return (
                          <div className={`px-4 py-2 rounded-xl border font-bold text-xs ${conf.bg} ${conf.text} ${conf.border}`}>
                            {conf.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Status Banner with Left Accent Bar (Xendit Style) */}
                  <div className={`flex gap-3.5 p-5 rounded-2xl border ${
                    result.status === 'NEEDS_REVISION'
                      ? 'bg-amber-50/70 border-amber-200/80'
                      : result.status === 'APPROVED'
                      ? 'bg-emerald-50/70 border-emerald-200/80'
                      : 'bg-blue-50/60 border-blue-200/80'
                  }`}>
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${
                      result.status === 'NEEDS_REVISION'
                        ? 'bg-amber-500'
                        : result.status === 'APPROVED'
                        ? 'bg-emerald-500'
                        : 'bg-[#0841B5]'
                    }`} />
                    <div className="space-y-0.5">
                      <h5 className="text-sm sm:text-base font-bold text-neutral-900">
                        {statusBadgeConfig[result.status]?.label || 'Memeriksa Pengajuan Anda...'}
                      </h5>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                        {statusBadgeConfig[result.status]?.desc || 'Status pengajuan Anda tercatat pada sistem Embun.'}
                      </p>
                    </div>
                  </div>

                  {resubmitSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{resubmitSuccessMsg}</span>
                    </div>
                  )}

                  {/* ── TABS (ONLY WHEN NEEDS_REVISION) ────────────────────────── */}
                  {result.status === 'NEEDS_REVISION' && (
                    <div className="flex border-b border-neutral-200 gap-4 sm:gap-8 pt-2">
                      <button
                        type="button"
                        onClick={() => setStatusTab('revision')}
                        className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                          statusTab === 'revision'
                            ? 'border-[#0841B5] text-[#0841B5]'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        <span>Formulir Perbaikan Data</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                          {result.revisionSections ? result.revisionSections.split(',').filter(Boolean).length : '1'} Perlu Revisi
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusTab('details')}
                        className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                          statusTab === 'details'
                            ? 'border-[#0841B5] text-[#0841B5]'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        <span>Rincian Data Terkirim</span>
                      </button>
                    </div>
                  )}

                  {/* ── TAB 1: FORMULIR PERBAIKAN DATA (REVISION TAB) ──────────── */}
                  {result.status === 'NEEDS_REVISION' && statusTab === 'revision' && (
                    <div className="space-y-6 pt-2">
                      {/* Reviewer Note Box */}
                      {result.reviewNote && (
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                            Catatan dari Reviewer Embun:
                          </span>
                          <p className="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed">
                            "{result.reviewNote}"
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Kolom yang Perlu Diperbaiki
                        </h6>
                        <p className="text-xs text-neutral-500">
                          Silakan sesuaikan data pada kolom di bawah ini. Data sebelumnya tetap dicantumkan sebagai referensi.
                        </p>
                      </div>

                      {/* Focused Form Inputs Card */}
                      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 space-y-5 shadow-2xs">
                        {/* 1. ownerName */}
                        {isFieldNeedsRevision('ownerName', 'owner') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nama Lengkap Pemilik / PIC *
                            </label>
                            <input
                              type="text"
                              value={form.ownerName}
                              onChange={(e) => update('ownerName', e.target.value)}
                              placeholder="Nama Lengkap"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.ownerName}</span>
                          </div>
                        )}

                        {/* 2. email */}
                        {isFieldNeedsRevision('email', 'owner') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Email Terdaftar *
                            </label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => update('email', e.target.value)}
                              placeholder="email@domain.com"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.email}</span>
                          </div>
                        )}

                        {/* 3. phone */}
                        {isFieldNeedsRevision('phone', 'owner') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nomor WhatsApp PIC *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-neutral-500">+62</span>
                              <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => update('phone', normalizePhone(e.target.value))}
                                placeholder="81234567890"
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900"
                              />
                            </div>
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: +62 {result.phone}</span>
                          </div>
                        )}

                        {/* 4. ktpNumber */}
                        {isFieldNeedsRevision('ktpNumber', 'ktp') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nomor Induk Kependudukan (NIK) *
                            </label>
                            <input
                              type="text"
                              maxLength={16}
                              value={form.ktpNumber}
                              onChange={(e) => update('ktpNumber', e.target.value.replace(/\D/g, ''))}
                              placeholder="16 digit NIK KTP"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-mono text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.ktpNumber || '-'}</span>
                          </div>
                        )}

                        {/* 5. ownerAddress */}
                        {isFieldNeedsRevision('ownerAddress', 'ktp') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Alamat Domisili KTP *
                            </label>
                            <textarea
                              rows={2}
                              value={form.ownerAddress}
                              onChange={(e) => update('ownerAddress', e.target.value)}
                              placeholder="Alamat lengkap sesuai KTP"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900 leading-relaxed"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.ownerAddress || '-'}</span>
                          </div>
                        )}

                        {/* 6. ktpPhoto */}
                        {isFieldNeedsRevision('ktpPhoto', 'ktp') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Upload / Ganti Foto KTP *
                            </label>
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all bg-neutral-50/50 ${
                                isDragging ? 'border-[#0841B5] bg-blue-50/40' : 'border-neutral-300 hover:border-neutral-400'
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleKtpChange(e.target.files?.[0] || null)}
                                className="hidden"
                                id="ktp-upload-status-revision-tab"
                              />
                              {ktpPreviewUrl ? (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-16 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                                      <img src={ktpPreviewUrl} alt="KTP" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-neutral-900 block">Foto KTP Terpilih</span>
                                      <button
                                        type="button"
                                        onClick={() => setShowKtpModal(true)}
                                        className="text-xs font-bold text-[#0841B5] hover:underline cursor-pointer"
                                      >
                                        Lihat Preview
                                      </button>
                                    </div>
                                  </div>
                                  <label
                                    htmlFor="ktp-upload-status-revision-tab"
                                    className="px-3.5 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs cursor-pointer"
                                  >
                                    Ganti File
                                  </label>
                                </div>
                              ) : (
                                <label htmlFor="ktp-upload-status-revision-tab" className="cursor-pointer block space-y-1">
                                  <UploadCloud className="h-7 w-7 text-neutral-400 mx-auto" />
                                  <span className="text-xs font-bold text-neutral-800 block">Klik atau Drag Foto KTP Baru</span>
                                  <span className="text-[11px] text-neutral-500 block">Format JPG, PNG, atau WEBP</span>
                                </label>
                              )}
                            </div>
                            {result.ktpPhotoUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = result.ktpPhotoUrl?.startsWith('http')
                                    ? result.ktpPhotoUrl
                                    : `${API_BASE_URL}${result.ktpPhotoUrl}`;
                                  setKtpPreviewUrl(url);
                                  setShowKtpModal(true);
                                }}
                                className="text-[11px] font-semibold text-[#0841B5] hover:underline mt-1 inline-block"
                              >
                                Lihat Foto KTP Sebelumnya ↗
                              </button>
                            )}
                          </div>
                        )}

                        {/* 7. campsiteName */}
                        {isFieldNeedsRevision('campsiteName', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nama Tempat Camp *
                            </label>
                            <input
                              type="text"
                              value={form.campsiteName}
                              onChange={(e) => update('campsiteName', e.target.value)}
                              placeholder="Nama Campsite"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.campsiteName}</span>
                          </div>
                        )}

                        {/* 8. campsiteType */}
                        {isFieldNeedsRevision('campsiteType', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                              Tipe Properti *
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {PROPERTY_TYPES.map((t) => {
                                const isSelected = selectedTypes.includes(t);
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => togglePropertyType(t)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#0841B5] text-white shadow-xs'
                                        : 'bg-white border border-neutral-300 text-neutral-700 hover:border-[#0841B5]'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-[11px] text-neutral-400 block pt-0.5">Data sebelumnya: {result.campsiteType || '-'}</span>
                          </div>
                        )}

                        {/* 9. campsitePhone */}
                        {isFieldNeedsRevision('campsitePhone', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              No. WhatsApp Campsite *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-neutral-500">+62</span>
                              <input
                                type="tel"
                                value={form.campsitePhone}
                                onChange={(e) => update('campsitePhone', normalizePhone(e.target.value))}
                                placeholder="81234567890"
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none font-medium text-neutral-900"
                              />
                            </div>
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: +62 {result.campsitePhone || result.phone}</span>
                          </div>
                        )}

                        {/* 10. campsiteEmail */}
                        {isFieldNeedsRevision('campsiteEmail', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Email Bisnis Camp (Opsional)
                            </label>
                            <input
                              type="email"
                              value={form.campsiteEmail}
                              onChange={(e) => update('campsiteEmail', e.target.value)}
                              placeholder="camp@domain.com"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.campsiteEmail || '-'}</span>
                          </div>
                        )}

                        {/* 11. instagramUrl */}
                        {isFieldNeedsRevision('instagramUrl', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Instagram
                            </label>
                            <input
                              type="text"
                              value={form.instagramUrl}
                              onChange={(e) => update('instagramUrl', e.target.value)}
                              placeholder="instagram.com/... atau @username"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.instagramUrl || '-'}</span>
                          </div>
                        )}

                        {/* 12. tiktokUrl */}
                        {isFieldNeedsRevision('tiktokUrl', 'campsite') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              TikTok / Website
                            </label>
                            <input
                              type="text"
                              value={form.tiktokUrl}
                              onChange={(e) => update('tiktokUrl', e.target.value)}
                              placeholder="tiktok.com/@..."
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.tiktokUrl || '-'}</span>
                          </div>
                        )}

                        {/* 13. bankName */}
                        {isFieldNeedsRevision('bankName', 'bank') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nama Bank *
                            </label>
                            <div className="relative">
                              <select
                                value={form.bankName}
                                onChange={(e) => update('bankName', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none appearance-none font-medium text-neutral-900 cursor-pointer"
                              >
                                <option value="">Pilih Bank</option>
                                {POPULAR_BANKS.map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            </div>
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.bankName}</span>
                          </div>
                        )}

                        {/* 14. bankAccountNumber */}
                        {isFieldNeedsRevision('bankAccountNumber', 'bank') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nomor Rekening *
                            </label>
                            <input
                              type="text"
                              value={form.bankAccountNumber}
                              onChange={(e) => update('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                              placeholder="Nomor rekening"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-mono text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.bankAccountNumber}</span>
                          </div>
                        )}

                        {/* 15. bankAccountHolder */}
                        {isFieldNeedsRevision('bankAccountHolder', 'bank') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Nama Pemilik Rekening *
                            </label>
                            <input
                              type="text"
                              value={form.bankAccountHolder}
                              onChange={(e) => update('bankAccountHolder', e.target.value)}
                              placeholder="Nama pemilik rekening sesuai buku tabungan"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.bankAccountHolder}</span>
                          </div>
                        )}

                        {/* 16. location / provinceCity / district */}
                        {(isFieldNeedsRevision('provinceCity', 'location') || isFieldNeedsRevision('district', 'location') || isFieldNeedsRevision('location', 'location')) && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800 mb-1">
                              Wilayah (Provinsi, Kota / Kabupaten, Kecamatan) *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="relative">
                                <select
                                  value={selectedProvinceId}
                                  onChange={(e) => handleProvinceChange(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs outline-none appearance-none"
                                >
                                  <option value="">{form.province || 'Pilih Provinsi'}</option>
                                  {provinces.map((p) => (
                                    <option key={p.id} value={p.id}>{toTitleCase(p.name)}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                              </div>
                              <div className="relative">
                                <select
                                  value={selectedCityId}
                                  onChange={(e) => handleCityChange(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs outline-none appearance-none"
                                >
                                  <option value="">{form.city || 'Pilih Kota'}</option>
                                  {cities.map((c) => (
                                    <option key={c.id} value={c.id}>{toTitleCase(c.name)}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                              </div>
                              <div className="relative">
                                <select
                                  value={districts.find((d) => toTitleCase(d.name) === form.district)?.id || ''}
                                  onChange={(e) => handleDistrictChange(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs outline-none appearance-none"
                                >
                                  <option value="">{form.district || 'Pilih Kecamatan'}</option>
                                  {districts.map((d) => (
                                    <option key={d.id} value={d.id}>{toTitleCase(d.name)}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                              </div>
                            </div>
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.district ? `${result.district}, ` : ''}{result.city}, {result.province}</span>
                          </div>
                        )}

                        {/* 17. campsiteAddress */}
                        {isFieldNeedsRevision('campsiteAddress', 'location') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Alamat Lengkap Campsite *
                            </label>
                            <textarea
                              rows={2}
                              value={form.campsiteAddress}
                              onChange={(e) => update('campsiteAddress', e.target.value)}
                              placeholder="Alamat jalan, nomor, RT/RW atau patokan"
                              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900 leading-relaxed"
                            />
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.campsiteAddress}</span>
                          </div>
                        )}

                        {/* 18. googleMapsUrl */}
                        {isFieldNeedsRevision('googleMapsUrl', 'location') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-800">
                              Link Titik Google Maps (Share Link)
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                              <input
                                type="url"
                                value={form.googleMapsUrl}
                                onChange={(e) => update('googleMapsUrl', e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm focus:border-[#0841B5] outline-none font-medium text-neutral-900"
                              />
                            </div>
                            <span className="text-[11px] text-neutral-400 block">Data sebelumnya: {result.googleMapsUrl || '-'}</span>
                          </div>
                        )}
                      </div>

                      {/* Error message in revision tab */}
                      {error && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Resubmit CTA Button */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <h6 className="font-bold text-sm text-neutral-900">Sudah Selesai Memperbaiki Data?</h6>
                          <p className="text-xs text-neutral-500">
                            Pastikan perubahan data di atas sudah benar sebelum mengirimkannya kembali ke tim kurasi.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={resubmit}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          <span>Kirimkan Ulang Perbaikan Data</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 2 / DEFAULT: RINCIAN DATA LENGKAP (XENDIT KYC CLEAN PREVIEW) ─ */}
                  {(result.status !== 'NEEDS_REVISION' || statusTab === 'details') && (
                    <div className="space-y-8 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h5 className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-wider">
                          Rincian Berkas & Data yang Diajukan
                        </h5>
                        {result.createdAt && (
                          <span className="text-[11px] text-neutral-400">
                            Diajukan pada: {new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Section 1: Informasi Pemilik / PIC */}
                      <div className="space-y-2.5">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Informasi Pemilik / PIC
                        </h6>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 divide-y divide-neutral-100 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nama Lengkap</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.ownerName}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Email Terdaftar</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.email}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nomor WhatsApp</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Legalitas & Foto KTP */}
                      <div className="space-y-2.5">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Legalitas & Foto KTP
                        </h6>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 divide-y divide-neutral-100 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nomor Induk Kependudukan (NIK)</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold font-mono">{result.ktpNumber || '-'}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Alamat Domisili KTP</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold leading-relaxed">{result.ownerAddress || '-'}</span>
                          </div>
                          {result.ktpPhotoUrl && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0 items-center">
                              <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Foto KTP Terlampir</span>
                              <div className="sm:col-span-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = result.ktpPhotoUrl?.startsWith('http')
                                      ? result.ktpPhotoUrl
                                      : `${API_BASE_URL}${result.ktpPhotoUrl}`;
                                    setKtpPreviewUrl(url);
                                    setShowKtpModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#0841B5] text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Lihat Foto KTP Terlampir</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 3: Profil Tempat Camp */}
                      <div className="space-y-2.5">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Profil Tempat Camp
                        </h6>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 divide-y divide-neutral-100 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nama Campsite</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.campsiteName}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Tipe Properti</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.campsiteType || 'Tidak dicantumkan'}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Kontak Operasional Camp</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.campsitePhone || result.phone}</span>
                          </div>
                          {result.campsiteEmail && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                              <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Email Bisnis Camp</span>
                              <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.campsiteEmail}</span>
                            </div>
                          )}
                          {result.instagramUrl && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                              <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Instagram</span>
                              <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.instagramUrl}</span>
                            </div>
                          )}
                          {result.tiktokUrl && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                              <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">TikTok / Website</span>
                              <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.tiktokUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 4: Rekening Pencairan Dana (Payout) */}
                      <div className="space-y-2.5">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Rekening Pencairan Dana (Payout)
                        </h6>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 divide-y divide-neutral-100 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nama Bank</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.bankName}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nomor Rekening</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold font-mono tracking-wider">{result.bankAccountNumber}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Nama Pemilik Rekening</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">{result.bankAccountHolder}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Lokasi & Alamat Campsite */}
                      <div className="space-y-2.5">
                        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Lokasi & Alamat Campsite
                        </h6>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 divide-y divide-neutral-100 shadow-2xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Wilayah</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold">
                              {result.district ? `${result.district}, ` : ''}{result.city}, {result.province}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                            <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Alamat Lengkap Campsite</span>
                            <span className="sm:col-span-2 text-xs sm:text-sm text-neutral-900 font-semibold leading-relaxed">{result.campsiteAddress}</span>
                          </div>
                          {result.googleMapsUrl && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
                              <span className="sm:col-span-1 text-xs text-neutral-400 font-medium">Link Titik Google Maps</span>
                              <div className="sm:col-span-2">
                                <a
                                  href={result.googleMapsUrl.startsWith('http') ? result.googleMapsUrl : `https://${result.googleMapsUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm font-semibold text-[#0841B5] hover:underline block break-all"
                                >
                                  {result.googleMapsUrl}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── MODE: REGISTER STEPPER FORM ──────────────────────────────── */
            <div className="mt-8 space-y-8 animate-in fade-in duration-200">
              
              {/* Revision Mode Banner */}
              {isRevising && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Mode Revisi Berkas Pengajuan</span>
                    </div>
                    {result?.reviewNote && (
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Catatan Kurator: <span className="font-bold text-amber-950">"{result.reviewNote}"</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={resubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0841B5] text-white text-xs font-bold hover:bg-[#0841B5]/90 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Kirim Ulang Revisi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRevising(false);
                        setMode('status');
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Stepper Progress Bar (Clean, non-skippable forward) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {steps.map((item, index) => {
                    const isCurrent = index === step;
                    const isDone = completedSteps.includes(index);
                    const canNavigate = isRevising || index <= step || completedSteps.includes(index - 1);
                    const revisionArr = result?.revisionSections
                      ? result.revisionSections.split(',').map((s) => s.trim()).filter(Boolean)
                      : [];
                    const isRevisionTarget = isRevising && revisionArr.some((key) => SECTION_STEP_INDEX[key] === index);

                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => handleGoToStep(index)}
                        disabled={!canNavigate}
                        className={`group relative flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-[#0841B5]/5 text-[#0841B5]'
                            : isDone
                            ? 'text-[#0841B5] hover:bg-neutral-50 cursor-pointer'
                            : 'text-neutral-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Step Number / Status Indicator */}
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                            isRevisionTarget
                              ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-400/50 shadow-xs'
                              : isCurrent
                              ? 'bg-[#0841B5] text-white shadow-xs'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#F4F7F6] text-neutral-500 border border-[#E5E7EB]'
                          }`}
                        >
                          {isRevisionTarget ? (
                            <Edit3 className="h-4 w-4" />
                          ) : isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        {/* Step Title Label */}
                        <div className="flex flex-col items-center max-w-full">
                          {isRevisionTarget && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold text-[9px] uppercase mb-0.5 tracking-wider">
                              Revisi
                            </span>
                          )}
                          <span className="hidden sm:block text-[11px] font-bold truncate max-w-full">
                            {item.title}
                          </span>
                          <span className="sm:hidden text-[10px] font-bold truncate max-w-full">
                            {item.short}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Card Container */}
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#E5E7EB] shadow-xs space-y-8">
                
                {/* ── STEP 0: AKUN PEMILIK ─────────────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 1 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Informasi Akun Pemilik</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Data penanggung jawab utama untuk komunikasi, login, dan pemantauan reservasi.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Lengkap Pemilik / PIC <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={form.ownerName}
                            onChange={(e) => update('ownerName', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Alamat Email Aktif <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={(e) => update('email', e.target.value)}
                              placeholder="nama@email.com"
                              className={`w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border rounded-xl text-sm focus:bg-white outline-none transition-all ${
                                form.email.length > 0 && !isValidEmail(form.email)
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                  : 'border-[#E5E7EB] focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20'
                              }`}
                            />
                          </div>
                          {form.email.length > 0 && !isValidEmail(form.email) ? (
                            <p className="text-[11px] text-red-500 mt-1 font-medium">Format email belum valid (contoh: nama@email.com)</p>
                          ) : (
                            <p className="text-[11px] text-neutral-400 mt-1">Dipakai untuk menerima notifikasi status pengajuan.</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nomor WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-neutral-600 text-sm font-semibold border-r border-[#E5E7EB] pr-2.5">
                              <Phone className="h-4 w-4 text-neutral-400" />
                              <span>+62</span>
                            </div>
                            <input
                              type="tel"
                              required
                              value={form.phone}
                              onChange={(e) => update('phone', normalizePhone(e.target.value))}
                              placeholder="81234567890"
                              className="w-full pl-[88px] pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">Untuk koordinasi verifikasi dan survei lokasi.</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Kata Sandi / Password Akun <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full pl-10 pr-11 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: IDENTITAS & KTP ──────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 2 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Verifikasi Identitas Owner</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Data legalitas diperlukan untuk menjamin keamanan transaksi dan perjanjian kemitraan resmi.
                      </p>
                    </div>

                    <div className="space-y-5 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            maxLength={16}
                            value={form.ktpNumber}
                            onChange={(e) => update('ktpNumber', e.target.value.replace(/\D/g, ''))}
                            placeholder="16 digit nomor KTP"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                        {/* Custom Modern File Upload Box */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Unggah Foto KTP Asli <span className="text-red-500">*</span>
                          </label>

                          {!ktpPreviewUrl ? (
                            <label
                              onDragOver={handleDragOver}
                              onDragEnter={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`group relative flex flex-col items-center justify-center p-7 sm:p-9 border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center ${
                                isDragging
                                  ? 'border-[#0841B5] bg-[#0841B5]/10 scale-[1.01]'
                                  : 'border-[#E5E7EB] hover:border-[#0841B5] bg-[#F4F7F6]/60 hover:bg-[#0841B5]/5'
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(e) => handleKtpChange(e.target.files?.[0] || null)}
                              />
                              <div
                                className={`h-12 w-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-[#0841B5] group-hover:scale-110 transition-all mb-3 ${
                                  isDragging ? 'scale-110' : ''
                                }`}
                              >
                                <UploadCloud className="h-6 w-6" />
                              </div>
                              <span className="text-sm font-bold text-[#191919] group-hover:text-[#0841B5] transition-colors">
                                {isDragging ? 'Lepaskan file foto di sini' : 'Klik atau Tarik (Drag & Drop) Foto KTP ke Sini'}
                              </span>
                              <span className="text-xs text-neutral-400 mt-1">
                                Format JPG, PNG, atau WebP (Maksimal 10MB).
                              </span>
                            </label>
                          ) : (
                            <div className="relative p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
                              <div
                                onClick={() => setShowKtpModal(true)}
                                className="flex items-center gap-3.5 min-w-0 cursor-pointer group flex-1"
                                title="Klik untuk memperbesar foto KTP"
                              >
                                <div className="h-14 w-20 rounded-xl overflow-hidden bg-neutral-100 border border-emerald-200 shrink-0 relative group-hover:ring-2 group-hover:ring-[#0841B5] transition-all">
                                  <img src={ktpPreviewUrl} alt="Preview KTP" className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                    Zoom
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-[#0841B5] transition-colors">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Foto KTP Terlampir
                                  </div>
                                  <p className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
                                    {ktpPhoto?.name || 'ktp_file.jpg'}
                                  </p>
                                  <span className="text-[11px] text-[#0841B5] font-semibold underline underline-offset-2">
                                    Klik untuk pratinjau / perbesar
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setShowKtpModal(true)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-neutral-200 hover:border-[#0841B5] text-neutral-700 hover:text-[#0841B5] transition-all cursor-pointer"
                                >
                                  Pratinjau
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleKtpChange(null)}
                                  className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all cursor-pointer"
                                  title="Hapus / Ganti Foto"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Panduan Foto KTP Jelas */}
                          <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-[#0841B5]">
                              <ShieldCheck className="h-4 w-4 shrink-0" />
                              <span>Ketentuan Foto KTP:</span>
                            </div>
                            <ul className="text-neutral-600 pl-6 list-disc space-y-0.5 text-[11px] sm:text-xs">
                              <li>Foto harus <strong>jelas, tajam, dan tidak buram (blur)</strong>.</li>
                              <li>Seluruh 4 sudut fisik KTP tampak utuh dan tidak terpotong.</li>
                              <li>Teks NIK, nama, dan foto wajah terbaca terang tanpa pantulan kilau cahaya (glare).</li>
                            </ul>
                          </div>
                        </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Alamat Lengkap Sesuai KTP <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={form.ownerAddress}
                          onChange={(e) => update('ownerAddress', e.target.value)}
                          placeholder="Alamat domisili lengkap pemilik / PIC"
                          className="w-full p-3.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all resize-y"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: INFORMASI CAMPSITE ───────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 3 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Profil Tempat Camp</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Nama dan identitas publik properti yang akan dilihat oleh calon wisatawan.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Campsite / Glamping <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={form.campsiteName}
                            onChange={(e) => update('campsiteName', e.target.value)}
                            placeholder="Contoh: Embun Riverside Camp & Glamping"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                          Tipe Properti (Bisa pilih lebih dari satu)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {PROPERTY_TYPES.map((type) => {
                            const isSelected = selectedTypes.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => togglePropertyType(type)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0841B5]/5 border-[#0841B5] text-[#0841B5] font-semibold shadow-xs'
                                    : 'bg-[#F4F7F6] border-[#E5E7EB] text-neutral-700 hover:border-neutral-300 font-medium'
                                }`}
                              >
                                <div
                                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-[#0841B5] border-[#0841B5] text-white'
                                      : 'border-neutral-400 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span className="truncate">{type}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            No. WhatsApp Campsite <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-neutral-600 text-sm font-semibold border-r border-[#E5E7EB] pr-2.5">
                              <Phone className="h-4 w-4 text-neutral-400" />
                              <span>+62</span>
                            </div>
                            <input
                              type="tel"
                              required
                              value={form.campsitePhone}
                              onChange={(e) => update('campsitePhone', normalizePhone(e.target.value))}
                              placeholder="81234567890"
                              className="w-full pl-[88px] pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            Nomor operasional di venue untuk kontak darurat & koordinasi tamu.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Email Bisnis Camp (Opsional)
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="email"
                              value={form.campsiteEmail}
                              onChange={(e) => update('campsiteEmail', e.target.value)}
                              placeholder="info@campsite.com"
                              className={`w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border rounded-xl text-sm focus:bg-white outline-none transition-all ${
                                form.campsiteEmail.length > 0 && !isValidEmail(form.campsiteEmail)
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                  : 'border-[#E5E7EB] focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20'
                              }`}
                            />
                          </div>
                          {form.campsiteEmail.length > 0 && !isValidEmail(form.campsiteEmail) && (
                            <p className="text-[11px] text-red-500 mt-1 font-medium">Format email belum valid (contoh: info@campsite.com)</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Tautan Media Sosial (Membantu Tim Verifikasi Lokasi)
                        </span>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                            </svg>
                            <input
                              type="text"
                              value={form.instagramUrl}
                              onChange={(e) => update('instagramUrl', e.target.value)}
                              placeholder="Instagram (@username)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">TT</span>
                            <input
                              type="text"
                              value={form.tiktokUrl}
                              onChange={(e) => update('tiktokUrl', e.target.value)}
                              placeholder="TikTok (@username)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>

                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              value={form.websiteUrl}
                              onChange={(e) => update('websiteUrl', e.target.value)}
                              placeholder="Website (https://...)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: LOKASI CAMPSITE ──────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 4 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Lokasi & Titik Peta</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Alamat spesifik agar mempermudah pemetaan lokasi dan panduan rute bagi calon tamu.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Provinsi Dropdown */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Provinsi <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={selectedProvinceId}
                              onChange={(e) => handleProvinceChange(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all appearance-none cursor-pointer text-neutral-800"
                            >
                              <option value="">
                                {loadingProvinces ? 'Memuat daftar provinsi...' : 'Pilih Provinsi'}
                              </option>
                              {provinces.map((prov) => (
                                <option key={prov.id} value={prov.id}>
                                  {toTitleCase(prov.name)}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        {/* Kota / Kabupaten Dropdown */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Kota / Kabupaten <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required
                              disabled={!selectedProvinceId || loadingCities}
                              value={selectedCityId}
                              onChange={(e) => handleCityChange(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-neutral-800"
                            >
                              <option value="">
                                {!selectedProvinceId
                                  ? 'Pilih provinsi terlebih dahulu'
                                  : loadingCities
                                  ? 'Memuat kota/kabupaten...'
                                  : 'Pilih Kota / Kabupaten'}
                              </option>
                              {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                  {toTitleCase(city.name)}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Kecamatan / Area Dropdown */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Kecamatan / Area (Opsional)
                        </label>
                        <div className="relative">
                          <select
                            disabled={!selectedCityId || loadingDistricts}
                            value={districts.find((d) => toTitleCase(d.name) === form.district)?.id || ''}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-neutral-800"
                          >
                            <option value="">
                              {!selectedCityId
                                ? 'Pilih kota/kabupaten terlebih dahulu'
                                : loadingDistricts
                                ? 'Memuat kecamatan...'
                                : 'Pilih Kecamatan / Area'}
                            </option>
                            {districts.map((dist) => (
                              <option key={dist.id} value={dist.id}>
                                {toTitleCase(dist.name)}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Alamat Lengkap Campsite <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={form.campsiteAddress}
                          onChange={(e) => update('campsiteAddress', e.target.value)}
                          placeholder="Nama jalan, nomor/patokan jalan, desa, dan area sekitar"
                          className="w-full p-3.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Link Google Maps (Opsional)
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="url"
                            value={form.googleMapsUrl}
                            onChange={(e) => update('googleMapsUrl', e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>

                        {/* Petunjuk Cara Ambil Link Google Maps */}
                        <div className="mt-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-xs">
                            <Image
                              src="/images/gmaps-share-guide.png"
                              alt="Panduan Share Google Maps"
                              width={160}
                              height={120}
                              className="w-full h-auto object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="space-y-1 text-[11px] sm:text-xs text-neutral-600">
                            <span className="font-bold text-neutral-800 block">
                              Panduan Salin Link Google Maps:
                            </span>
                            <ol className="list-decimal pl-4 space-y-0.5 text-neutral-500">
                              <li>Buka lokasi titik campsite di aplikasi Google Maps.</li>
                              <li>Tekan tombol <strong>Bagikan (Share)</strong> lalu pilih <strong>Salin Link (Copy Link)</strong>.</li>
                              <li>Tempelkan (*paste*) tautan ke dalam kolom di atas.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: REKENING PENCAIRAN DANA ──────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 5 dari 5 (Terakhir)</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Rekening Pencairan Dana (Payout)</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Hasil reservasi tamu akan ditransfer secara otomatis dan aman ke rekening bank terdaftar ini.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Bank <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={form.bankName}
                            onChange={(e) => update('bankName', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all appearance-none cursor-pointer text-neutral-800"
                          >
                            <option value="">Pilih Bank</option>
                            {POPULAR_BANKS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nomor Rekening <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              required
                              value={form.bankAccountNumber}
                              onChange={(e) => update('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                              placeholder="Contoh: 1234567890"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nama Pemilik Rekening <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.bankAccountHolder}
                            onChange={(e) => update('bankAccountHolder', e.target.value)}
                            placeholder="Sesuai buku tabungan"
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 leading-relaxed mt-2 flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-[#0841B5] shrink-0 mt-0.5" />
                        <span>
                          Pastikan nama pemilik rekening sesuai dengan identitas pengelola/badan usaha untuk mempercepat proses persetujuan verifikasi keuangan.
                        </span>
                      </div>

                      {/* Pernyataan & Persetujuan Keabsahan Data (Agreement Checkbox) */}
                      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-neutral-700 leading-relaxed space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#0841B5] focus:ring-[#0841B5] cursor-pointer shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="font-bold text-neutral-900 block">
                              Pernyataan Keabsahan Data <span className="text-red-500">*</span>
                            </span>
                            <p className="text-neutral-600 leading-relaxed">
                              Saya menyatakan bahwa seluruh data dan informasi properti yang saya berikan adalah <strong>benar, sah, akurat, dan bukan data fiktif / rekayasa</strong>. Saya bersedia bertanggung jawab penuh secara hukum dan menyetujui seluruh ketentuan kemitraan platform Embun.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold">
                    {error}
                  </div>
                )}

                {/* Stepper Footer Controls */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#E5E7EB]">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3 rounded-xl border border-[#E5E7EB] text-xs sm:text-sm font-bold text-neutral-600 hover:bg-[#F4F7F6] hover:text-neutral-900 transition-all cursor-pointer"
                    >
                      Kembali
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < steps.length - 1 ? (
                    <div className="flex items-center gap-2">
                      {isRevising && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={resubmit}
                          className="px-5 py-3.5 rounded-xl border border-[#0841B5] text-[#0841B5] hover:bg-[#0841B5]/5 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                        >
                          Kirim Ulang Sekarang
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!isStepValid}
                        onClick={handleNextStep}
                        className="px-7 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Lanjut ke {steps[step + 1].title}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!isStepValid || submitting}
                      onClick={submit}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{isRevising ? 'Kirim Ulang Revisi Pengajuan' : 'Kirim Pendaftaran Mitra'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Footer with Logo & PT Alam Kelana Digital */}
          <footer className="mt-14 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 w-full">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/images/logo/model1_blue.svg"
                  alt="Embun"
                  width={96}
                  height={22}
                  unoptimized
                />
              </Link>
              <span className="text-neutral-300">|</span>
              <span className="font-medium text-neutral-600">PT Alam Kelana Digital</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <a
                href="mailto:support@embun.app"
                className="hover:text-[#0841B5] transition-colors"
              >
                support@embun.app
              </a>
              <span className="text-neutral-300">•</span>
              <p>
                © {new Date().getFullYear()} embun-app. Seluruh hak cipta dilindungi.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* ── KTP FULL PREVIEW MODAL ────────────────────────────────────── */}
      {showKtpModal && ktpPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowKtpModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div>
                <h4 className="text-base font-bold text-neutral-900">Pratinjau Foto KTP</h4>
                <p className="text-xs text-neutral-500">Pastikan NIK, nama, dan foto wajah tampak tajam & jelas.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowKtpModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center max-h-[65vh] p-2 border border-neutral-200">
              <img
                src={ktpPreviewUrl}
                alt="Foto KTP Lengkap"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-400 truncate max-w-xs">{ktpPhoto?.name}</span>
              <button
                type="button"
                onClick={() => setShowKtpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0841B5] text-white text-xs font-bold hover:bg-[#0841B5]/90 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
