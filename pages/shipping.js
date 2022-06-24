import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';

export default function ShippingScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;
  const router = useRouter();

  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('phone', shippingAddress.phone);
  }, [setValue, shippingAddress]);

  const submitHandler = ({ fullName, address, phone }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: { fullName, address, phone},
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          address,
          phone,
        },
      })
    );

    router.push('/placeorder');
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={2} />
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl font-bold">Shipping Address</h1>
        <div className="mb-4">
          <label htmlFor="fullName">Full Name</label>
          <input
            className="w-full"
            id="fullName"
            autoFocus
            {...register('fullName', {
              required: 'Please enter full name',
            })}
          />
          {errors.fullName && (
            <div className="text-red-500">{errors.fullName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="address">Address</label>
          <input
            className="w-full"
            id="address"
            {...register('address', {
              required: 'Please enter address',
              minLength: { value: 5, message: 'Address is more than 5 chars' },
              
            })}
          />
          {errors.address && (
            <div className="text-red-500">{errors.address.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="city">Phone</label>
          <input
            className="w-full"
            id="phone"
            {...register('phone', {
              required: 'Please enter phone number',
            })}
          />
          {errors.phone && (
            <div className="text-red-500 ">{errors.phone.message}</div>
          )}
        </div>
        <div className="flex justify-between">
          <button type='button' className='rounded bg-gray-400 text-white px-8 py-2 mt-4' onClick={() => router.push('/payment')}>
                    Back
          </button>
          <button className="bg-indigo-700 text-white rounded px-8 py-2 mt-4">Next</button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;