import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useState, useRef } from "react";
import axios from "axios";
import { FaCreditCard } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosSecure from '../Axios/axiosSecure';
import useAuth from "../Auth/useAuth";
import Swal from "sweetalert2";
import { useForm } from 'react-hook-form';


const fetchScholarshipDetails = async (id) => {
    const res = await axiosSecure.get(`/scholarship/${id}`);
    return res.data;
};
// Photo upload function
const onPhotoChange = async (imgFile) => {  // এখানে শুধু ফাইল নেবে
    if (!imgFile) return;

    const formData = new FormData();
    formData.append('image', imgFile);

    const api_key = import.meta.env.VITE_IBB_API_KEY;
    const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${api_key}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return res.data.data.display_url; // image url return করবে
};
const createPaymentIntent = async (amount) => {
    const res = await axios.post("http://localhost:5000/create-payment-intent", { amount });
    return res.data;
};
// applyScholarship ফাংশনে যেটা পরিবর্তন করতে হবে:
const applyScholarship = async ({ data, scholarship, user }) => {
    // এখানে data.photo একটা array বা FileList, তাই প্রথম ফাইল নিতে হবে
    const imgURL = await onPhotoChange(data.photo[0]);
    const applicationData = {
        phone: data.phone,
        photo: imgURL,
        address: data.address,
        gender: data.gender,
        degree: data.degree,
        ssc: data.ssc,
        hsc: data.hsc,
        studyGap: data.studyGap,
        university: scholarship.universityName,
        scholarshipCategory: scholarship.category,
        subjectCategory: scholarship.subjectCategory,
        userName: user.displayName,
        userEmail: user.email,
        userId: user._id || user.uid || '',
        scholarshipId: scholarship._id,
        date: new Date().toISOString(),
        status: 'pending', // Add default status
        applicationFees: scholarship.applicationFees, // Added
        serviceCharge: scholarship.serviceCharge      // Added
    };


    const res = await axiosSecure.post('/applied-scholarship', applicationData);

    return res.data;
};


const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { id } = useParams();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const fileInputRef = useRef();
    const { register, handleSubmit: rhfHandleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
    const watchedPhoto = watch('photo');
    const navigate = useNavigate()
    // Fetch scholarship details
    const { data: scholarship, isLoading, isError, refetch: refetchScholarship } = useQuery({
        queryKey: ['scholarshipDetails', id],
        queryFn: () => fetchScholarshipDetails(id),
        enabled: !!id,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    // Calculate amount (applicationFees + serviceCharge)
    const amount = scholarship ? (parseInt(scholarship.applicationFees) + parseInt(scholarship.serviceCharge)) : 0;

    // Payment intent query
    const { data: paymentIntentData, isLoading: isPaymentLoading, refetch: refetchPayment } = useQuery({
        queryKey: ['paymentIntent', amount, id],
        queryFn: () => createPaymentIntent(amount),
        enabled: !!amount && !!id,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
    const clientSecret = paymentIntentData?.clientSecret || '';

    // Mutation for applying scholarship
    const applyMutation = useMutation({
        mutationFn: ({ data, scholarship, user  }) => applyScholarship({ data, scholarship, user }),
        onSuccess: (data) => {
            setShowModal(false);
            reset();
            if (fileInputRef.current) fileInputRef.current.value = '';
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Applied successfully!",
                showConfirmButton: false,
                timer: 1500
            });
            refetchScholarship();
            refetchPayment();
        },
        onError: (err) => {
            console.log(err.message);

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.message || err.message,
            });
        },
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        const card = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card,
        });
        if (error) {
            window.alert(error.message);
            return;
        }
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: user.displayName,
                    email: user.email,
                },
            },
        });
        if (confirmError) {
            window.alert(confirmError.message);
        } else if (paymentIntent.status === "succeeded") {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Payment Successfully Done",
                showConfirmButton: false,
                timer: 1500
            });
            // Update paymentStatus and paidBy in scholarship collection
            try {
                await axiosSecure.patch(`/scholarship/${id}`, { paymentStatus: 'paid', paidBy: user.email });
            } catch (err) {
                console.error('Failed to update paymentStatus:', err);
            }
            setShowModal(true);     
        }
    };

    // Modal form handlers
    const handleFileChange = (e) => {
        setValue('photo', e.target.files);
    };

    const onModalFormSubmit = async (data) => {
        if (applyMutation.isLoading) return; // Prevent double submit
        applyMutation.mutate({ data, scholarship, user }, {
            onSuccess: () => {
                setShowModal(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Application submitted successfully!',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                refetchScholarship();
                refetchPayment();
            },
            onError: (err) => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to submit application',
                    text: err?.response?.data?.message || err.message,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    if (isLoading || isPaymentLoading) {
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
                    {applyMutation.isError && <div className="text-red-500 text-sm font-semibold text-center">Error: {applyMutation.error.message}</div>}
                    {applyMutation.isSuccess && <div className="text-green-600 text-sm font-semibold text-center">Payment successful!</div>}
                    <button
                        type="submit"
                        disabled={!stripe || !clientSecret || applyMutation.isLoading }
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-lg"
                    >
                        {applyMutation.isLoading ? 'Processing...' : 'Pay'}
                    </button>
                </form>
            </div>
            {/* Modal for applicant info */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/20 bg-opacity-40">
                    <div className="relative w-full max-w-lg mx-2 bg-white rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-3xl font-bold focus:outline-none"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-blue-700 text-center">Applicant Information</h3>
                        <form className="space-y-4" onSubmit={rhfHandleSubmit(onModalFormSubmit)}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input type="text" {...register('phone', { required: 'Phone number is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Photo</label>
                                <label className="flex items-center justify-center w-full px-4 py-2 bg-white border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                    <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75M12 17v-6m0 0l-3 3m3-3l3 3" /></svg>
                                    <span className="text-blue-600 font-semibold">{watchedPhoto ? (watchedPhoto.name || 'Photo Selected') : 'Upload Photo'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {errors.photo && <span className="text-red-500 text-xs">Photo is required</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Address (village, district, country)</label>
                                <input type="text" {...register('address', { required: 'Address is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                <select {...register('gender', { required: 'Gender is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Applying Degree</label>
                                <select {...register('degree', { required: 'Degree is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                                    <option value="">Select</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelor">Bachelor</option>
                                    <option value="Masters">Masters</option>
                                </select>
                                {errors.degree && <span className="text-red-500 text-xs">{errors.degree.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">SSC Result</label>
                                <input type="text" {...register('ssc', { required: 'SSC result is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                {errors.ssc && <span className="text-red-500 text-xs">{errors.ssc.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">HSC Result</label>
                                <input type="text" {...register('hsc', { required: 'HSC result is required' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                {errors.hsc && <span className="text-red-500 text-xs">{errors.hsc.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Study Gap (optional)</label>
                                <select {...register('studyGap')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                                    <option value="">No Gap</option>
                                    <option value="1 year">1 year</option>
                                    <option value="2 years">2 years</option>
                                    <option value="3+ years">3+ years</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                                <input type="text" value={scholarship.universityName} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Scholarship Category</label>
                                <input type="text" value={scholarship.category} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Category</label>
                                <input type="text" value={scholarship.subjectCategory} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100" />
                            </div>
                            <button
                                type="submit"
                                disabled={applyMutation.isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {applyMutation.isLoading ? 'Submitting...' : 'Submit/Apply'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutForm;
