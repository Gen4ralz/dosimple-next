import Link from "next/link";
import { useContext } from "react";
import Layout from "../components/Layout";
import { Store } from "../utils/Store";
import { XCircleIcon } from '@heroicons/react/outline'
import Image from "next/image";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';

function CartScreen() {
    const router = useRouter();
    const {state, dispatch} = useContext(Store);
    const {cart: {cartItems}} = state;
    const removeItemHandler = (item) => {
        dispatch({type: 'CART_REMOVE_ITEM', payload: item});
    };
    const updateCartHandler = (item, qty) => {
        const quantity = Number(qty);
        dispatch({type:'CART_ADD_ITEM', payload:{...item, quantity}})
    }
    return (
        <Layout title="Shopping Cart">
            <h1 className="mb-4 text-lg font-bold">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div>
                    Cart is empty. <Link href='/'><button className="bg-green-100 px-2 rounded">Go shopping</button></Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-4 md:gap-5">
                    <div className="overflow-x-auto md:col-span-3">
                        <table className="min-w-full">
                            <thead className="border-b">
                                <tr>
                                    <th className="p-5 text-left">Item</th>
                                    <th className="p-5">Quantity</th>
                                    <th className="p-5">Price</th>
                                    <th className="p-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.slug} className="border-b">
                                        <td>
                                            <Link href={`/product/${item.slug}`}>
                                                <a className="flex items-center p-4">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={100}
                                                        height={125}
                                                    ></Image>
                                                </a>
                                            </Link>
                                        </td>
                                        <td className="p-5 text-center">
                                            <select value={item.quantity} onChange={(e) => updateCartHandler(item, e.target.value)}>
                                            {[...Array(item.stock).keys()].map(x => (
                                                    <option key={x+1} value={x+1}>
                                                        {x+1}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-5 text-center">{item.price}</td>
                                        <td className="p-5 text-right"><button onClick={() => removeItemHandler(item)}><XCircleIcon className="h-5 w-5 items-center stroke-red-500"></XCircleIcon></button></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td>{}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="card p-5 mt-5">
                        <ul>
                            <li>
                                <div className="pb-3 text-md font-bold">
                                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}) : &nbsp;
                                    {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)} Baht
                                </div>
                            </li>
                            <li>
                                <button onClick={() => router.push('login?redirect=/shipping')} className="bg-indigo-700 rounded p-2 text-white w-full">
                                    Check Out
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr:false })