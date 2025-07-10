import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaCreditCard } from 'react-icons/fa';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import useAuth from "../Auth/useAuth";

const fetchScholarshipDetails = async (id) => {
    const res = await axiosSecure.get(`/scholarship/${id}`);
    return res.data;
};

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { id } = useParams();
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth()
    // Fetch scholarship details
    const { data: scholarship, isLoading, isError } = useQuery({
        queryKey: ['scholarshipDetails', id],
        queryFn: () => fetchScholarshipDetails(id),
        enabled: !!id,
    });

    // Calculate amount (applicationFees + serviceCharge)
    const amount = scholarship ? (parseInt(scholarship.applicationFees) + parseInt(scholarship.serviceCharge)) : 0;

    useEffect(() => {
        if (!amount || !id) return;
        axios.post("http://localhost:5000/create-payment-intent", { amount })
            .then((res) => {
                setClientSecret(res.data.clientSecret);
            });
    }, [amount, id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!stripe || !elements) return;

        const card = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: user.displayName,
                    email : user.email , 
                },
            },
        });

        if (confirmError) {
            setError(confirmError.message);
        } else if (paymentIntent.status === "succeeded") {
            setSuccess("✅ Payment successful!");
        }
        setLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (isError || !scholarship) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Failed to load payment details.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br w-full from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-2">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-white/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <FaCreditCard className="text-white text-3xl" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">Checkout</h2>
                    <p className="text-gray-500 text-center mb-2">Enter your card details to complete your payment securely.</p>
                    <div className="text-lg font-bold text-gray-900 mt-2">Amount: <span className="text-blue-600">${amount}</span> USD</div>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Details</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <CardElement options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#1e293b',
                                        '::placeholder': { color: '#94a3b8' },
                                        fontFamily: 'inherit',
                                    },
                                    invalid: { color: '#e11d48' },
                                },
                            }} />
                        </div>
                    </div>
                    {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
                    {success && <div className="text-green-600 text-sm font-semibold text-center">{success}</div>}
                    <button
                        type="submit"
                        disabled={!stripe || !clientSecret || loading}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? 'Processing...' : 'Pay'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
