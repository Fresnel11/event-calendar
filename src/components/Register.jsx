import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Notification from './Notification';
import { useNavigate } from 'react-router-dom';

const Register = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Données JSON de l\'API :', data); // Vérifie les données JSON

            if (data.success) {
                // onSuccess(); // Appelle la fonction onSuccess
                localStorage.setItem('auth_token', data.token);
                setNotification({ message: 'Votre compte a été créé avec succès!', type: 'success' });
                setTimeout(() => setNotification(null), 4000);
                navigate('/');
            } else {
                setError(data.message || 'Une erreur est survenue.');

                console.log('error');

            }
        } catch (error) {
            console.error('Erreur attrapée :', error); // Affiche l'erreur dans la console
            setError('Une erreur est survenue lors de l\'inscription.');
            console.log('error :dsdf');
            setNotification({ message:'Une erreur est survenue lors de l\'inscription.', type: 'error' });
            setTimeout(() => setNotification(null), 4000);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Notification */}
            {notification && (
                <Notification key={notification.message} message={notification.message} type={notification.type} />
            )}
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mx-auto h-16 w-16 bg-[#238781] rounded-full flex items-center justify-center mb-4"
                        >
                            <Lock className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900">Bienvenue</h2>
                        <p className="mt-2 text-sm text-gray-600">Inscrivez-vous</p>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {/* {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 text-red-600 p-4 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )} */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                        placeholder="votreemail@exemple.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5 cursor-pointer text-gray-400" /> : <Eye className="h-5 w-5 cursor-pointer text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#238781] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5 cursor-pointer text-gray-400" /> : <Eye className="h-5 w-5 cursor-pointer text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center cursor-pointer py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#238781] hover:bg-[#1a6661] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#238781] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'S\'inscrire'
                            )}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Vous avez un compte ? <a href="/login" className="font-medium text-[#238781] hover:text-[#1a6661]">Connectez-vous</a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
