import { useState } from "react";
import LetterGlitch from "../Designs/LetterGlitch";
import { useForm } from "react-hook-form";
import api from "../Services/api";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { login: loginUser } = useAuth();

  const responseGoogle = async (authResult) => {
    try {
      console.log(authResult);
      const response = await api.post(`/users/oauth/google`, {
        access_token: authResult.access_token,
      });

      const {
        token,
        data: { user },
      } = response.data;

      const minimalUser = {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      };

      loginUser(token, minimalUser);
      navigate("/chatbot");
    } catch (err) {
      console.error("OAuth Login Error:", err);
      setBackendError("Google sign-in failed.");
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
  });

  const onSubmit = async (data) => {
    setBackendError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const url = isRegistering ? "/users/signup" : "/users/login";
      const response = await api.post(url, data);
      const {
        token,
        data: { user },
      } = response.data;

      const minimalUser = {
        id: user._id,
        email: user.email,
        username: user.username,
      };

      loginUser(token, minimalUser);
      setSuccessMessage(
        isRegistering ? "Registration successful!" : "Login successful!"
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/");
    } catch (error) {
      setBackendError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Glitch Background Layer */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      {/* Login Box - Foreground */}
      <div className="relative z-10 bg-white bg-opacity-90 p-10 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex gap-1 items-left justify-start mb-6">
          <h1 className="text-4xl font-medium font-['Kantumruy_Pro','sans-serif']">
            ELECTRON
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col font-[Inter,sans-serif]">
              <p className="text-xs font-medium">Username</p>
              <input
                className="pl-2 h-8 text-sm font-light border rounded"
                type="text"
                placeholder="Enter your username"
                {...register("username")}
              />
            </div>
            <div className="flex flex-col font-[Inter,sans-serif]">
              <p className="text-xs font-medium">Email</p>
              <input
                className="pl-2 h-8 text-sm font-light border rounded"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />
            </div>
            <div className="flex flex-col font-[Inter,sans-serif]">
              <p className="text-xs font-medium">Password</p>
              <input
                className="pl-2 h-8 text-sm font-light border rounded"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
            </div>

            {isRegistering && (
              <div className="flex flex-col font-[Inter,sans-serif]">
                <p className="text-xs font-medium">Confirm Password</p>
                <input
                  className="pl-2 h-8 text-sm font-light border rounded"
                  type="password"
                  placeholder="Confirm your password"
                  {...register("passwordConfirm")}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="w-3 h-3 border rounded" />
                Remember me for 90 days
              </label>
              <span className="text-blue-500 cursor-pointer">
                Forgot Password
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white w-full h-10 rounded-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : isRegistering ? (
                "Register"
              ) : (
                "Sign in"
              )}
            </button>

            <button
              className="flex items-center justify-center gap-2 bg-white text-black border border-gray-300 w-full h-10 rounded-md shadow-sm hover:bg-gray-100"
              onClick={googleLogin}
            >
              <img src="assets/google.svg" alt="Google" className="h-5 w-5" />
              Sign in with Google
            </button>

            <p className="text-sm mt-2 text-center">
              {isRegistering ? (
                <>
                  Not the first time?{" "}
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setIsRegistering(false)}
                  >
                    Login
                  </span>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setIsRegistering(true)}
                  >
                    Register Now
                  </span>
                </>
              )}
            </p>

            {successMessage && (
              <p className="text-green-600 text-sm text-center mt-1">
                {successMessage}
              </p>
            )}
            {backendError && (
              <p className="text-red-600 text-sm text-center mt-1">
                {backendError}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
