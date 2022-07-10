/* eslint-disable react/no-unknown-property */
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { getError } from "../../utils/error";
import Link from 'next/link';
import Image from "next/image";
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from "react-toastify";
import { DuplicateIcon } from '@heroicons/react/outline'


function reducer(state, action) {
    switch (action.type) {
      case 'FETCH_REQUEST':
        return { ...state, loading: true, error: '' };
      case 'FETCH_SUCCESS':
        return { ...state, loading: false, order: action.payload, error: '' };
      case 'FETCH_FAIL':
        return { ...state, loading: false, error: action.payload };
      case 'PAY_REQUEST':
        return { ...state, loadingPay: true };
      case 'PAY_SUCCESS':
        return { ...state, loadingPay: false, successPay: true };
      case 'PAY_FAIL':
        return { ...state, loadingPay: false, errorPay: action.payload };
      case 'PAY_RESET':
        return { ...state, loadingPay: false, successPay: false, errorPay: '' };
      case 'UPLOAD_REQUEST':
        return { ...state, loadingUpload: true, errorUpload: '' }
      case 'UPLOAD_SUCCESS':
        return { ...state, loadingUpload: false, errorUpload: ''}
      case 'UPLOAD_FAIL':
        return { ...state, loadingUpload: false, errorUpload: action.payload };
      default:
        state;
    }
  }

function OrderScreen() {
    const [{isPending}, paypalDispatch ] = usePayPalScriptReducer();
    const { query } = useRouter();
    const orderId = query.id;

    const [{ loading, error, order, successPay, loadingPay, loadingUpload }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
    });

    const uploadHandler = async (e) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post(`/api/orders/upload`, bodyFormData, {
                headers: {'Content-Type': 'multipart/form-data',}
            });
            dispatch ({ type: 'UPLOAD_SUCCESS' })
            toast.success('Slip uploaded successfully');
        }catch (err) {
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) })
        }
    }

    const copyToclipboard = () => {
        navigator.clipboard.writeText('0748218947')
        toast.success('Copied!');
    }

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' })
                const { data } = await axios.get(`/api/orders/${orderId}`);
                dispatch({ type: 'FETCH_SUCCESS', payload: data })
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
            }
        };
        if (!order._id || successPay ||(order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                dispatch({ type: 'PAY_RESET' });
            }
        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal');
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'client-id': clientId,
                        currency: 'THB',
                    },
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending'})
            };
            loadPaypalScript();
        }
    }, [order, orderId, paypalDispatch, successPay])
    
    const { 
        shippingAddress, 
        paymentMethod, 
        orderItems, 
        itemsPrice, 
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt,
        isDelivered,
        deliverdAt,
    } = order;

function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

function onApprove(data, actions) {
    // commit the payment
    return actions.order.capture().then(async function (details) {
        try{
            dispatch({ type: 'PAY_REQUEST' }); //show loading message
            const { data } = await axios.put(`/api/orders/${order._id}/pay`, details);
            dispatch({ type: 'PAY_SUCCESS', payload: data });
            toast.success('Order is paid successfully')
        } catch (err) {
            dispatch({ type: 'PAY_FAIL', payload: getError(err) });
            toast.error(getError(err));
        }
    })}

function onError(err){
    toast.error(getError(err))
} 

    return (
        <Layout title={`Order ${orderId}`}>
            <h1 className="mb-4 text-md font-bold">{`Order : ${orderId}`}</h1>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="alert-error">{error}</div>
            ) : (
                <div className="grid md:grid-cols-4 md:gap-5">
                    <div className="overflow-x-auto md:col-span-3">
                        <div className="card p-5">
                            <h2 className="font-bold mb-4">Shipping Address</h2>
                            <div className="px-4">
                                <p>{shippingAddress.fullName}</p> 
                                <p>{shippingAddress.address}</p>
                                <p>{shippingAddress.phone}</p>
                            </div>
                            {isDelivered ? (
                                <div className="alert-success text-center">Delivered at {deliverdAt}</div>
                            ) : (
                                <div className="alert-error text-center">Not delivered</div>
                            )}
                        </div>

                    <div className="card p-5">
                        <h2 className="mb-4 text-md font-bold">Payment Method</h2>
                        <div className="px-4">{paymentMethod}</div>
                            {isPaid ? (
                        <div className="alert-success text-center">Paid at {paidAt}</div>
                        ) : (
                        <div className="alert-error text-center">Not paid</div>
                        )}
                    </div>

                    <div className="card overflow-x auto p-5">
                            <h2 className="font-bold mb-4">Order Items</h2>
                            <table className='min-w-full'>
                                <thead className='border-b'>
                                    <tr>
                                        <th className='px-8 text-md text-left'>Item</th>
                                        <th className='text-center p-2'>Quantity</th>
                                        <th className='text-right p-2'>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item) => (
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
                        </div>
                    </div>
            
                    <div>
                        <div className="card p-5">
                            <h2 className="font-bold mb-4">Order Summary</h2>
                            <ul>
                                <li>
                                    <div className="mb-2 flex justify-between">
                                        <div className="px-2">Items</div>
                                        <div className="px-2">{itemsPrice} Baht</div>
                                    </div>
                                </li>
                                <li>
                                    <div className="mb-2 flex justify-between">
                                        <div className="px-2">Shipping</div>
                                        <div className="px-2">{shippingPrice} Baht</div>
                                    </div>
                                </li>
                                <li>
                                    <div className="mb-2 flex justify-between">
                                        <div className="px-2 font-bold ">Total</div>
                                        <div className="px-2 font-bold ">{totalPrice} Baht</div>
                                    </div>
                                </li>
                                {!isPaid && (
                                <li>
                                    { paymentMethod === 'PayPal' && (
                                        <div>
                                            {isPending 
                                            ? <div>Loading...</div> 
                                            :                                          
                                            <div className="w-full">
                                            <PayPalButtons
                                            createOrder={createOrder}
                                            onApprove={onApprove}
                                            onError={onError}
                                            ></PayPalButtons>
                                            </div>}
                                        </div>
                                    )
                                    }
                                    { paymentMethod === 'Bank Transfer'
                                        ?
                                            <>
                                            <div className="card-ex py-4">
                                                <div className="flex justify-center">
                                                    <div>
                                                        <Image src='/images/kbank.png' alt='Kbank' width={50} height={50} />
                                                    </div>
                                                    <div className="ml-8">
                                                    <p>KASIKORN BANK</p>
                                                    <div className="flex items-center">
                                                        <p className="font-bold text-green-700 text-xl py-2 mr-8">0748218947</p>
                                                        <span>
                                                            <button onClick={copyToclipboard}>
                                                                <DuplicateIcon width={30} height={30} />
                                                            </button>
                                                        </span>
                                                    </div>
                                                    <p className="text-xs">Nattapong Panyaakratham</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-ex mt-4">
                                                <p className="font-bold p-2">Proof of Payment</p>
                                                <div className="flex justify-center items-center w-full">
                                                    <label htmlFor="dropzone-file" className="flex flex-col w-full m-4 justify-center items-center bg-indigo-300 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-indigo-800">
                                                    <div className="flex flex-col justify-center items-center py-4 px-4">
                                                        <svg className="mb-3 w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                                    </div>
                                                    <input id="dropzone-file" type="file" className="hidden" onChange={uploadHandler} />
                                                    </label>
                                                    {loadingUpload && <div>...Loading</div>}
                                                </div>
                                            </div>
                                            </>
                                        : null
                                    }
                                    {loadingPay && <div>Loading...</div>}
                                </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

OrderScreen.auth = true;
export default OrderScreen;