import { useEffect, useState } from "react";
import toast from "react-hot-toast"; // Імпорт тостера
import { useAuth } from "../../context/useAuth";
import { useExpenseStats } from "../../hooks/useExpenseStats";
import { supabase } from "../../supabaseClient";

function Profile() {
  const { session, signOut } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { allTimeTotal } = useExpenseStats(session);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.user_metadata?.display_name) {
        setName(user.user_metadata.display_name);
      }
    };
    getProfile();
  }, []);

  const handleChangeName = async () => {
    if (!name.trim()) {
      toast.error("Name can't be empty!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: name,
      },
    });

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Name successfully changed!");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Your profile</h1>
      <div>
        <label>Name:</label>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button onClick={handleChangeName} disabled={loading}>
          {loading ? "Loading..." : "Change name"}
        </button>
      </div>
      <div>
        <label>
          Total expenses:
          {allTimeTotal ? " " + allTimeTotal.toFixed(2) + " UAH" : " 0.00 UAH"}
        </label>
      </div>
      <button onClick={signOut}>Log Out</button>
    </div>
  );
}

export default Profile;
