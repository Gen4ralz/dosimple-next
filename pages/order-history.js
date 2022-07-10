import axios from 'axios'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useReducer } from 'react'
import Layout from '../components/Layout'
import { getError } from '../utils/error'

function OrderHistoryScreen() {

    function reducer (state, action){
        switch (action.type){
            case 'FETCH_REQUEST':
                return { ...state, loading: true, error: '' }
            case 'FETCH_SUCCESS':
                return { ...state, loading: false, orders:action.payload, error: '' }
            case 'FETCH_FAIL':
                return { ...state, loading: false, error:action.payload }
            default:
                return state;
        }
    } 
    const {data: session} = useSession();
    const [{ loading, orders, error },dispatch] = useReducer(reducer, { loading: true, orders:[], error: '', })

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' })
                const { data } = await axios.get(`/api/orders/history`);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
            }
        }
        fetchOrder();
    }, [])
  return (
    <Layout title='Order History'>
        <h1 className='font-bold mb-5 text-xl'>Order History ({session.user.name})</h1>
        {loading ? (
            <div>Loading...</div>
        ) : error ? (
            <div className='alert-error'>{error}</div>
        ) : (
            <div className='overflow-x-auto'>
                <table className='min-w-full'>
                    <thead className='border-b'>
                        <tr>
                            <th className='text-xs'>ID</th>
                            <th className='text-xs'>DATE</th>
                            <th className='text-xs'>TOTAL</th>
                            <th className='text-xs'>PAID</th>
                            <th className='text-xs'>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className='border-b'>
                                <td className='p-1 text-xs text-center'>{order._id.substring(20, 24)}</td>
                                <td className='p-5 text-xs text-center'>{order.createdAt.substring(0, 10)}</td>
                                <td className='p-1 text-xs text-center'>{order.totalPrice}</td>
                                <td className='p-6 text-xs text-center'>
                                    {order.isPaid ? <div className='text-green-700 text-center'>{order.paidAt.substring(0, 10)}</div> : <p className='text-red-700 text-center'>not paid</p>}
                                </td>
                                <td className='p-2 text-xs text-center'>
                                    <Link href={`/order/${order._id}`}><button className='bg-black p-1 text-white rounded'>Details</button></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </Layout>
  )
}
OrderHistoryScreen.auth =true;
export default OrderHistoryScreen;
