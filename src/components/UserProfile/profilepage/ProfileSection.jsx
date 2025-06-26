import React, { useEffect, useState } from 'react';
import { Button } from "../../../pages/MyBookings/ui/button.jsx";
import styles from './ProfileSection.module.css';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { Mail, Lock, User, Phone, Globe } from 'lucide-react';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../../../services/userProfileService';
import { useAuth } from '../../context/AuthContext';

countries.registerLocale(en);
const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
  value: name,
  label: name,
}));

function PasswordChangeForm({ onCancel }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // تحقق الشروط
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const hasLength = newPassword.length >= 10;
  const noSpaces = newPassword === newPassword.trim();

  const canSubmit = hasLower && hasUpper && hasNumber && hasSymbol && hasLength && noSpaces && newPassword === rePassword && oldPassword;

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      const res = await changeUserPassword(oldPassword, newPassword, token);
      setSuccess(res?.data?.message || 'Password changed successfully');
      setOldPassword("");
      setNewPassword("");
      setRePassword("");
    } catch (err) {
      // حاول استخراج رسالة الخطأ من الريسبونس
      let msg = 'Failed to change password. Please check your old password and try again.';
      if (err && err.message) {
        try {
          // إذا كانت الرسالة JSON من السيرفر
          const parsed = JSON.parse(err.message);
          if (parsed?.message) {
            if (Array.isArray(parsed.message)) {
              msg = parsed.message.join(' ');
            } else {
              msg = parsed.message;
            }
          }
        } catch (e) {
          // ليست JSON، تجاهل
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: 500}}>
      {(error || success) && (
        <div style={{
          background: error ? '#ffeaea' : '#eaffea',
          color: error ? '#d32f2f' : '#388e3c',
          border: `1px solid ${error ? '#d32f2f' : '#388e3c'}`,
          borderRadius: 6,
          padding: '10px 14px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 500
        }}>
          {error && <span style={{marginRight:8, fontSize:18}}>⚠️</span>}
          {error || success}
        </div>
      )}
      <div className={styles.formGroup}>
        <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />Old password:</label>
        <div className={styles.inputContainer}>
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter old password"
          />
          <span style={{cursor:'pointer',marginLeft:8}} onClick={()=>setShowOld(v=>!v)}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#aaa" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#aaa" strokeWidth="2"/></svg>
          </span>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />New password:</label>
        <div className={styles.inputContainer}>
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter new password"
          />
          <span style={{cursor:'pointer',marginLeft:8}} onClick={()=>setShowNew(v=>!v)}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#aaa" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#aaa" strokeWidth="2"/></svg>
          </span>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />Re-enter new password:</label>
        <div className={styles.inputContainer}>
          <input
            type={showRe ? "text" : "password"}
            value={rePassword}
            onChange={e => setRePassword(e.target.value)}
            className={styles.input}
            placeholder="Re-enter your new password"
          />
          <span style={{cursor:'pointer',marginLeft:8}} onClick={()=>setShowRe(v=>!v)}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#aaa" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3" stroke="#aaa" strokeWidth="2"/></svg>
          </span>
        </div>
      </div>
      <div style={{display:'flex',gap:12,marginTop:16}}>
        <Button className={styles.changePasswordButton} disabled={!canSubmit || loading} onClick={handleChangePassword}>
          {loading ? 'Changing...' : 'Change password'}
        </Button>
        <Button className={styles.uploadButton} style={{background:'#222',color:'#fff'}} onClick={onCancel} disabled={loading}>Cancel</Button>
      </div>
      <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none', color: '#aaa', fontSize: 14}}>
        <li style={{color: (!newPassword || !hasLower) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !hasLower) ? '✖' : '✔'} Password must contain a lowercase letter</li>
        <li style={{color: (!newPassword || !hasUpper) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !hasUpper) ? '✖' : '✔'} Password must contain an uppercase letter</li>
        <li style={{color: (!newPassword || !hasNumber) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !hasNumber) ? '✖' : '✔'} Password must contain a number</li>
        <li style={{color: (!newPassword || !hasSymbol) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !hasSymbol) ? '✖' : '✔'} Password must contain at least 1 symbol (e.g. @, #, $, !, ...)</li>
        <li style={{color: (!newPassword || !hasLength) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !hasLength) ? '✖' : '✔'} Password must be at least 10 characters long</li>
        <li style={{color: (!newPassword || !noSpaces) ? '#d32f2f' : '#4caf50'}}>{(!newPassword || !noSpaces) ? '✖' : '✔'} Password must not contain leading or trailing spaces</li>
      </ul>
    </div>
  );
}

function NameChangeForm({ label, value, onCancel, onSave }) {
  const [newValue, setNewValue] = useState(value);
  const isValid = newValue.trim().length > 1;
  return (
    <div style={{maxWidth: 400}}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className={styles.input}
          placeholder={`Enter new ${label.toLowerCase()}`}
        />
      </div>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <Button className={styles.changePasswordButton} disabled={!isValid} onClick={()=>onSave(newValue)}>
          Save
        </Button>
        <Button className={styles.uploadButton} style={{background:'#222',color:'#fff'}} onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PhoneChangeForm({ value, onCancel, onSave }) {
  const [newValue, setNewValue] = useState(value);
  const isValid = /^\+?\d{10,15}$/.test(newValue.trim());
  return (
    <div style={{maxWidth: 400}}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className={styles.input}
          placeholder="Enter new phone number"
        />
      </div>
      <div style={{fontSize:13, color: isValid ? '#4caf50' : '#aaa', marginTop:4}}>
        {isValid ? '✔ Valid phone number' : '✖ Enter a valid phone number (10-15 digits)'}
      </div>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <Button className={styles.changePasswordButton} disabled={!isValid} onClick={()=>onSave(newValue)}>
          Save
        </Button>
        <Button className={styles.uploadButton} style={{background:'#222',color:'#fff'}} onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function CountryChangeForm({ value, onCancel, onSave }) {
  const [selected, setSelected] = useState(countryOptions.find(opt => opt.label === value) || null);
  const isValid = !!selected;
  return (
    <div style={{maxWidth: 400}}>
      <div className={styles.inputContainer}>
        <Select
          options={countryOptions}
          value={selected}
          onChange={setSelected}
          placeholder="Select country"
          classNamePrefix="react-select"
          isSearchable={true}
        />
      </div>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <Button className={styles.changePasswordButton} disabled={!isValid} onClick={()=>onSave(selected.label)}>
          Save
        </Button>
        <Button className={styles.uploadButton} style={{background:'#222',color:'#fff'}} onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

const ProfileSection = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // فورمات التعديل
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showFirstNameForm, setShowFirstNameForm] = useState(false);
  const [showLastNameForm, setShowLastNameForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showCountryForm, setShowCountryForm] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        // جلب التوكن من localStorage مثل MyBookings
        const userString = localStorage.getItem('user');
        const userData = userString ? JSON.parse(userString) : null;
        console.log('userData from localStorage:', userData);
        const token = userData?.token;
        console.log('TOKEN USED:', token);
        const res = await getUserProfile(token);
        setProfile(res.data.user);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // دوال الحفظ
  const handleSave = async (field, value) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      // جلب التوكن من localStorage مثل MyBookings
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : null;
      const token = userData?.token;
      // انسخ بيانات البروفايل بدون الحقول الممنوعة
      const { id, isVerified, createdAt, updatedAt, ...safeProfile } = profile || {};
      const updateData = { ...safeProfile, [field]: value };
      console.log('PATCH updateData:', updateData);
      const res = await updateUserProfile(updateData, token);
      console.log('PATCH response:', res);
      console.log('PATCH response user:', res?.data?.user);
      // بعد التحديث، أعد جلب بيانات البروفايل من السيرفر لضمان مزامنة الواجهة
      const refreshed = await getUserProfile(token);
      console.log('Refreshed profile after update:', refreshed.data.user);
      setProfile(refreshed.data.user);
      if (field === 'country' && refreshed.data.user.country !== value) {
        setError('Country did not update. This may be a backend issue.');
      } else {
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
      setShowFirstNameForm(false);
      setShowLastNameForm(false);
      setShowPhoneForm(false);
      setShowCountryForm(false);
    }
  };

  if (loading) return (
    <div className={styles.profileSection} style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:300}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        <div style={{width:48,height:48,border:'5px solid #e0e0e0',borderTop:'5px solid #1976d2',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
        <span style={{color:'#1976d2',fontWeight:500}}>Loading...</span>
      </div>
      <style>{`@keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }`}</style>
    </div>
  );
  if (error) return <div className={styles.profileSection} style={{color:'red'}}>{error}</div>;
  if (!profile) return null;

  return (
    <div className={styles.profileSection}>
      {success && <div style={{color:'green',marginBottom:8}}>{success}</div>}
      {/* Profile Information */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 24px', maxWidth: 900 }}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Mail size={16} style={{marginRight:8,verticalAlign:'middle'}} />Email:</label>
            <div className={styles.inputContainer}>
              <input 
                type="email" 
                value={profile.email || ''} 
                className={styles.input}
                readOnly
              />
            </div>
            <p className={styles.helpText}>
              This email is linked to your account. It is not visible to other users.
            </p>
          </div>
          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Lock size={16} style={{marginRight:8,verticalAlign:'middle'}} />Password:</label>
            <div className={styles.inputContainer}>
              {showPasswordForm ? (
                <PasswordChangeForm onCancel={()=>setShowPasswordForm(false)} />
              ) : (
                <Button className={styles.changePasswordButton} onClick={()=>setShowPasswordForm(true)}>
                  Change password
                </Button>
              )}
            </div>
            <p className={styles.helpText}>
              Password can only be changed if you are using the email/password login flow
            </p>
          </div>
          {/* First Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />First Name:</label>
            <div className={styles.inputContainer}>
              {showFirstNameForm ? (
                <NameChangeForm label="First Name" value={profile.firstName} onCancel={()=>setShowFirstNameForm(false)} onSave={val=>handleSave('firstName', val)} />
              ) : (
                <>
                  <input 
                    type="text" 
                    value={profile.firstName || ''} 
                    className={styles.input}
                    readOnly
                  />
                  <Button className={styles.changePasswordButton} onClick={()=>setShowFirstNameForm(true)}>
                    Change first name
                  </Button>
                </>
              )}
            </div>
            <p className={styles.helpText}>
              Your given name as it appears on your official documents.
            </p>
          </div>
          {/* Last Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} style={{marginRight:8,verticalAlign:'middle'}} />Last Name:</label>
            <div className={styles.inputContainer}>
              {showLastNameForm ? (
                <NameChangeForm label="Last Name" value={profile.lastName} onCancel={()=>setShowLastNameForm(false)} onSave={val=>handleSave('lastName', val)} />
              ) : (
                <>
                  <input 
                    type="text" 
                    value={profile.lastName || ''} 
                    className={styles.input}
                    readOnly
                  />
                  <Button className={styles.changePasswordButton} onClick={()=>setShowLastNameForm(true)}>
                    Change last name
                  </Button>
                </>
              )}
            </div>
            <p className={styles.helpText}>
              Your family name as it appears on your official documents.
            </p>
          </div>
          {/* Phone Number */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Phone size={16} style={{marginRight:8,verticalAlign:'middle'}} />Phone Number:</label>
            <div className={styles.inputContainer}>
              {showPhoneForm ? (
                <PhoneChangeForm value={profile.phoneNumber} onCancel={()=>setShowPhoneForm(false)} onSave={val=>handleSave('phoneNumber', val)} />
              ) : (
                <>
                  <input 
                    type="text" 
                    value={profile.phoneNumber || ''} 
                    className={styles.input}
                    readOnly
                  />
                  <Button className={styles.changePasswordButton} onClick={()=>setShowPhoneForm(true)}>
                    Change phone number
                  </Button>
                </>
              )}
            </div>
            <p className={styles.helpText}>
              Your primary contact number.
            </p>
          </div>
          {/* Country */}
          <div className={styles.formGroup}>
            <label className={styles.label}><Globe size={16} style={{marginRight:8,verticalAlign:'middle'}} />Country:</label>
            <div className={styles.inputContainer}>
              {showCountryForm ? (
                <CountryChangeForm value={profile.country} onCancel={()=>setShowCountryForm(false)} onSave={val=>handleSave('country', val)} />
              ) : (
                <>
                  <input 
                    type="text" 
                    value={profile.country || ''} 
                    className={styles.input}
                    readOnly
                  />
                  <Button className={styles.changePasswordButton} onClick={()=>setShowCountryForm(true)}>
                    Change country
                  </Button>
                </>
              )}
            </div>
            <p className={styles.helpText}>
              The country you currently reside in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

