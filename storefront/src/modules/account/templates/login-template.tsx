"use client"

import { useState, useEffect } from "react"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)
  const [user, setUser] = useState<any>(null)

  // ✅ Fetch logged-in user
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`,
          { credentials: "include" }
        )
        if (res.ok) {
          const data = await res.json()
          setUser(data.customer)
        }
      } catch {}
    }
    checkUser()
  }, [])

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center ">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome back, {user.first_name || user.email} 👋
        </h1>
        <p className=" mb-8">
          You’re already signed in.
        </p>
        <button
          onClick={async () => {
            await fetch(
              `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/session`,
              { method: "DELETE", credentials: "include" }
            )
            setUser(null)
          }}
          className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center min-h-screen ">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          {currentView === LOGIN_VIEW.SIGN_IN ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {currentView === LOGIN_VIEW.SIGN_IN
            ? "Welcome back — access your account below."
            : "Join us and start shopping smarter."}
        </p>

        {currentView === LOGIN_VIEW.SIGN_IN ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} />
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
