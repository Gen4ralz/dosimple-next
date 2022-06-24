import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard'
import Layout from '../components/Layout'
import { Store } from '../utils/Store';

export default function PaymentScreen() {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const router = useRouter();
    const {state, dispatch} = useContext(Store);
    const {cart} = state;
    const { paymentMethod } = cart;
    const submitHandler = (e) => {
        e.preventDefault();
        if (!selectedPaymentMethod) {
            return toast.error('Payment method is required');
        }
        dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: selectedPaymentMethod });
        Cookies.set('cart', JSON.stringify({...cart, paymentMethod: selectedPaymentMethod,}));
        router.push('/shipping')
    }
    useEffect(() => {
        setSelectedPaymentMethod(paymentMethod || '');
      }, [paymentMethod, router,]);
  return (
    <Layout title="Payment Method">
        <CheckoutWizard activeStep={1} />
        <form className='mx-auto max-w-screen-md' onSubmit={submitHandler}>
            <h1 className='font-bold text-xl mb-4'>Payment Method</h1>
            {['Bank Transfer', 'Cash On Delivery', 'Crypto Currencies', 'PayPal'].map((payment) => (
                <div key={payment} className="mb-6 card py-5 px-4">
                    <input
                        name='paymentMethod'
                        className='p-2 outline-none focus:ring-0 '
                        id={payment}
                        type="radio"
                        checked={selectedPaymentMethod === payment}
                        onChange={() => setSelectedPaymentMethod(payment)}
                    ></input>
                    <label className='p-2' htmlFor={payment}>
                        {payment}
                    </label>
                </div>
            ))}
            <div className='mt-8 flex justify-between'>
                <button className='w-full rounded bg-indigo-700 text-white px-8 py-2'>
                    Next
                </button>
            </div>
        </form>
    </Layout>
  )
}

PaymentScreen.auth = true;
