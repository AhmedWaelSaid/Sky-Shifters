import React, { useState } from 'react';
import { Button } from "../../../pages/MyBookings/ui/button.jsx";
import styles from './ProfileSection.module.css';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { Mail, Lock, User, Phone, Globe } from 'lucide-react';

countries.registerLocale(en);
const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(([code, name]) => ({
  value: name,
  label: name,
}));

const user = {
  email: "graceworld876@gmail.com",
  firstName: "Ahmed",
  lastName: "Mohamed",
  phoneNumber: "+201234567890",
  country: "Egypt"
};

function PasswordChangeForm({ onCancel }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe] = useState(false);

  // تحقق الشروط
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasLength = newPassword.length >= 8;
  const noSpaces = newPassword === newPassword.trim();

  const canSubmit = hasLower && hasUpper && hasNumber && hasLength && noSpaces && newPassword === rePassword && oldPassword;

  return (
    <div style={{maxWidth: 500}}>
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
        <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none', color: '#aaa', fontSize: 14}}>
          <li style={{color: hasLower ? '#4caf50' : '#aaa'}}>{hasLower ? '✔' : '✖'} Password must contain a lowercase letter</li>
          <li style={{color: hasUpper ? '#4caf50' : '#aaa'}}>{hasUpper ? '✔' : '✖'} Password must contain an uppercase letter</li>
          <li style={{color: hasNumber ? '#4caf50' : '#aaa'}}>{hasNumber ? '✔' : '✖'} Password must contain a number</li>
          <li style={{color: hasLength ? '#4caf50' : '#aaa'}}>{hasLength ? '✔' : '✖'} Password must be at least 8 characters long</li>
          <li style={{color: noSpaces ? '#4caf50' : '#aaa'}}>{noSpaces ? '✔' : '✖'} Password must not contain leading or trailing spaces</li>
        </ul>
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
        <Button className={styles.changePasswordButton} disabled={!canSubmit}>Change password</Button>
        <Button className={styles.uploadButton} style={{background:'#222',color:'#fff'}} onClick={onCancel}>Cancel</Button>
      </div>
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showFirstNameForm, setShowFirstNameForm] = useState(false);
  const [showLastNameForm, setShowLastNameForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showCountryForm, setShowCountryForm] = useState(false);
  // يمكنك إضافة state لتخزين القيم الجديدة بعد الحفظ إذا أردت

  return (
    <div className={styles.profileSection}>
      {/* Profile Information */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}><Mail size={16} style={{marginRight:8,verticalAlign:'middle'}} />Email:</label>
          <div className={styles.inputContainer}>
            <input 
              type="email" 
              value={user.email} 
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
              <NameChangeForm label="First Name" value={user.firstName} onCancel={()=>setShowFirstNameForm(false)} onSave={()=>setShowFirstNameForm(false)} />
            ) : (
              <>
                <input 
                  type="text" 
                  value={user.firstName} 
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
              <NameChangeForm label="Last Name" value={user.lastName} onCancel={()=>setShowLastNameForm(false)} onSave={()=>setShowLastNameForm(false)} />
            ) : (
              <>
                <input 
                  type="text" 
                  value={user.lastName} 
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
              <PhoneChangeForm value={user.phoneNumber} onCancel={()=>setShowPhoneForm(false)} onSave={()=>setShowPhoneForm(false)} />
            ) : (
              <>
                <input 
                  type="text" 
                  value={user.phoneNumber} 
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
              <CountryChangeForm value={user.country} onCancel={()=>setShowCountryForm(false)} onSave={()=>setShowCountryForm(false)} />
            ) : (
              <>
                <input 
                  type="text" 
                  value={user.country} 
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

      {/* Payments Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Payments</h2>
      </div>

      {/* Profile Picture Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile picture</h2>
        
        <div className={styles.profilePictureContainer}>
          <div className={styles.avatarLarge}>
            <div className={styles.avatarPlaceholder}>
              <span className={styles.avatarIcon}>👤</span>
            </div>
          </div>
          <div className={styles.uploadSection}>
            <Button className={styles.uploadButton}>
              Upload image
            </Button>
            <p className={styles.uploadText}>
              Must be JPEG, PNG or HEIC and cannot exceed 10MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

