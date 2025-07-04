import { useState } from 'react'
import { Camera, Mail, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js'
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore(state => state);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false); //FOR EDITING
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  if (!authUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex items-start justify-center">
      <div className="w-full max-w-2xl p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your Profile Information</p>
          </div>
          {/* avatar section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>
          {/* User Info */}

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={authUser.fullName}
                  onChange={(e) =>
                    useAuthStore.setState((state) => ({
                      authUser: { ...state.authUser, fullName: e.target.value },
                    }))
                  }
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  disabled={isUpdatingProfile}
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser.fullName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={authUser.email}
                  onChange={(e) =>
                    useAuthStore.setState((state) => ({
                      authUser: { ...state.authUser, email: e.target.value },
                    }))
                  }
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  disabled={isUpdatingProfile}
                />
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser.email}</p>
              )}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-4">
            {isEditing ? (
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  updateProfile({ fullName: authUser.fullName, email: authUser.email });
                  setIsEditing(false);
                }}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                className="btn btn-outline w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* DELETE ACCOUNT */}
          <div className="mt-4">
            <button
              className="btn btn-error btn-outline w-full"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  useAuthStore.getState().deleteAccount(navigate);
                }
              }}
            >
              Delete Account
            </button>
          </div>


          {/* Additional info field */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
          {/* END */}
        </div>
      </div>
    </div>
  );
  
};

export default ProfilePage;
