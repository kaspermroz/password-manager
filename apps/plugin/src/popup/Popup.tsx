import { useState, useEffect } from 'preact/hooks';
import { login, isTokenValid, getEncryptedPasswords } from './api';

type State = 'validating' | 'credentials' | 'otp' | 'authenticated';

const Popup = () => {
  const [state, setState] = useState<State>('validating');
  const [userToken, setUserToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

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
                setState('authenticated');
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
        setState('authenticated');
      });
    } catch (err) {
      console.error(e);
    }
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
            <button type='submit'>Sign innn</button>
            <a href='http://localhost:5173' target='_blank'>
              Don't have an account?
            </a>
          </div>
        </form>
      )}

      {state === 'authenticated' && <Passwords token={userToken} />}
    </div>
  );
};

type PasswordsProps = { token: string };

const Passwords = ({ token }: PasswordsProps) => {
  const [passwords, setPasswords] = useState<any>([]);
  useEffect(() => {
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      tabs => {
        console.log({ tabs });
        (async function () {
          if (!token) return;

          const url = new URL(tabs[0].url!);
          const pwds = await getEncryptedPasswords(token, url.origin);
          console.log(pwds);
          setPasswords(pwds);
        })();
      }
    );
  }, [token]);

  const handleAutofill = (username: string, password: string) => {
    console.log({ username, password });
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      tabs => {
        chrome.scripting.executeScript({
          target: {
            tabId: tabs[0]!.id!,
          },
          func: function (username, password) {
            var usernameInput = document.querySelector('input[type="text"]');
            var passwordInput = document.querySelector(
              'input[type="password"]'
            );

            console.log({ username, password });

            // @ts-expect-error
            if (usernameInput) usernameInput.value = username;
            // @ts-expect-error
            if (passwordInput) passwordInput.value = password;
          },
          args: [username, password],
        });
      }
    );
  };

  if (!token) return null;

  return (
    <div class='grid gap-4 px-4'>
      <p>You have {passwords.length} passwords for this origin.</p>
      <table>
        <tbody>
          {passwords.map((p: any) => (
            <tr>
              <td>{p.username}</td>
              <td>
                <button
                  onClick={() =>
                    handleAutofill(p.username, p.encryptedPassword)
                  }
                >
                  Autofill
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Popup;
