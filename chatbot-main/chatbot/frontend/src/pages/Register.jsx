import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-black">
      {/* Left section with tagline */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <h1 className="text-5xl font-bold text-white">
          Unleash your inner<br />sloth today.
          <span className="text-purple-400">🦥</span>
        </h1>
      </div>

      {/* Right section with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Create Your Account
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="username@slothmail.com"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8">
            <p className="text-gray-400 text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Sign In
              </Link>
            </p>
          </div>

          {/* Social signup options */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center mb-4">
              Or sign up with
            </p>
            <div className="flex justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <img src="/twitter-icon.svg" alt="Twitter" className="w-6 h-6" />
              </button>
              <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}