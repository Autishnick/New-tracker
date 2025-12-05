import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../supabaseClient";
import Profile from "./Profile";
function Auth() {
  const { user } = useAuth();
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) toast.error("Error: " + error.message);
    else {
      navigate("/");
    }
    setLoading(false);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsRegister(!isRegister);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error("Error: " + error.message);
    else {
      navigate("/");
    }
    setLoading(false);
  };
  return user ? (
    <div>
      <Profile />
    </div>
  ) : (
    <div>
      {isRegister ? <p>Log in</p> : <p>Sign up</p>}
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
        <></>
      ) : (
        <input
          type='password'
          placeholder='Confirm password '
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        ></input>
      )}
      <button
        type='submit'
        onClick={totalCheck}
        disabled={
          loading || !email || !password || (!confirmPassword && !isRegister)
        }
      >
        {isRegister ? "Log in" : "Sign up"}
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
