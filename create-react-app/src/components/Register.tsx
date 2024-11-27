import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        otp: '',
    });
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Format Myanmar phone number
        if (e.target.name === 'phoneNumber') {
            value = formatMyanmarPhone(value);
        }

        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const formatMyanmarPhone = (phone: string): string => {
        // Remove all non-numeric characters
        const numbers = phone.replace(/\D/g, '');

        // Format for Myanmar phones (09-XXX-XXX-XXX)
        if (numbers.length <= 4) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        } else if (numbers.length <= 10) {
            return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`;
        }
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 10)}`;
    };

    const validateMyanmarPhone = (phone: string): boolean => {
        // Myanmar phone number format: 09XXXXXXXXX
        const phoneRegex = /^09\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    const handleSendOTP = async () => {
        try {
            if (!validateMyanmarPhone(formData.phoneNumber)) {
                setError('Please enter a valid Myanmar phone number');
                return;
            }

            await otpService.sendOTP({
                phoneNumber: formData.phoneNumber,
                action: 'register'
            });
            setOtpSent(true);
            setError('');
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await otpService.verifyOTP({
                phoneNumber: formData.phoneNumber,
                otpCode: formData.otp
            });
            setOtpVerified(true);
            setError('');
        } catch (err) {
            setError('Invalid OTP code');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otpVerified) {
            setError('Please verify your phone number first');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await authService.register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Create SevenK Account</h2>
                <p className="auth-subtitle">Myanmar's Premier 2D/3D Lottery Platform</p>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="phone-input-group">
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="09-XXX-XXX-XXX"
                            required
                        />
                        {!otpVerified && (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="otp-button"
                                disabled={otpSent && !otpVerified}
                            >
                                {otpSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                        )}
                    </div>
                    <small className="form-text">Myanmar phone number format: 09XXXXXXXXX</small>
                </div>

                {otpSent && !otpVerified && (
                    <div className="form-group">
                        <label htmlFor="otp">OTP Code</label>
                        <div className="otp-input-group">
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                placeholder="Enter OTP"
                                maxLength={6}
                            />
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                className="verify-button"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                )}

                {otpVerified && (
                    <>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </>
                )}

                {otpVerified && (
                    <button type="submit" className="auth-button">Register</button>
                )}
            </form>
        </div>
    );
}; 