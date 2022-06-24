import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';

export default function Home(props) {
  const {products} = props;
  return (
    <div>
      <Layout title="Home Page">
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {products.map((product) => (
            <ProductItem product={product} key={product.slug}></ProductItem>
          ))}
        </div>
      </Layout>
    </div>
  )
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  await db.disconnect();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    }
  }
}