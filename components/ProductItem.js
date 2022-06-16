/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'

export default function ProductItem({product}) {
  return (
    <div>
        <Link href={`/product/${product.slug}`}>
            <a>
                <img
                    src={product.image}
                    alt={product.name}
                    className="shadow"
                />
            </a>
        </Link>
        <div className='flex flex-col items-center justify-center p-5'>
            <Link href={`/product/${product.slug}`}>
            <a>
                <h2>{product.name}</h2>
            </a>
            </Link>
            <p>{product.price}</p>
        </div>
    </div>
  )
}
