import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const validatePassword = () => {
    if (password !== confirmPassword) return "Passwords do not match";
  };

  const totalCheck = (e: React.FormEvent) => {
    if (isRegister) handleLogin(e);
    else handleRegister(e);
    validatePassword();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsRegister(!isRegister);
    navigate("/");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsRegister(!isRegister);
    navigate("/");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check email for confirm");
    setLoading(false);
  };
  return (
    <div>
      {isRegister ? <p>Sign up</p> : <p>Log in</p>}
      <input
        type='email'
        placeholder='Your email'
        value={email}
        onChange={e => setEmail(e.target.value)}
      ></input>
      <input
        type='password'
        placeholder='Your password'
        value={password}
        onChange={e => setPassword(e.target.value)}
      ></input>
      {isRegister ? (
        <input
          type='password'
          placeholder='Confirm password '
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        ></input>
      ) : (
        <></>
      )}
      <button
        type='submit'
        onClick={totalCheck}
        disabled={
          loading || !email || !password || (!confirmPassword && isRegister)
        }
      >
        {isRegister ? "Sign up" : "Log in"}
      </button>
      {isRegister ? (
        <p onClick={() => setIsRegister(!isRegister)}>
          Donʼt have account yet?
        </p>
      ) : (
        <p onClick={() => setIsRegister(!isRegister)}>
          Already have an account?
        </p>
      )}
    </div>
  );
}

export default Auth;
