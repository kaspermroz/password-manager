import { useState, useEffect } from 'preact/hooks';
import { login, isTokenValid, getEncryptedPasswords } from './api';
import { decrypt } from './utils';

type State = 'validating' | 'credentials' | 'otp' | 'secret' | 'authenticated';

const Popup = () => {
  const [state, setState] = useState<State>('validating');
  const [userToken, setUserToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    (async function () {
      chrome.storage.local.get('userToken', ({ userToken }) => {
        if (userToken) {
          (async function () {
            try {
              const isValid = await isTokenValid(userToken);
              if (!isValid) {
                chrome.storage.local.remove('userToken', () => {
                  setState('credentials');
                });
              } else {
                setUserToken(userToken);
                setState('secret');
              }
            } catch {
              chrome.storage.local.remove('userToken', () => {
                setState('credentials');
              });
            }
          })();
        } else {
          setState('credentials');
        }
      });
    })();
  }, []);

  const handleSubmitCredentials = (e: any) => {
    e.preventDefault();
    setState('otp');
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const { token } = await login(email, password, otp);
      chrome.storage.local.set({ userToken: token }, () => {
        console.log('token set');
        setUserToken(token);
        setState('secret');
      });
    } catch (err) {
      console.error(e);
    }
  };

  const handleSecret = (e: any) => {
    e.preventDefault();

    setSecret(e.currentTarget.secret.value);
    setState('authenticated');
  };

  return (
    <div class='w-full min-w-[390px] bg-[#fafafa] p-8 text-center text-lg'>
      <p class='mb-4 text-3xl'>Password Manager</p>

      {state === 'validating' && <p>Validating...</p>}

      {state === 'credentials' && (
        <form method='post' onSubmit={handleSubmitCredentials}>
          <div class='grid gap-4 px-4'>
            <input
              type='text'
              name='email'
              placeholder='E-mail'
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
            />
            <input
              type='password'
              name='email'
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
            />
            <button type='submit'>Continue</button>
            <a href='http://localhost:5173' target='_blank'>
              Don't have an account?
            </a>
          </div>
        </form>
      )}

      {state === 'otp' && (
        <form method='post' onSubmit={handleLogin}>
          <div class='grid gap-4 px-4'>
            <input
              type='text'
              name='otp'
              placeholder='OTP Code'
              value={otp}
              onChange={e => setOtp(e.currentTarget.value)}
            />
            <button type='submit'>Sign in</button>
            <a href='http://localhost:5173' target='_blank'>
              Don't have an account?
            </a>
          </div>
        </form>
      )}

      {state === 'secret' && (
        <form method='post' onSubmit={handleSecret}>
          <div class='grid gap-4 px-4'>
            <p>
              You must provide master password to get your stored passwords.
            </p>
            <input type='password' name='secret' placeholder='Secret' />
            <button type='submit'>Get passwords</button>
          </div>
        </form>
      )}

      {state === 'authenticated' && (
        <Passwords token={userToken} secret={secret} />
      )}
    </div>
  );
};

type PasswordsProps = { token: string; secret: string };

const Passwords = ({ token, secret }: PasswordsProps) => {
  const [passwords, setPasswords] = useState<any>([]);
  useEffect(() => {
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      tabs => {
        console.log({ tabs });
        (async function () {
          if (!token || !secret) return;

          const url = new URL(tabs[0].url!);
          const pwds = await getEncryptedPasswords(token, url.origin);
          setPasswords(pwds);
        })();
      }
    );
  }, [token]);

  const handleAutofill = (username: string, password: string) => {
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      tabs => {
        chrome.scripting.executeScript({
          target: {
            tabId: tabs[0]!.id!,
          },
          func: function (username, password) {
            var usernameInput = document.querySelector(
              'input[type="text"]'
            ) as HTMLInputElement;
            var passwordInput = document.querySelector(
              'input[type="password"]'
            ) as HTMLInputElement;
            if (usernameInput) usernameInput.value = username;
            if (passwordInput) passwordInput.value = password;
          },
          args: [username, password],
        });
      }
    );
  };

  

  if (!token || !secret) return null;

  return (
    <div class='grid gap-4 px-4'>
      <p>You have {passwords.length} passwords for this origin.</p>

      {passwords.map((p: any) => (
        <div class='password-row'>
          <span class='text-sm'>{p.username}</span>
          <button
            class='button-sm text-sm'
            onClick={() =>
              handleAutofill(p.username, decrypt(p.encryptedPassword, secret))
            }
          >
            Autofill
          </button>
        </div>
      ))}
    </div>
  );
};

export default Popup;
