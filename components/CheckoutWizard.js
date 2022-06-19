import React from 'react'

export default function CheckoutWizard({ activeStep = 0 }) {
  return (
    <div className='mb-5 flex flex-warp'>
        {['User Login', 'Payment Method', 'Shipping Address', 'Place Order'].map(
        (step, index) => (
          <div
            key={step}
            className=  {`flex-1 border-b-2 shadow  text-center 
                            ${ index === activeStep
                            ? 'border-indigo-700   text-white bg-indigo-700'
                            : 'border-gray-400 text-gray-400'
                            }  
                        `}
          >
            {step}
          </div>
        )
      )}
    </div>
  );
}