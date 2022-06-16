import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import Layout from '../../components/Layout'
import data from '../../utils/data';
import Link from 'next/link';
import Image from 'next/image';
import { Store } from '../../utils/Store';

export default function ProductScreen() {
    const router = useRouter();
    const {state, dispatch} = useContext(Store);
    const {query} = useRouter();
    const {slug} = query;
    const product = data.products.find(x => x.slug === slug);
    if(!product){
        return <div>Product Not Found</div>
    }
    const addToCartHandler = () => {
        const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        if(product.stock < quantity) {
            alert('Sorry. Product is out of stock');
            return;
        }
        dispatch({type: 'CART_ADD_ITEM', payload: {...product, quantity}})
        router.push('/cart')
    }
  return (
    <Layout title={product.name}>
        <div className='py-2'>
            <Link href='/'>Back to products</Link>
        </div>
        <div className='grid md:grid-cols-4 md:gap-3'>
            <div className='md:col-span-2 mb-4'>
                <Image
                    src={product.image}
                    alt={product.name}
                    width={1080}
                    height={1350}
                    layout="responsive"
                ></Image>
            </div>
            <div>
                <ul>
                    <li><h1 className='text-lg'>{product.name}</h1></li>
                    <li>Brand: {product.brand}</li>
                    <li>Description: {product.description}</li>
                </ul>
            </div>
            <div className='mt-5'>
                <div className='card p-5'>
                    <div className='mb-2 flex justify-between'>
                        <div>Price</div>
                        <div>{product.price}</div>
                    </div>
                    <div className='mb-2 flex justify-between'>
                        <div>Status</div>
                        <div>{product.stock > 0 ? 'In stock' : 'Out of stock'}</div>
                    </div>
                    <button className='bg-indigo-700 w-full rounded py-2 px-4 text-white' onClick={addToCartHandler}>Add to cart</button>
                </div>
            </div>
        </div>
    </Layout>
  )
}
