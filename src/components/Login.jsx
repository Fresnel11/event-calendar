import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Données JSON de l\'API :', data);

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                setNotification({ message: 'Votre compte a été créé avec succès!', type: 'success' });
                setTimeout(() => setNotification(null), 4000);
                console.log("Redirection vers '/'");  // Vérifie si ce log s'affiche
                navigate('/')
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur attrapée :', error);
            setError('Une erreur est survenue lors de l\'inscription.');
            console.log('error :dsdf');
            setNotification({ message: 'Une erreur est survenue lors de la connexion.', type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100  flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white  p-8 rounded-2xl shadow-xl"
            >
                {/* En-tête */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto h-16 w-16 bg-[#238781] rounded-full flex items-center justify-center mb-4"
                    >
                        <Lock className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 ">
                        Bienvenue
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connectez-vous à votre compte
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm"
                        >
                            {error}
                        </motion.div>
                    )} */}

                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700  mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300  rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent bg-white  text-gray-900  placeholder-gray-500  transition-all duration-200"
                                    placeholder="votreemail@exemple.com"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                    ) : (
                                        <Eye className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#238781] focus:ring-[#238781] border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Se souvenir de moi
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#238781] hover:text-[#1a6661]">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex cursor-pointer justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#238781] hover:bg-[#1a6661] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#238781] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                {/* Pied de page */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vous n'avez pas de compte ?{' '}
                        <a href="/register" className="font-medium text-[#238781] hover:text-[#1a6661]">
                            Inscrivez-vous
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;