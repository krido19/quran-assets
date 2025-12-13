import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await signUp(email, password);
        if (error) {
            alert(error.message);
        } else {
            alert(t('auth.signupSuccess'));
            navigate('/profile');
        }
    };

    return (
        <div id="view-signup" className="view active">
            <div className="auth-container">
                <h2>{t('auth.createAccount')}</h2>
                <p>{t('auth.joinUs')}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('auth.email')}</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary">{t('auth.signUp')}</button>
                </form>
                <p className="auth-footer">
                    {t('auth.haveAccount')} <Link to="/profile">{t('auth.signIn')}</Link>
                </p>
            </div >
        </div >
    );
}
