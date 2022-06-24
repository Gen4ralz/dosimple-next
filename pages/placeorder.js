import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import CheckoutWizard from '../components/CheckoutWizard'
import Layout from '../components/Layout'
import { Store } from '../utils/Store'
import axios from 'axios';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { getError } from '../utils/error'
import { useRouter } from 'next/router'

export default function PlaceOrderScreen() {
    const { state, dispatch } = useContext(Store);
    const { cart } = state;
    const { cartItems, shippingAddress, paymentMethod } = cart;
    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
    const itemsPrice = round2(cartItems.reduce((a, c) => a + c.quantity * c.price, 0))
    const shippingPrice = 0;
    const totalPrice = round2(itemsPrice + shippingPrice);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if(!shippingAddress) {
            router.push('/shipping')
        }
    }, [router, shippingAddress])

    const placeOrderHandler = async () => {
        try{
            setLoading(true);
            const { data } = await axios.post(`api/orders`, {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
            })
            setLoading(false);
            dispatch({ type: 'CART_CLEAR_ITEMS' });
            Cookies.set( 'cart', JSON.stringify({...cart, cartItems: []}));
            router.push(`/order/${data._id}`);
        } catch (err) {
            setLoading(false);
            toast.error(getError(err));
        }
    }
  return (
    <Layout title="Place Order">
        <CheckoutWizard activeStep={3} />
            <h1 className='mb-4 text-xl font-bold'>Place Order</h1>
            {cartItems.length === 0 ? (
                <div>
                    Cart is empty. <Link href="/">Go shopping</Link>
                </div>
            ) : (
                <div className='grid md:grid-cols-4 md:gap-5'>
                    <div className='overflow-x-auto md:col-span-3'>
                        <div className='p-5 card'>
                            <h2 className='mb-4 text-md font-bold'>Payment Method</h2>
                            <div className='px-4 mb-4 flex justify-between'>
                                <p className='text-md'>{paymentMethod}</p>
                                <Link href='/payment'><button className='bg-pink-500 rounded text-white px-2 font-bold text-xs'>Edit</button></Link>
                            </div>
                        </div>
                        <div className='p-5 card'>
                            <h2 className='mb-4 text-md font-bold'>Order Items</h2>
                            <table className='min-w-full'>
                                <thead className='border-b'>
                                    <tr>
                                        <th className='px-8 text-md text-left'>Item</th>
                                        <th className='text-center p-2'>Quantity</th>
                                        <th className='text-right p-2'>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                    <tr key={item._id} className="border-b">
                                        <td>
                                            <Link href={`/product/${item.slug}`}>
                                            <a className='flex items-center'>
                                                <Image src={item.image} alt={item.name} width={50} height={50}></Image>
                                                &nbsp; <p className='text-md'>{item.name}</p>
                                            </a></Link>
                                        </td>
                                        <td className='text-center'>{item.quantity}</td>
                                        <td className='text-right p-2'>{item.price}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className='mt-4 flex justify-between'>
                                <div><Link href='/cart'><button className='bg-pink-500 rounded text-white px-2 font-bold text-xs py-1'>Edit</button></Link></div>
                                <div className='flex'>
                                <p className='font-bold'>Total: &nbsp;</p><p>{totalPrice} Baht</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='card p-5'>
                                <h2 className='mb-2 text-md font-bold'>Order Summary</h2>
                                <ul>
                                    <li>
                                        <div className='mb-2 flex justify-between'>
                                            <div>Items</div>
                                            <div>{itemsPrice}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='mb-2 flex justify-between'>
                                            <div>Shipping</div>
                                            <div>{shippingPrice}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='mb-2 flex justify-between'>
                                            <div>Total</div>
                                            <div>{totalPrice} Baht</div>
                                        </div>
                                    </li>
                                    <li>
                                        <button
                                            disabled={loading}
                                            onClick={placeOrderHandler}
                                            className='w-full bg-indigo-700 rounded p-2 text-white'>
                                            {loading ? 'Loading...' : "Place Order"}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    </Layout>
  )
}

PlaceOrderScreen.auth = true;

