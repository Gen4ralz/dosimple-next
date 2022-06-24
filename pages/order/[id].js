import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import { getError } from "../../utils/error";
import Link from 'next/link';
import Image from "next/image";
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from "react-toastify";

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
  
      default:
        state;
    }
  }

function OrderScreen() {
    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
    const { query } = useRouter();
    const orderId = query.id;

    const [{ loading, error, order, successPay, loadingPay }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
    });

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
        deliverdAt 
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
                                        <div className="px-2">Total</div>
                                        <div className="px-2">{totalPrice} Baht</div>
                                    </div>
                                </li>
                                {!isPaid && (
                                <li>
                                    {isPending ? (
                                    <div>Loading...</div>
                                    ) : (
                                        <div className="w-full">
                                        <PayPalButtons
                                            createOrder={createOrder}
                                            onApprove={onApprove}
                                            onError={onError}
                                        ></PayPalButtons>
                                        </div>
                                    )}
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