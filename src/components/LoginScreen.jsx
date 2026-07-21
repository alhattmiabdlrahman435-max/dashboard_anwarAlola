import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../contexts/Auth/useAuth';
import sloganLogo from '../assets/slogan.jpeg';
import { 
  Globe, Sun, Moon, ShieldAlert, Users, User, Lock, EyeOff, Eye, LogIn, KeyRound, AlertCircle 
} from 'lucide-react';

export default function LoginScreen() {
  const {
    lang, setLang, t,
    darkMode, setDarkMode,
    setToastMessage
  } = useApp();
  const { login } = useAuth();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const usernameTrimmed = loginUsername.trim();
    const passwordTrimmed = loginPassword.trim();

    if (!usernameTrimmed || !passwordTrimmed) {
      setLoginError(lang === 'ar' ? 'الرجاء إدخال اسم المستخدم وكلمة المرور' : 'Please enter username and password');
      return;
    }

    try {
      await login(usernameTrimmed, passwordTrimmed, loginRole);
      setToastMessage(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
      if (err.message === 'Unauthorized') {
        setLoginError(lang === 'ar' ? 'عذراً، غير مصرح لك بالدخول إلى لوحة التحكم الإدارية.' : 'Sorry, you are not authorized to access the admin dashboard.');
      } else {
        setLoginError(lang === 'ar' ? err.message : 'Invalid credentials');
      }
    }
  };

  return (
    <div className={`login-page-container animate-fade-in ${darkMode ? 'dark' : ''}`}>
      {/* Language & Theme Selectors */}
      <div className="login-top-actions no-print">
        <button className="login-action-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Globe size={16} />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
        <button className="login-action-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{darkMode ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}</span>
        </button>
      </div>

      <div className="login-content animate-slide-up">
        <div className="login-brand-section">
          <div className="login-logo-container animate-pulse-soft">
            <img src={sloganLogo} alt="School Logo" className="login-logo" />
          </div>
          <h1 className="login-brand-title">{t.appName}</h1>
          <h2 className="login-brand-subtitle">{t.appSubtitle}</h2>
          <p className="login-brand-desc">{t.loginSubtitle}</p>
        </div>

        <div className="login-card-wrapper glass-panel">
          <div className="login-card-header">
            <h3>{t.loginTitle}</h3>
          </div>

          {/* Role Select Tabs */}
          <div className="login-role-tabs">
            {[
              { role: 'admin', label: t.roleAdmin, icon: <ShieldAlert size={16} /> },
              { role: 'supervisor', label: t.roleSupervisor, icon: <Users size={16} /> }
            ].map((item) => (
              <button
                key={item.role}
                className={`login-role-tab ${loginRole === item.role ? 'active' : ''}`}
                onClick={() => {
                  setLoginRole(item.role);
                  setLoginError('');
                }}
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error-alert">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="login-input-group">
              <label className="login-input-label">{t.usernameOrId}</label>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={
                    loginRole === 'admin' 
                      ? (lang === 'ar' ? 'مثال: admin' : 'e.g. admin')
                      : (lang === 'ar' ? 'مثال: supervisor' : 'e.g. supervisor')
                  }
                  className="login-input focus-ring"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-input-label">{t.passwordLabel}</label>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="login-input focus-ring"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-form-options">
              <label className="login-remember-me">
                <input type="checkbox" defaultChecked />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            <button type="submit" className="login-submit-btn">
              <LogIn size={18} />
              <span>{t.loginBtn}</span>
            </button>
          </form>


        </div>
      </div>

      <div className="login-footer">
        <p>{t.loginFooter}</p>
      </div>
    </div>
  );
}
