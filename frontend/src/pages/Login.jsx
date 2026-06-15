import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('student'); // 'student', 'admin', or 'deptAdmin'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminLogin, deptAdminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let res;
    if (role === 'student') {
      res = await login(loginId, password);
    } else if (role === 'admin') {
      res = await adminLogin(loginId, password);
    } else {
      res = await deptAdminLogin(loginId, password);
    }

    if (res.success) {
      if (role === 'student') navigate('/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/dept-admin/dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans">
      <div className="max-w-md w-full bg-white backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100 z-10 relative overflow-hidden">
        {/* Role Switcher Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200">
          <button
            onClick={() => { setRole('student'); setError(''); setLoginId(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              role === 'student' 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <User className={`w-4 h-4 mr-1.5 ${role === 'student' ? 'animate-pulse' : ''}`} />
            Student
          </button>
          <button
            onClick={() => { setRole('deptAdmin'); setError(''); setLoginId(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 mx-1 ${
              role === 'deptAdmin' 
                ? 'bg-white text-purple-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Shield className={`w-4 h-4 mr-1.5 ${role === 'deptAdmin' ? 'animate-pulse' : ''}`} />
            Department Admin
          </button>
          <button
            onClick={() => { setRole('admin'); setError(''); setLoginId(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              role === 'admin' 
                ? 'bg-white text-rose-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Shield className={`w-4 h-4 mr-1.5 ${role === 'admin' ? 'animate-pulse' : ''}`} />
            Admin
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {role === 'student' ? 'Welcome Back' : (role === 'admin' ? 'Admin Portal' : 'Department Admin Portal')}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            {role === 'student' ? 'Sign in to your student portal' : 'Authorized personnel only'}
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-2xl mb-6 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
            role === 'student' 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {role === 'student' ? 'Enrollment Number / Email' : (role === 'admin' ? 'Admin Email' : 'Department Admin Username')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {role === 'student' ? (
                  <User className="h-5 w-5 text-blue-500 transition-colors duration-300" />
                ) : (
                  <Shield className={`h-5 w-5 transition-colors duration-300 ${role === 'admin' ? 'text-rose-500' : 'text-purple-500'}`} />
                )}
              </div>
              <input
                type={role === 'admin' ? "email" : "text"}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                  role === 'student' ? 'focus:ring-blue-500/20 focus:border-blue-500' : (role === 'admin' ? 'focus:ring-rose-500/20 focus:border-rose-500' : 'focus:ring-purple-500/20 focus:border-purple-500')
                }`}
                placeholder={role === 'student' ? "Enter your ID" : (role === 'admin' ? "admin@system.com" : "Department Username")}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              {role === 'student' && (
                <Link to="/forgot-password" title="Coming Soon" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors duration-300 ${role === 'student' ? 'text-blue-500' : (role === 'admin' ? 'text-rose-500' : 'text-purple-500')}`} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                  role === 'student' ? 'focus:ring-blue-500/20 focus:border-blue-500' : (role === 'admin' ? 'focus:ring-rose-500/20 focus:border-rose-500' : 'focus:ring-purple-500/20 focus:border-purple-500')
                }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] mt-2 ${
              role === 'student' 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20 shadow-lg' 
                : (role === 'admin' ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/20 shadow-lg' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-600/20 shadow-lg')
            }`}
          >
            {loading ? 'Authenticating...' : (role === 'student' ? 'Sign In' : 'Secure Login')}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>

        {role === 'student' && (
          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            New student?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

