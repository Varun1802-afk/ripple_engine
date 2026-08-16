import React, { useState } from 'react';
import styled from 'styled-components';
import { loginWithGoogle, loginWithEmail, signUpWithEmail } from '../config/firebase';
import { useGraph } from '../store/GraphContext';

export function LoginFormModal({ isOpen, onClose }) {
  const { setUser, setActiveView } = useGraph();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSuccessLogin = (userObj) => {
    const loginFn = setUser || (useGraph() && useGraph().loginUser);
    if (typeof loginFn === 'function') {
      loginFn(userObj);
    }
    onClose();
    // Immediately navigate to Decision Input Panel!
    if (setActiveView) {
      setActiveView('input');
    }
  };

  const handleGoogleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      handleSuccessLogin({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
        photoURL: res.user.photoURL
      });
    } else {
      setErrorMessage(res.error || 'Google Authentication Failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    let res = null;
    if (mode === 'signup') {
      res = await signUpWithEmail(email, password);
    } else {
      res = await loginWithEmail(email, password);
    }
    setLoading(false);

    if (res.success) {
      handleSuccessLogin({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || res.user.displayName || email.split('@')[0] || 'User'
      });
    } else {
      setErrorMessage(res.error || 'Authentication Failed');
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <StyledWrapper>
          <form className="form" onSubmit={handleSubmit}>
            <CloseButton type="button" onClick={onClose}>✕</CloseButton>

            {/* Mode Switcher Tabs (Sign In / Sign Up) */}
            <TabSwitcher>
              <TabButton
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => { setMode('login'); setErrorMessage(''); }}
              >
                Sign In
              </TabButton>
              <TabButton
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => { setMode('signup'); setErrorMessage(''); }}
              >
                Sign Up
              </TabButton>
            </TabSwitcher>

            <p className="form-title">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </p>

            {errorMessage && (
              <ErrorMessageBox>{errorMessage}</ErrorMessageBox>
            )}

            {/* Social Login Button */}
            <div className="social-buttons-container">
              <button
                type="button"
                className="social-button google-button"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                <svg className="svg" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="line" />

            {/* Input Fields */}
            <div className="input-container">
              {mode === 'signup' && (
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <button type="submit" className="submit" disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>

            <p className="signup-link">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <a
                href="#toggle"
                onClick={(e) => {
                  e.preventDefault();
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMessage('');
                }}
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </a>
            </p>
          </form>
        </StyledWrapper>
      </ModalContainer>
    </ModalBackdrop>
  );
}

/* Styled Components for Neumorphic / Glassmorphic Auth Modal */
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 16px;
  color: #6B7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  transition: color 0.2s;
  &:hover {
    color: #111827;
  }
`;

const TabSwitcher = styled.div`
  display: flex;
  background: #E5E7EB;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &.active {
    background: #FFFFFF;
    color: #111827;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
`;

const ErrorMessageBox = styled.div`
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

const StyledWrapper = styled.div`
  .form {
    background-color: #ffffff;
    display: block;
    padding: 32px;
    position: relative;
  }

  .form-title {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 700;
    text-align: center;
    color: #111827;
    margin: 0 0 16px 0;
  }

  .input-container input {
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    width: 100%;
    border-radius: 0.5rem;

    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    outline: none;
    box-sizing: border-box;
  }

  .input-container input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .submit {
    display: block;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    background-color: #2563eb;
    color: #ffffff;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    width: 100%;
    border-radius: 0.5rem;
    text-transform: uppercase;

    margin-top: 1.25rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit:hover {
    background-color: #1d4ed8;
  }

  .signup-link {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: center;

    margin-top: 1rem;
    margin-bottom: 0;
  }

  .signup-link a {
    text-decoration: underline;
    color: #2563eb;
    font-weight: 600;
  }

  .social-buttons-container {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-bottom: 12px;
  }

  .social-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    border-radius: 0.5rem;

    border: 1px solid #e5e7eb;

    font-size: 0.875rem;
    font-weight: 600;

    background-color: #ffffff;
    cursor: pointer;

    transition: all 0.2s ease;
  }

  .social-button:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  .social-button .svg {
    width: 1.25rem;
    height: 1.25rem;

  }

  .line {
    height: 1px;
    background-color: #e5e7eb;
    margin: 16px 0;
  }
`;
