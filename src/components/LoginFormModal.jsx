import React, { useState } from 'react';
import styled from 'styled-components';
import { loginWithGoogle, loginWithEmail } from '../config/firebase';
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
    setUser(userObj);
    onClose();
    // Immediately navigate to Decision Input Panel!
    setActiveView('input');
  };

  const handleGoogleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      handleSuccessLogin(res.user);
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
    const res = await loginWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      handleSuccessLogin({
        ...res.user,
        displayName: name || res.user.displayName || email.split('@')[0]
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

            <p>
              {mode === 'login' ? (
                <>Welcome,<span>sign in to continue</span></>
              ) : (
                <>Create Account,<span>join Ripple Engine today</span></>
              )}
            </p>

            {/* Google OAuth Button */}
            <button type="button" className="oauthButton" onClick={handleGoogleClick} disabled={loading}>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>

            <div className="separator">
              <div />
              <span>OR</span>
              <div />
            </div>

            {/* Input Fields */}
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {mode === 'signup' && (
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            {/* Submit Button */}
            <button type="submit" className="oauthButton" disabled={loading}>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </button>

            {errorMessage && (
              <p style={{ color: '#DC2626', fontSize: '12px', margin: 0, fontWeight: 700, textAlign: 'center' }}>
                {errorMessage}
              </p>
            )}
          </form>
        </StyledWrapper>
      </ModalContainer>
    </ModalBackdrop>
  );
}

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  position: relative;
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes scaleUp {
    from { transform: scale(0.92) translateY(12px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 800;
  color: #323232;
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.12);
  }
`;

const TabSwitcher = styled.div`
  display: flex;
  width: 100%;
  height: 42px;
  gap: 6px;
  background: rgba(0, 0, 0, 0.08);
  padding: 3px;
  border-radius: 8px;
  border: 2px solid #323232;
  box-sizing: border-box;
  margin-bottom: 2px;
  align-items: center;
`;

const TabButton = styled.button`
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  font-family: "Syne", "Outfit", sans-serif;
  font-weight: 800;
  font-size: 14px;
  line-height: 1;
  color: #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;

  &.active {
    background: #323232;
    color: #FFFFFF;
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
  }
`;

const StyledWrapper = styled.div`
  /* DEOXY Was Here */
  position: relative;

  .form {
    --background: #d3d3d3;
    --input-focus: #2d8cf0;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --main-color: #323232;
    padding: 20px 24px 22px 24px;
    background: var(--background);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-radius: 12px;
    border: 2px solid var(--main-color);
    box-shadow: 6px 6px var(--main-color);
    width: 320px;
    box-sizing: border-box;
  }

  .form > p {
    font-family: "Syne", "Outfit", sans-serif;
    color: var(--font-color);
    font-weight: 800;
    font-size: 18px;
    margin: 0 0 2px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .form > p > span {
    font-family: "Plus Jakarta Sans", sans-serif;
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 12px;
    margin-top: 2px;
  }

  .separator {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 1px 0;
  }

  .separator > div {
    flex: 1;
    height: 2px;
    border-radius: 5px;
    background-color: var(--font-color-sub);
  }

  .separator > span {
    color: var(--font-color);
    font-family: "Plus Jakarta Sans", sans-serif;
    font-weight: 700;
    font-size: 12px;
  }

  .oauthButton {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    width: 100%;
    height: 38px;
    border-radius: 8px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 3px 3px var(--main-color);
    font-size: 14px;
    font-weight: 700;
    color: var(--font-color);
    cursor: pointer;
    transition: all 200ms;
    position: relative;
    overflow: hidden;
    z-index: 1;
    box-sizing: border-box;
  }

  .oauthButton::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    background-color: #212121;
    z-index: -1;
    box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
    transition: all 200ms;
  }

  .oauthButton:hover {
    color: #e8e8e8;
  }

  .oauthButton:hover::before {
    width: 100%;
  }

  .form > input {
    width: 100%;
    height: 38px;
    border-radius: 8px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 3px 3px var(--main-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--font-color);
    padding: 4px 12px;
    outline: none;
    box-sizing: border-box;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
